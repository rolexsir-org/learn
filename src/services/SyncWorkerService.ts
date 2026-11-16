/**
 * SyncWorkerService - Native Offline-First Firestore Background Sync Worker
 * 
 * Automatically queues progress updates, word completions, stats, and rewards
 * when the device is offline or on unstable networks, and drains the sync queue
 * to Firestore as soon as a reliable cellular or Wi-Fi connection is detected.
 */

import { doc, setDoc, increment } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { StorageService } from './StorageService';
import { AnalyticsService } from './AnalyticsService';

export interface PendingSyncItem {
  id: string;
  type: 'UPDATE_USER_STATS' | 'WORD_PROGRESS' | 'DAILY_CLAIM' | 'UNLOCK_CHARACTER' | 'CHECKPOINT_STATE';
  userId: string;
  payload: Record<string, any>;
  createdAt: number;
  attempts: number;
}

export interface SyncWorkerStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  lastError: string | null;
}

class NativeSyncWorkerService {
  private queueKey = 'offline_firestore_sync_queue_v1';
  private syncQueue: PendingSyncItem[] = [];
  private isOnline = true;
  private isSyncing = false;
  private lastSyncedAt: number | null = null;
  private lastError: string | null = null;
  private statusListeners: Set<(status: SyncWorkerStatus) => void> = new Set();
  private retryTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadQueueFromStorage();
    this.initNetworkListeners();
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.lastError = null;
      this.notifyStatusChange();
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatusChange();
    });

    setInterval(() => {
      const currentOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (currentOnline !== this.isOnline) {
        this.isOnline = currentOnline;
        if (this.isOnline) this.lastError = null;
        this.notifyStatusChange();
        if (this.isOnline && this.syncQueue.length > 0) {
          this.triggerBackgroundSync();
        }
      } else if (this.isOnline && this.syncQueue.length > 0 && !this.isSyncing) {
        this.triggerBackgroundSync();
      }
    }, 15000);
  }

  private loadQueueFromStorage() {
    try {
      const raw = StorageService.getItemSync(this.queueKey);
      if (raw) {
        this.syncQueue = Array.isArray(raw) ? raw : [];
      }
    } catch (e) {
      this.syncQueue = [];
    }
  }

  private saveQueueToStorage() {
    try {
      StorageService.setItem(this.queueKey, this.syncQueue);
      this.notifyStatusChange();
    } catch (e) {
      // Ignore
    }
  }

  public enqueue(
    type: PendingSyncItem['type'],
    payload: Record<string, any>,
    userId?: string
  ): void {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) return;

    const item: PendingSyncItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      userId: targetUserId,
      payload,
      createdAt: Date.now(),
      attempts: 0
    };

    this.syncQueue.push(item);
    this.saveQueueToStorage();

    if (this.isOnline) {
      this.triggerBackgroundSync();
    }
  }

  public async triggerBackgroundSync(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0 || !this.isOnline) {
      return;
    }

    this.isSyncing = true;
    this.notifyStatusChange();

    while (this.syncQueue.length > 0 && this.isOnline) {
      const item = this.syncQueue[0];

      try {
        await this.processItem(item);
        this.syncQueue.shift();
        this.saveQueueToStorage();
        this.lastSyncedAt = Date.now();
        this.lastError = null;
      } catch (error: any) {
        item.attempts += 1;
        this.lastError = error?.message || 'Sync failed';

        AnalyticsService.logError('sync_failure', this.lastError || 'Unknown', item.type);

        if (item.attempts >= 5) {
          this.syncQueue.shift();
          this.saveQueueToStorage();
        } else {
          break;
        }
      }
    }

    this.isSyncing = false;
    this.notifyStatusChange();

    if (this.syncQueue.length > 0 && this.isOnline) {
      if (this.retryTimer) clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => {
        this.triggerBackgroundSync();
      }, 10000);
    }
  }

  private async processItem(item: PendingSyncItem): Promise<void> {
    const { type, userId, payload } = item;
    const userRef = doc(db, 'users', userId);

    switch (type) {
      case 'UPDATE_USER_STATS': {
        const updates: Record<string, any> = {};
        if (typeof payload.starsIncrement === 'number') updates.totalStars = increment(payload.starsIncrement);
        if (typeof payload.coinsIncrement === 'number') updates.coins = increment(payload.coinsIncrement);
        if (payload.lastRewardClaimed) updates.lastRewardClaimed = payload.lastRewardClaimed;
        if (payload.unlockedCharacters) updates.unlockedCharacters = payload.unlockedCharacters;
        if (payload.claimedQuests) updates.claimedQuests = payload.claimedQuests;
        if (typeof payload.timeSpent === 'number') updates.timeSpent = increment(payload.timeSpent);

        await setDoc(userRef, updates, { merge: true });
        break;
      }

      case 'WORD_PROGRESS': {
        const progressRef = doc(db, 'users', userId, 'progress', payload.wordId);
        await setDoc(progressRef, {
          word: payload.wordId,
          accuracy: payload.accuracy,
          attempts: increment(1),
          isMastered: true,
          lastPracticed: payload.lastPracticed || new Date().toISOString()
        }, { merge: true });

        const userUpdates: Record<string, any> = {
          totalStars: increment(1),
          coins: increment(payload.coinBonus || 5)
        };
        if (payload.currentWorldId) userUpdates.currentWorldId = payload.currentWorldId;
        if (typeof payload.activeWordIndex === 'number') userUpdates.activeWordIndex = payload.activeWordIndex;

        await setDoc(userRef, userUpdates, { merge: true });
        break;
      }

      case 'DAILY_CLAIM': {
        await setDoc(userRef, {
          coins: increment(payload.coinsBonus || 50),
          totalStars: increment(payload.starsBonus || 5),
          lastRewardClaimed: payload.timestamp || new Date().toISOString()
        }, { merge: true });
        break;
      }

      case 'UNLOCK_CHARACTER': {
        await setDoc(userRef, {
          unlockedCharacters: payload.unlockedCharacters,
          coins: payload.remainingCoins
        }, { merge: true });
        break;
      }

      case 'CHECKPOINT_STATE': {
        const checkpoint: Record<string, any> = {};
        if (payload.currentWorldId) checkpoint.currentWorldId = payload.currentWorldId;
        if (typeof payload.activeWordIndex === 'number') checkpoint.activeWordIndex = payload.activeWordIndex;
        if (payload.activeNavTab) checkpoint.activeNavTab = payload.activeNavTab;
        if (typeof payload.soundEnabled === 'boolean') checkpoint.soundEnabled = payload.soundEnabled;

        await setDoc(userRef, checkpoint, { merge: true });
        break;
      }
    }
  }

  public subscribeStatus(callback: (status: SyncWorkerStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public getStatus(): SyncWorkerStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.syncQueue.length,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError
    };
  }

  private notifyStatusChange() {
    const status = this.getStatus();
    this.statusListeners.forEach((listener) => listener(status));
  }
}

export const SyncWorkerService = new NativeSyncWorkerService();

