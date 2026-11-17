import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { MainNavigation, type LearningTab } from './components/MainNavigation';
import { LearningHome } from './components/LearningHome';
const WordGame = lazy(() => import('./components/WordGame'));
const CharacterCollection = lazy(() => import('./components/CharacterCollection'));
const ParentDashboard = lazy(() => import('./components/ParentDashboard'));
const WorldSelector = lazy(() => import('./components/WorldSelector'));
const AdventureMap = lazy(() => import('./components/AdventureMap'));
const StickerAlbum = lazy(() => import('./components/StickerAlbum'));
const DailyQuests = lazy(() => import('./components/DailyQuests'));
import FloatingMascot from './components/FloatingMascot';
import AmbientEnvironment from './components/AmbientEnvironment';
const StoryTime = lazy(() => import('./components/StoryTime'));
const ColoringCanvas = lazy(() => import('./components/ColoringCanvas'));
const Leaderboard = lazy(() => import('./components/Leaderboard').then((module) => ({ default: module.Leaderboard })));
import { MascotProvider, useMascot } from './context/MascotContext';
import { THEMED_WORLDS, ThemedWorld, INITIAL_WORDS } from './constants';
import { db, auth } from './lib/firebase';
import { doc, getDoc, setDoc, increment, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { soundFx } from './utils/audio';
import { AudioManager, type AudioPreferences } from './services/AudioManager';
import { fireTreasureChestConfetti } from './utils/confetti';
import { StorageService } from './services/StorageService';
import { AssetCacheService } from './services/AssetCacheService';
import { SyncWorkerService, SyncWorkerStatus } from './services/SyncWorkerService';
import { AudioPreFetchService } from './services/AudioPreFetchService';
import { OrientationLockGuard } from './components/OrientationLockGuard';
import { AnalyticsService } from './services/AnalyticsService';
import { useNotifications } from './context/NotificationContext';
import { StartupLoader } from './components/StartupLoader';

const LEARNING_TABS: readonly LearningTab[] = ['adventure', 'worlds', 'story', 'draw', 'stickers', 'quests', 'friends', 'leaderboard'];

function isLearningTab(value: unknown): value is LearningTab {
  return typeof value === 'string' && LEARNING_TABS.includes(value as LearningTab);
}

interface UserStats {
  stars: number;
  coins: number;
  streak: number;
  wordsLearned: number;
  accuracy: number;
  timeSpent: number;
  unlockedCharacters: string[];
  completedWords: { word: string; timestamp: string; accuracy: number }[];
}

function AppMainContent() {
  const { showThoughtBubble } = useMascot();
  const { showNotification } = useNotifications();
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<LearningTab>('adventure');
  const [dailyBonusAvailable, setDailyBonusAvailable] = useState(false);
  const [currentWorld, setCurrentWorld] = useState<ThemedWorld>(THEMED_WORLDS[0]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>(() => {
    const savedQuestsRaw = StorageService.getItemSync('local_claimed_quest_ids');
    if (savedQuestsRaw && Array.isArray(savedQuestsRaw)) return savedQuestsRaw;
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState(() => !AudioManager.isMuted());
  const [audioPreferences, setAudioPreferences] = useState<AudioPreferences>(() => AudioManager.getPreferences());

  const [syncStatus, setSyncStatus] = useState<SyncWorkerStatus>(() => SyncWorkerService.getStatus());
  const prevSyncingRef = useRef(syncStatus.isSyncing);
  const prevLastSyncedRef = useRef(syncStatus.lastSyncedAt);

  useEffect(() => {
    const unsubscribeAudio = AudioManager.subscribe((preferences) => {
      setSoundEnabled(!preferences.muted);
      setAudioPreferences(preferences);
    });
    return unsubscribeAudio;
  }, []);

  const updateAudioPreferences = (patch: Partial<AudioPreferences>) => AudioManager.updatePreferences(patch);

  useEffect(() => {
    AudioManager.setScene(
      activeNavTab === 'story' ? 'story' : activeNavTab === 'worlds' ? 'world' : activeNavTab === 'adventure' || activeNavTab === 'quests' ? 'game' : 'learn',
      currentWorld.id,
    );
  }, [activeNavTab, currentWorld.id]);

  useEffect(() => {
    const unsubscribeSync = SyncWorkerService.subscribeStatus((status) => {
      setSyncStatus(status);
      if (status.lastError) {
        showNotification(status.lastError, 'error');
      }
    });
    return () => unsubscribeSync();
  }, [showNotification]);

  useEffect(() => {
    const wasSyncing = prevSyncingRef.current;
    const prevLastSynced = prevLastSyncedRef.current;

    if (
      (wasSyncing && !syncStatus.isSyncing && !syncStatus.lastError) ||
      (syncStatus.lastSyncedAt !== null && syncStatus.lastSyncedAt !== prevLastSynced)
    ) {
      showNotification('Progress Synced to Cloud', 'success');
      prevSyncingRef.current = syncStatus.isSyncing;
      prevLastSyncedRef.current = syncStatus.lastSyncedAt;
    }

    prevSyncingRef.current = syncStatus.isSyncing;
    prevLastSyncedRef.current = syncStatus.lastSyncedAt;
  }, [syncStatus.isSyncing, syncStatus.lastSyncedAt, syncStatus.lastError, showNotification]);

  const [stats, setStats] = useState<UserStats>(() => {
    const localStatsRaw = StorageService.getItemSync('local_user_stats');
    if (localStatsRaw) {
      try {
        const parsed = typeof localStatsRaw === 'string' ? JSON.parse(localStatsRaw) : localStatsRaw;
        const words = parsed.completedWords || [];
        const acc = words.length > 0 ? Math.round(words.reduce((sum: number, w: any) => sum + (w.accuracy || 100), 0) / words.length) : 100;
        return {
          stars: parsed.stars || 0,
          coins: typeof parsed.coins === 'number' ? parsed.coins : 50,
          streak: parsed.streak || 1,
          wordsLearned: words.length,
          accuracy: acc,
          timeSpent: parsed.timeSpent || 0,
          unlockedCharacters: parsed.unlockedCharacters || [],
          completedWords: words
        };
      } catch (e) {
        // Fallback
      }
    }
    return {
      stars: 0,
      coins: 50,
      streak: 1,
      wordsLearned: 0,
      accuracy: 100,
      timeSpent: 0,
      unlockedCharacters: [],
      completedWords: []
    };
  });

  const persistCheckpoint = (updates: { currentWorldId?: string; activeWordIndex?: number; activeNavTab?: LearningTab; soundEnabled?: boolean }) => {
    if (updates.currentWorldId) StorageService.setItem('local_current_world_id', updates.currentWorldId);
    if (typeof updates.activeWordIndex === 'number') StorageService.setItem('local_active_word_index', String(updates.activeWordIndex));
    if (updates.activeNavTab) StorageService.setItem('local_active_nav_tab', updates.activeNavTab);
    if (typeof updates.soundEnabled === 'boolean') StorageService.setItem('sound_enabled', String(updates.soundEnabled));

    StorageService.saveUserProgressSync({
      currentWorldId: updates.currentWorldId || currentWorld.id,
      activeWordIndex: typeof updates.activeWordIndex === 'number' ? updates.activeWordIndex : activeWordIndex,
      activeNavTab: updates.activeNavTab || activeNavTab,
      settings: {
        soundEnabled: typeof updates.soundEnabled === 'boolean' ? updates.soundEnabled : soundEnabled,
        musicEnabled: soundEnabled,
        speechRate: 1.0,
        parentLockEnabled: true
      }
    });

    if (currentUser) {
      setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true })
        .catch(() => SyncWorkerService.enqueue('CHECKPOINT_STATE', updates, currentUser.uid));
    }
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    AudioManager.setMuted(!nextVal);
    setSoundEnabled(nextVal);
    soundFx.playPop();
    persistCheckpoint({ soundEnabled: nextVal });
    AnalyticsService.logLearningEvent('world_changed', { sound_enabled: nextVal });
  };

  useEffect(() => {
    AssetCacheService.preloadAllAppAssets().catch(() => {});
    AudioPreFetchService.preFetchAllAudio().catch(() => {});

    const lastClaim = StorageService.getItemSync('last_daily_claim');
    const today = new Date().toDateString();
    if (lastClaim !== today && !currentUser) {
      setDailyBonusAvailable(true);
    }

    const savedWorldId = StorageService.getItemSync('local_current_world_id');
    if (savedWorldId) {
      const matched = THEMED_WORLDS.find(w => w.id === savedWorldId);
      if (matched) setCurrentWorld(matched);
    }

    const savedWordIdx = StorageService.getItemSync('local_active_word_index');
    if (savedWordIdx !== null) {
      const parsed = parseInt(String(savedWordIdx), 10);
      if (!isNaN(parsed)) setActiveWordIndex(parsed);
    }

    const savedNavTab = StorageService.getItemSync('local_active_nav_tab');
    if (isLearningTab(savedNavTab)) {
      setActiveNavTab(savedNavTab);
    }
  }, [currentUser]);

  // Persistent auto-save of local progress
  useEffect(() => {
    StorageService.setItem('local_user_stats', JSON.stringify({
      stars: stats.stars,
      coins: stats.coins,
      streak: stats.streak,
      unlockedCharacters: stats.unlockedCharacters,
      completedWords: stats.completedWords,
      timeSpent: stats.timeSpent
    }));
    StorageService.setItem('local_completed_words', JSON.stringify(stats.completedWords));
    StorageService.saveUserProgressSync({
      stars: stats.stars,
      coins: stats.coins,
      streak: stats.streak,
      unlockedCharacters: stats.unlockedCharacters,
      completedWords: stats.completedWords,
      wordsLearned: stats.wordsLearned,
      accuracy: stats.accuracy,
      timeSpent: stats.timeSpent
    });
  }, [stats]);

  useEffect(() => {
    StorageService.setItem('local_claimed_quest_ids', JSON.stringify(claimedQuestIds));
    StorageService.saveUserProgressSync({ claimedQuestIds });
  }, [claimedQuestIds]);

  useEffect(() => {
    StorageService.setItem('local_current_world_id', currentWorld.id);
    StorageService.saveUserProgressSync({ currentWorldId: currentWorld.id });
  }, [currentWorld.id]);

  // On App Launch: Ensure user authentication & full backend progress restoration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        AnalyticsService.trackUser(user.uid, { anonymous: user.isAnonymous });
        AnalyticsService.logLearningEvent('app_launch');
        await syncStats(user.uid);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          setCurrentUser(cred.user);
          await syncStats(cred.user.uid);
        } catch (e) {
          showNotification('Offline mode: Progress will sync later', 'warning');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const syncStats = async (uid: string) => {
    try {
      const userDoc = doc(db, 'users', uid);
      const snap = await getDoc(userDoc);
      const today = new Date().toDateString();

      const progressSnap = await getDocs(collection(db, 'users', uid, 'progress'));
      const dbWordsMap = new Map<string, { word: string; timestamp: string; accuracy: number }>();
      
      progressSnap.forEach((docSnap) => {
        const d = docSnap.data();
        const wName = d.word || docSnap.id;
        dbWordsMap.set(wName.toLowerCase(), {
          word: wName,
          timestamp: d.lastPracticed || new Date().toISOString(),
          accuracy: typeof d.accuracy === 'number' ? d.accuracy : 100
        });
      });

      const localWordsRaw = StorageService.getItemSync('local_completed_words');
      if (localWordsRaw) {
        try {
          const parsedLocalWords: { word: string; timestamp: string; accuracy: number }[] =
            typeof localWordsRaw === 'string' ? JSON.parse(localWordsRaw) : localWordsRaw;
          parsedLocalWords.forEach((lw) => {
            const key = lw.word.toLowerCase();
            if (!dbWordsMap.has(key)) {
              dbWordsMap.set(key, lw);
            } else {
              const existing = dbWordsMap.get(key)!;
              if (new Date(lw.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
                dbWordsMap.set(key, lw);
              }
            }
          });
        } catch (e) {}
      }

      const mergedWords = Array.from(dbWordsMap.values());
      const totalW = mergedWords.length;
      const avgAcc = totalW > 0 ? Math.round(mergedWords.reduce((acc, cur) => acc + (cur.accuracy || 100), 0) / totalW) : 100;

      if (!snap.exists()) {
        const initialData = {
          userId: uid,
          displayName: auth.currentUser?.displayName || 'Little Explorer',
          totalStars: stats.stars || 0,
          coins: stats.coins || 0,
          currentStreak: stats.streak || 1,
          maxStreak: stats.streak || 1,
          timeSpent: stats.timeSpent || 0,
          lastLoginDate: new Date().toISOString(),
          lastRewardClaimed: '',
          unlockedCharacters: stats.unlockedCharacters || [],
          claimedQuests: claimedQuestIds || [],
          currentWorldId: currentWorld.id,
          activeWordIndex: activeWordIndex,
          activeNavTab: activeNavTab,
          soundEnabled: soundEnabled
        };
        await setDoc(userDoc, initialData, { merge: true });
        setDailyBonusAvailable(true);
        setStats((prev) => ({ 
          ...prev, 
          completedWords: mergedWords,
          wordsLearned: totalW,
          accuracy: avgAcc
        }));
      } else {
        const data = snap.data();
        const lastClaim = data.lastRewardClaimed ? new Date(data.lastRewardClaimed).toDateString() : '';
        if (lastClaim !== today) {
          setDailyBonusAvailable(true);
        }

        const mergedStars = Math.max(data.totalStars || 0, stats.stars || 0);
        const mergedCoins = Math.max(data.coins || 0, stats.coins || 0);
        const mergedStreak = data.currentStreak || stats.streak || 1;
        const mergedTimeSpent = Math.max(data.timeSpent || 0, stats.timeSpent || 0);
        const mergedUnlocked = Array.from(new Set([...(data.unlockedCharacters || []), ...(stats.unlockedCharacters || [])]));
        const mergedQuests = Array.from(new Set([...(data.claimedQuests || []), ...(claimedQuestIds || [])]));

        setClaimedQuestIds(mergedQuests);

        if (data.currentWorldId) {
          const matched = THEMED_WORLDS.find(w => w.id === data.currentWorldId);
          if (matched) setCurrentWorld(matched);
        }

        if (typeof data.activeWordIndex === 'number') {
          setActiveWordIndex(data.activeWordIndex);
        }

        if (isLearningTab(data.activeNavTab)) {
          setActiveNavTab(data.activeNavTab);
        }

        if (typeof data.soundEnabled === 'boolean') {
          AudioManager.setMuted(!data.soundEnabled);
          setSoundEnabled(data.soundEnabled);
        }

        setStats((prev) => ({
          ...prev,
          stars: mergedStars,
          coins: mergedCoins,
          streak: mergedStreak,
          timeSpent: mergedTimeSpent,
          unlockedCharacters: mergedUnlocked,
          completedWords: mergedWords,
          wordsLearned: totalW,
          accuracy: avgAcc
        }));

        await setDoc(userDoc, {
          totalStars: mergedStars,
          coins: mergedCoins,
          currentStreak: mergedStreak,
          timeSpent: mergedTimeSpent,
          unlockedCharacters: mergedUnlocked,
          claimedQuests: mergedQuests,
          currentWorldId: data.currentWorldId || currentWorld.id,
          activeWordIndex: typeof data.activeWordIndex === 'number' ? data.activeWordIndex : activeWordIndex,
          activeNavTab: isLearningTab(data.activeNavTab) ? data.activeNavTab : activeNavTab,
          soundEnabled: typeof data.soundEnabled === 'boolean' ? data.soundEnabled : soundEnabled
        }, { merge: true });
      }
    } catch (e) {
      AnalyticsService.logError('sync_failure', e instanceof Error ? e.message : 'Unknown sync error');
    }
  };

  const handleClaimDaily = async () => {
    soundFx.playCoin(soundEnabled);
    fireTreasureChestConfetti();
    const today = new Date().toDateString();
    StorageService.setItem('last_daily_claim', today);
    setDailyBonusAvailable(false);

    setStats(prev => ({
      ...prev,
      coins: prev.coins + 50,
      stars: prev.stars + 5
    }));

    showThoughtBubble("Hooray! You opened the Treasure Chest and earned +50 Bonus Coins! 🪙🎉", "excited");
    AnalyticsService.logLearningEvent('coin_earned', { amount: 50, reason: 'daily_bonus' });

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          coins: increment(50),
          totalStars: increment(5),
          lastRewardClaimed: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        SyncWorkerService.enqueue('DAILY_CLAIM', { coinsBonus: 50, starsBonus: 5, timestamp: new Date().toISOString() }, currentUser.uid);
      }
    }
  };

  const wordsInCurrentWorld = INITIAL_WORDS.filter(w => w.worldId === currentWorld.id || !w.worldId);

  const onWordComplete = async (wordId: string, accuracy: number, speed: number) => {
    const coinBonus = accuracy === 100 ? 10 : 5;
    const now = new Date().toISOString();

    setStats((prev) => {
      const existingIndex = prev.completedWords.findIndex(w => w.word.toLowerCase() === wordId.toLowerCase());
      let updatedWords = [...prev.completedWords];
      if (existingIndex >= 0) {
        updatedWords[existingIndex] = { word: wordId, timestamp: now, accuracy };
      } else {
        updatedWords.push({ word: wordId, timestamp: now, accuracy });
      }

      const totalWordsLearned = updatedWords.length;
      const newAccuracy = Math.round(((prev.accuracy * prev.wordsLearned) + accuracy) / Math.max(1, totalWordsLearned));

      return {
        ...prev,
        stars: prev.stars + 1,
        coins: prev.coins + coinBonus,
        wordsLearned: totalWordsLearned,
        accuracy: newAccuracy,
        timeSpent: prev.timeSpent + speed,
        completedWords: updatedWords
      };
    });

    AnalyticsService.logLearningEvent('spelling_mastered', { word: wordId, accuracy, speed });

    // Thought bubble logic remains...
    showThoughtBubble(`Sensational job spelling ${wordId.toUpperCase()}! Keep going! ✨`, 'happy');

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          totalStars: increment(1),
          coins: increment(coinBonus),
          timeSpent: increment(speed),
          currentWorldId: currentWorld.id,
          activeWordIndex: activeWordIndex
        }, { merge: true });

        const progressRef = doc(db, 'users', currentUser.uid, 'progress', wordId);
        await setDoc(progressRef, {
          word: wordId,
          accuracy: accuracy,
          speedMs: speed,
          attempts: increment(1),
          isMastered: true,
          lastPracticed: now
        }, { merge: true });
      } catch (e) {
        SyncWorkerService.enqueue('WORD_PROGRESS', {
          wordId,
          accuracy,
          coinBonus,
          lastPracticed: now,
          currentWorldId: currentWorld.id,
          activeWordIndex: activeWordIndex
        }, currentUser.uid);
      }
    }
  };

  const handleUnlockCharacter = async (charId: string, cost: number) => {
    if (stats.coins < cost) return;
    soundFx.playUnlock(soundEnabled);

    const updatedUnlocked = Array.from(new Set([...stats.unlockedCharacters, charId]));
    const remainingCoins = stats.coins - cost;

    setStats(prev => ({
      ...prev,
      coins: remainingCoins,
      unlockedCharacters: updatedUnlocked
    }));

    showThoughtBubble("Yippee! You unlocked a brand new friend for your animal collection! 🐾✨", "proud");
    AnalyticsService.logLearningEvent('character_unlocked', { character_id: charId, cost });

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          coins: remainingCoins,
          unlockedCharacters: updatedUnlocked
        }, { merge: true });
      } catch (e) {
        SyncWorkerService.enqueue('UNLOCK_CHARACTER', {
          unlockedCharacters: updatedUnlocked,
          remainingCoins
        }, currentUser.uid);
      }
    }
  };

  const handleClaimQuestReward = async (questId: string, coins: number, xp: number) => {
    soundFx.playCoin(soundEnabled);
    const newClaimed = Array.from(new Set([...claimedQuestIds, questId]));
    setClaimedQuestIds(newClaimed);

    const starsBonus = Math.floor(xp / 10);
    setStats(prev => ({
      ...prev,
      coins: prev.coins + coins,
      stars: prev.stars + starsBonus
    }));

    showThoughtBubble("Daily Quest Accomplished! +Bonus Coins added to your treasure bag! ⚡", "cheering");
    AnalyticsService.logLearningEvent('quest_completed', { quest_id: questId, reward_coins: coins });

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          coins: increment(coins),
          totalStars: increment(starsBonus),
          claimedQuests: newClaimed
        }, { merge: true });
      } catch (e) {
        SyncWorkerService.enqueue('UPDATE_USER_STATS', {
          coinsIncrement: coins,
          starsIncrement: starsBonus,
          claimedQuests: newClaimed
        }, currentUser.uid);
      }
    }
  };

  const completedWordIds = stats.completedWords.map(w => w.word.toLowerCase());

  return (
    <AmbientEnvironment world={currentWorld} soundEnabled={soundEnabled}>
      <AnimatePresence>
        {!isAppReady && <StartupLoader onComplete={() => setIsAppReady(true)} />}
      </AnimatePresence>

      <div className="min-h-[100dvh] flex flex-col relative overflow-x-hidden bg-[#f6f8f7] text-stone-800">
        
        {/* Mascot encouragement remains part of the learning experience. */}
        <FloatingMascot soundEnabled={soundEnabled} />

      <header className="learn-app-header">
        <a
          className="learn-brand"
          href="#learn-home"
          onClick={(event) => { event.preventDefault(); setActiveNavTab('adventure'); }}
          aria-label="LEARN home"
        >
          <span className="learn-brand-mark" aria-hidden="true">LE</span>
          <span>
            <span className="learn-brand-title">LEARN</span>
            <span className="learn-brand-subtitle">English Explorer</span>
          </span>
        </a>
        <div className="learn-header-actions">
          <span className="hidden text-xs font-medium text-stone-500 sm:inline-flex sm:items-center sm:gap-2" role="status" aria-live="polite">
            <span className={`inline-block h-2 w-2 rounded-full ${syncStatus.isOnline ? 'bg-emerald-500' : 'bg-orange-400'}`} />
            {!syncStatus.isOnline ? 'Offline · saved on this device' : syncStatus.pendingCount > 0 ? 'Syncing progress' : 'Progress saved'}
          </span>
          <button
            type="button"
            className="learn-header-button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
            title={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
          >
            {soundEnabled ? <Volume2 aria-hidden="true" size={18} /> : <VolumeX aria-hidden="true" size={18} />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound on' : 'Sound off'}</span>
          </button>
          <button type="button" className="learn-header-button" onClick={() => setShowDashboard(true)}>
            <ShieldCheck aria-hidden="true" size={18} />
            <span className="hidden sm:inline">For parents</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-start gap-6 px-4 pb-28 pt-5 sm:px-6 lg:gap-8 lg:px-8 lg:pb-10 lg:pt-8">
        <MainNavigation
          activeTab={activeNavTab}
          onNavigate={(tab) => {
            soundFx.playNav();
            setActiveNavTab(tab);
            persistCheckpoint({ activeNavTab: tab });
          }}
          onOpenParents={() => setShowDashboard(true)}
        />
        <main className="min-w-0 flex-1">
          {activeNavTab === 'adventure' && (
            <LearningHome
              world={currentWorld}
              stars={stats.stars}
              wordsLearned={stats.wordsLearned}
              streak={stats.streak}
              onExploreWorlds={() => {
                setActiveNavTab('worlds');
                persistCheckpoint({ activeNavTab: 'worlds' });
              }}
            />
          )}

        {/* Dynamic Tab Views */}
        <Suspense fallback={<div className="rounded-3xl bg-white/80 p-8 text-center text-sm font-semibold text-stone-500" role="status" aria-live="polite">Loading your activity…</div>}>
        <AnimatePresence mode="wait">
          {activeNavTab === 'adventure' && (
            <motion.div
              id="word-game"
              key="adventure-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Word Game Interface */}
              <WordGame
                onComplete={onWordComplete}
                soundEnabled={soundEnabled}
                activeWordIndex={activeWordIndex}
                wordsList={wordsInCurrentWorld}
                onNextWord={() => {
                  let nextIdx = 0;
                  if (wordsInCurrentWorld && wordsInCurrentWorld.length > 0) {
                    nextIdx = (activeWordIndex + 1) % wordsInCurrentWorld.length;
                  }
                  setActiveWordIndex(nextIdx);
                  persistCheckpoint({ activeWordIndex: nextIdx });
                }}
              />

              {/* Winding Story Journey Map */}
              <AdventureMap
                world={currentWorld}
                wordsInWorld={wordsInCurrentWorld}
                completedWordIds={completedWordIds}
                activeWordIndex={activeWordIndex}
                onSelectWordIndex={(idx) => {
                  setActiveWordIndex(idx);
                  persistCheckpoint({ activeWordIndex: idx });
                }}
                soundEnabled={soundEnabled}
                onOpenTreasureChest={handleClaimDaily}
              />
            </motion.div>
          )}

          {activeNavTab === 'worlds' && (
            <motion.div
              key="worlds-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <WorldSelector
                currentWorld={currentWorld}
                userXp={stats.stars}
                onSelectWorld={(world) => {
                  setCurrentWorld(world);
                  setActiveWordIndex(0);
                  setActiveNavTab('adventure');
                  persistCheckpoint({ currentWorldId: world.id, activeWordIndex: 0, activeNavTab: 'adventure' });
                  showThoughtBubble(`Welcome to ${world.name}! Let me know if you need help! ${world.emoji}`, 'excited');
                }}
                soundEnabled={soundEnabled}
              />
            </motion.div>
          )}

          {activeNavTab === 'story' && (
            <motion.div
              key="story-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <StoryTime
                completedWords={stats.completedWords}
                soundEnabled={soundEnabled}
                onRewardStars={(extraStars) => {
                  setStats(prev => ({ ...prev, stars: prev.stars + extraStars }));
                }}
              />
            </motion.div>
          )}

          {activeNavTab === 'draw' && (
            <motion.div
              key="draw-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <ColoringCanvas
                currentWord={wordsInCurrentWorld[activeWordIndex]?.text || 'MAGIC'}
                soundEnabled={soundEnabled}
                onRewardStars={(extraStars) => {
                  setStats(prev => ({ ...prev, stars: prev.stars + extraStars }));
                }}
              />
            </motion.div>
          )}

          {activeNavTab === 'stickers' && (
            <motion.div
              key="stickers-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <StickerAlbum userXp={stats.stars} soundEnabled={soundEnabled} />
            </motion.div>
          )}

          {activeNavTab === 'quests' && (
            <motion.div
              key="quests-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <DailyQuests
                wordsLearnedToday={stats.wordsLearned}
                accuracyToday={stats.accuracy}
                onClaimQuestReward={handleClaimQuestReward}
                claimedQuestIds={claimedQuestIds}
                soundEnabled={soundEnabled}
              />
            </motion.div>
          )}

          {activeNavTab === 'leaderboard' && (
            <motion.div
              key="leaderboard-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Leaderboard
                userStars={stats.stars}
                userStreak={stats.streak}
              />
            </motion.div>
          )}

          {activeNavTab === 'friends' && (
            <motion.div
              key="friends-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <CharacterCollection
                unlockedIds={stats.unlockedCharacters}
                availableCoins={stats.coins}
                onUnlock={handleUnlockCharacter}
                soundEnabled={soundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </Suspense>
      </main>
      </div>

      {/* Parent Dashboard Modal */}
      <Suspense fallback={null}>
      <AnimatePresence>
        {showDashboard && (
          <ParentDashboard 
            stats={stats} 
            onClose={() => setShowDashboard(false)} 
            onUnlockCharacter={handleUnlockCharacter}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            audioPreferences={audioPreferences}
            onAudioPreferencesChange={updateAudioPreferences}
          />
        )}
      </AnimatePresence>
      </Suspense>

        <footer className="relative z-10 mt-auto border-t border-[#e5ebe8] bg-white/65 px-6 py-5 text-center">
          <p className="m-0 text-xs font-medium text-stone-500">LEARN · English Explorer</p>
          <p className="mb-0 mt-1 text-[11px] text-stone-400">Curious minds grow one word at a time.</p>
        </footer>
      </div>
    </AmbientEnvironment>
  );
}

export default function App() {
  return (
    <MascotProvider>
      <MotionConfig reducedMotion="user">
        <OrientationLockGuard>
          <AppMainContent />
        </OrientationLockGuard>
      </MotionConfig>
    </MascotProvider>
  );
}
