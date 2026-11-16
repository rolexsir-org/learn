import { Preferences } from '@capacitor/preferences';

const STORAGE_SCHEMA_VERSION = 1;
const SCHEMA_KEY = 'app_storage_schema_version';

export interface UserProgressData {
  stars: number;
  coins: number;
  streak: number;
  wordsLearned: number;
  accuracy: number;
  timeSpent: number;
  unlockedWorlds: string[];
  completedLessons: string[];
  unlockedStickers: string[];
  unlockedAvatars: string[];
  selectedAvatar: string;
  unlockedCharacters: string[];
  claimedQuestIds: string[];
  completedWords: { word: string; timestamp: string; accuracy: number; speed?: number }[];
  templateFills: Record<string, Record<string, string>>;
  achievements: Record<string, boolean>;
  currentWorldId: string;
  activeWordIndex: number;
  activeNavTab: string;
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    speechRate: number;
    parentLockEnabled: boolean;
  };
  lastActiveTimestamp: number;
  lastRewardClaimed?: string;
}

export const DEFAULT_USER_PROGRESS: UserProgressData = {
  stars: 0,
  coins: 50,
  streak: 1,
  wordsLearned: 0,
  accuracy: 100,
  timeSpent: 0,
  unlockedWorlds: ['farm', 'jungle'],
  completedLessons: [],
  unlockedStickers: ['bear-1', 'star-1'],
  unlockedAvatars: ['🐻', '🦁', '🦊'],
  selectedAvatar: '🐻',
  unlockedCharacters: [],
  claimedQuestIds: [],
  completedWords: [],
  templateFills: {},
  achievements: {},
  currentWorldId: 'farm',
  activeWordIndex: 0,
  activeNavTab: 'adventure',
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    speechRate: 0.9,
    parentLockEnabled: false,
  },
  lastActiveTimestamp: Date.now(),
};

export class StorageService {
  private static instance: StorageService;
  private isMigrated: boolean = false;

  public constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Static sync helper for legacy components requiring immediate synchronous access.
   */
  public static getItemSync<T = any>(key: string, fallback?: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return (fallback ?? null) as T;
      return JSON.parse(item) as T;
    } catch {
      return (fallback ?? null) as T;
    }
  }

  /**
   * Static helper for setting key/value pairs in both localStorage & Capacitor Preferences.
   */
  public static setItem<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      Preferences.set({ key, value: json }).catch(() => {});
    } catch (e) {
      console.warn('StorageService static setItem error:', e);
    }
  }

  /**
   * Initializes storage and performs schema migration if necessary.
   */
  public async init(): Promise<void> {
    if (this.isMigrated) return;

    try {
      const { value: currentVersion } = await Preferences.get({ key: SCHEMA_KEY });
      const versionNum = currentVersion ? parseInt(currentVersion, 10) : 0;

      if (versionNum < STORAGE_SCHEMA_VERSION) {
        await this.migrateData(versionNum, STORAGE_SCHEMA_VERSION);
        await Preferences.set({ key: SCHEMA_KEY, value: STORAGE_SCHEMA_VERSION.toString() });
      }

      this.isMigrated = true;
    } catch (err) {
      console.warn('StorageService initialization warning:', err);
      this.isMigrated = true; // Proceed safely
    }
  }

  /**
   * Data schema migration handler for future updates.
   */
  private async migrateData(oldVersion: number, newVersion: number): Promise<void> {
    console.log(`Migrating storage schema from v${oldVersion} to v${newVersion}`);
    if (oldVersion === 0) {
      try {
        const localProgress = localStorage.getItem('english_explorer_progress');
        if (localProgress) {
          await Preferences.set({ key: 'user_progress_data', value: localProgress });
        }
      } catch (err) {
        console.warn('LocalStorage migration note:', err);
      }
    }
  }

  /**
   * Safely stores an object under a specified key asynchronously.
   */
  public async setItemAsync<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await Preferences.set({ key, value: jsonValue });
      localStorage.setItem(key, jsonValue);
      return true;
    } catch (err) {
      console.error(`StorageService setItemAsync error [${key}]:`, err);
      return false;
    }
  }

  /**
   * Safely retrieves an object with JSON corruption recovery asynchronously.
   */
  public async getItem<T>(key: string, fallback: T): Promise<T> {
    try {
      const { value } = await Preferences.get({ key });
      if (!value) return StorageService.getItemSync(key, fallback);
      return JSON.parse(value) as T;
    } catch (err) {
      console.warn(`StorageService getItem JSON parse error [${key}], resetting to fallback:`, err);
      return fallback;
    }
  }

  /**
   * Removes an item from preferences.
   */
  public async removeItem(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`StorageService removeItem error [${key}]:`, err);
    }
  }

  /**
   * Clears all app storage preferences.
   */
  public async clearAll(): Promise<void> {
    try {
      await Preferences.clear();
      localStorage.clear();
    } catch (err) {
      console.error('StorageService clearAll error:', err);
    }
  }

  /**
   * Helper: Synchronously loads full user progress state from localStorage fallback.
   */
  public static getUserProgressSync(): UserProgressData {
    const raw = StorageService.getItemSync<UserProgressData>('user_progress_data');
    if (!raw) return DEFAULT_USER_PROGRESS;
    return {
      ...DEFAULT_USER_PROGRESS,
      ...raw,
      settings: {
        ...DEFAULT_USER_PROGRESS.settings,
        ...(raw.settings || {})
      }
    };
  }

  /**
   * Helper: Synchronously saves full user progress state.
   */
  public static saveUserProgressSync(progress: Partial<UserProgressData>): void {
    const current = StorageService.getUserProgressSync();
    const updated: UserProgressData = {
      ...current,
      ...progress,
      lastActiveTimestamp: Date.now(),
    };
    StorageService.setItem('user_progress_data', updated);
  }

  /**
   * Helper: Saves full user progress state asynchronously.
   */
  public async saveUserProgress(progress: Partial<UserProgressData>): Promise<boolean> {
    const current = await this.getUserProgress();
    const updated: UserProgressData = {
      ...current,
      ...progress,
      lastActiveTimestamp: Date.now(),
    };
    return this.setItemAsync('user_progress_data', updated);
  }

  /**
   * Helper: Loads full user progress state asynchronously.
   */
  public async getUserProgress(): Promise<UserProgressData> {
    await this.init();
    const loaded = await this.getItem<UserProgressData>('user_progress_data', DEFAULT_USER_PROGRESS);
    return {
      ...DEFAULT_USER_PROGRESS,
      ...loaded,
      settings: {
        ...DEFAULT_USER_PROGRESS.settings,
        ...(loaded.settings || {})
      }
    };
  }
}

export const storageService = StorageService.getInstance();
