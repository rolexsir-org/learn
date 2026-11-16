import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Volume2, VolumeX, ShieldCheck, Compass, Zap, Palette, Trophy } from 'lucide-react';
import WordGame from './components/WordGame';
import MyWordsList from './components/MyWordsList';
import CharacterCollection from './components/CharacterCollection';
import ParentDashboard from './components/ParentDashboard';
import InteractiveBackground from './components/InteractiveBackground';
import WorldSelector from './components/WorldSelector';
import AdventureMap from './components/AdventureMap';
import StickerAlbum from './components/StickerAlbum';
import DailyQuests from './components/DailyQuests';
import FloatingMascot from './components/FloatingMascot';
import AmbientEnvironment from './components/AmbientEnvironment';
import StoryTime from './components/StoryTime';
import ColoringCanvas from './components/ColoringCanvas';
import { Leaderboard } from './components/Leaderboard';
import { MascotProvider, useMascot } from './context/MascotContext';
import { THEMED_WORLDS, ThemedWorld, INITIAL_WORDS } from './constants';
import { db, auth } from './lib/firebase';
import { doc, getDoc, setDoc, increment, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { soundFx } from './utils/audio';
import { fireTreasureChestConfetti } from './utils/confetti';
import { StorageService } from './services/StorageService';
import { AssetCacheService } from './services/AssetCacheService';
import { SyncWorkerService, SyncWorkerStatus } from './services/SyncWorkerService';
import { AudioPreFetchService } from './services/AudioPreFetchService';
import { OrientationLockGuard } from './components/OrientationLockGuard';
import { AnalyticsService } from './services/AnalyticsService';
import { useNotifications } from './context/NotificationContext';
import { StartupLoader } from './components/StartupLoader';
import { ExplorerButton, IconBadge } from './components/UiCore';

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
  const [activeNavTab, setActiveNavTab] = useState<'adventure' | 'worlds' | 'story' | 'draw' | 'stickers' | 'quests' | 'friends' | 'leaderboard' | 'dictionary'>('adventure');
  const [dailyBonusAvailable, setDailyBonusAvailable] = useState(false);
  const [currentWorld, setCurrentWorld] = useState<ThemedWorld>(THEMED_WORLDS[0]);
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>(() => {
    const savedQuestsRaw = StorageService.getItemSync('local_claimed_quest_ids');
    if (savedQuestsRaw && Array.isArray(savedQuestsRaw)) return savedQuestsRaw;
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = StorageService.getItemSync('sound_enabled');
    const isEnabled = saved !== null ? saved === 'true' : true;
    soundFx.setSoundEnabled(isEnabled);
    return isEnabled;
  });

  const [syncStatus, setSyncStatus] = useState<SyncWorkerStatus>(() => SyncWorkerService.getStatus());
  const prevSyncingRef = useRef(syncStatus.isSyncing);
  const prevLastSyncedRef = useRef(syncStatus.lastSyncedAt);

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

  const persistCheckpoint = (updates: { currentWorldId?: string; activeWordIndex?: number; activeNavTab?: string; soundEnabled?: boolean }) => {
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
    setSoundEnabled(nextVal);
    soundFx.setSoundEnabled(nextVal);
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
    if (savedNavTab) {
      setActiveNavTab(savedNavTab as any);
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

        if (data.activeNavTab) {
          setActiveNavTab(data.activeNavTab);
        }

        if (typeof data.soundEnabled === 'boolean') {
          setSoundEnabled(data.soundEnabled);
          StorageService.setItem('sound_enabled', String(data.soundEnabled));
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
          activeNavTab: data.activeNavTab || activeNavTab,
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

      <div className="min-h-screen font-sans text-stone-800 selection:bg-amber-100 flex flex-col justify-between relative overflow-x-hidden">
        
        {/* Interactive Storybook Canvas Background */}
        <InteractiveBackground world={currentWorld} soundEnabled={soundEnabled} />

        {/* Floating Animated Mascot Component with Thought Bubble Context */}
        <FloatingMascot soundEnabled={soundEnabled} />

      {/* Playful Top Header */}
      <header className="h-20 w-full px-4 md:px-8 flex items-center justify-between bg-white/90 backdrop-blur-md border-b-4 border-amber-200/50 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <IconBadge icon={currentWorld.emoji} size="md" color="bg-gradient-to-tr from-amber-400 to-yellow-400 border-amber-600 text-white" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em] leading-tight">World Explorer</span>
            <span className="text-xl font-black text-stone-900 tracking-tight leading-none">English Explorer</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExplorerButton
            variant="glass"
            size="icon"
            onClick={toggleSound}
            title={soundEnabled ? "Mute Audio" : "Enable Audio"}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5 text-stone-400" />
            )}
          </ExplorerButton>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto p-4 md:pt-8 w-full flex-1 relative z-10">
        
        {/* Child Mode Primary Navigation Bar */}
        <div className="flex bg-white/95 backdrop-blur-md p-2 rounded-[32px] border-4 border-amber-100 shadow-soft-3d mb-8 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundFx.playNav();
              setActiveNavTab('adventure');
              persistCheckpoint({ activeNavTab: 'adventure' });
            }}
            className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeNavTab === 'adventure'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 border-b-4 border-amber-600 shadow-md scale-105'
                : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Play</span>
          </button>

          <button
            onClick={() => {
              soundFx.playNav();
              setActiveNavTab('worlds');
              persistCheckpoint({ activeNavTab: 'worlds' });
            }}
            className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeNavTab === 'worlds'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 border-b-4 border-amber-600 shadow-md scale-105'
                : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
            }`}
          >
            <span className="text-xl">🌎</span>
            <span>Realms</span>
          </button>

          <button
            onClick={() => {
              soundFx.playNav();
              setActiveNavTab('story');
              persistCheckpoint({ activeNavTab: 'story' });
            }}
            className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeNavTab === 'story'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 border-b-4 border-amber-600 shadow-md scale-105'
                : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
            }`}
          >
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>Story</span>
          </button>

          <button
            onClick={() => {
              soundFx.playNav();
              setActiveNavTab('draw');
              persistCheckpoint({ activeNavTab: 'draw' });
            }}
            className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeNavTab === 'draw'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 border-b-4 border-amber-600 shadow-md scale-105'
                : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
            }`}
          >
            <Palette className="w-5 h-5 text-rose-500" />
            <span>Draw</span>
          </button>

          <button
            onClick={() => {
              soundFx.playNav();
              setActiveNavTab('quests');
              persistCheckpoint({ activeNavTab: 'quests' });
            }}
            className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeNavTab === 'quests'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 border-b-4 border-amber-600 shadow-md scale-105'
                : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
            }`}
          >
            <Zap className="w-5 h-5 text-orange-500" />
            <span>Quests</span>
          </button>

          <button
            onClick={() => {
              soundFx.playNav();
              setActiveNavTab('leaderboard');
              persistCheckpoint({ activeNavTab: 'leaderboard' });
            }}
            className={`flex-1 min-w-[80px] py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeNavTab === 'leaderboard'
                ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-amber-950 border-b-4 border-amber-600 shadow-md scale-105'
                : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
            }`}
          >
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>Ranks</span>
          </button>

          <button
            onClick={() => {
              soundFx.playNav();
              setShowDashboard(true);
            }}
            className="flex-1 min-w-[80px] py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-2 transition-all text-stone-500 hover:text-stone-800 hover:bg-amber-50 whitespace-nowrap"
            title="Parent Dashboard"
          >
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <span>Parents</span>
          </button>
        </div>

        {/* Dynamic Tab Views */}
        <AnimatePresence mode="wait">
          {activeNavTab === 'adventure' && (
            <motion.div
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
                userXp={userXp}
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
              <StickerAlbum userXp={userXp} soundEnabled={soundEnabled} />
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
                userCoins={stats.coins}
                userStreak={stats.streak}
                soundEnabled={soundEnabled}
                currentUserId={currentUser?.uid}
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
      </main>

      {/* Parent Dashboard Modal */}
      <AnimatePresence>
        {showDashboard && (
          <ParentDashboard 
            stats={stats} 
            onClose={() => setShowDashboard(false)} 
            onUnlockCharacter={handleUnlockCharacter}
          />
        )}
      </AnimatePresence>

        <footer className="py-8 px-6 text-center bg-white/90 border-t-2 border-stone-200/80 mt-12 relative z-10">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">English Explorer • Built with ❤️ for Little Learners</p>
          <div className="flex justify-center gap-4 text-stone-300 text-sm">
            <span>🌻</span>
            <span>🐠</span>
            <span>🚀</span>
            <span>🌴</span>
            <span>🏰</span>
          </div>
        </footer>
      </div>
    </AmbientEnvironment>
  );
}

export default function App() {
  return (
    <MascotProvider>
      <OrientationLockGuard>
        <AppMainContent />
      </OrientationLockGuard>
    </MascotProvider>
  );
}
