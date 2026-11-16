import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Volume2, Plus, Edit3, Trash2, UserPlus, Heart, Check, X, RotateCcw, Users, Hand } from 'lucide-react';
import { CHARACTERS } from '../constants';
import { fireUnlockConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audio';
import { StorageService } from '../services/StorageService';
import { SpeechService } from '../services/SpeechService';

export interface FriendItem {
  id: string;
  name: string;
  funnyNickname: string;
  emoji: string;
  quote: string;
  role: string;
  highFives: number;
  isReal: boolean;
  cost?: number;
}

interface CharacterCollectionProps {
  unlockedIds: string[];
  onUnlock?: (id: string, cost: number) => void;
  availableCoins: number;
  soundEnabled?: boolean;
}

const DEFAULT_AVATAR_OPTIONS = ['👦', '👧', '🧒', '🦸‍♀️', '🧙‍♂️', '🧑‍🚀', '🦄', '🐶', '🐱', '🦊', '🐼', '🤖', '⚽', '🎨', '🍕', '🌟'];
const DEFAULT_ROLE_OPTIONS = ['Best Friend', 'Study Buddy', 'Classmate', 'Sibling', 'Goofball', 'Neighbor', 'Super Speller'];

const INITIAL_REAL_FRIENDS: FriendItem[] = [
  {
    id: 'rf-alex',
    name: 'Alex',
    funnyNickname: 'Captain Giggles 😸',
    emoji: '🧒',
    quote: 'High five bestie! You are a super speller!',
    role: 'Best Friend',
    highFives: 15,
    isReal: true,
  },
  {
    id: 'rf-maya',
    name: 'Maya',
    funnyNickname: 'The Noodle Master 🍜',
    emoji: '👧',
    quote: 'Ready to unlock all the magic worlds together!',
    role: 'Study Buddy',
    highFives: 9,
    isReal: true,
  }
];

export default function CharacterCollection({ unlockedIds, onUnlock, availableCoins, soundEnabled = true }: CharacterCollectionProps) {
  // Real friends stored in persistent StorageService
  const [realFriends, setRealFriends] = useState<FriendItem[]>(() => {
    try {
      const saved = StorageService.getItemSync('real_friends_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load real friends:', e);
    }
    return INITIAL_REAL_FRIENDS;
  });

  // Customized details for mascot characters stored in persistent StorageService
  const [mascotCustomizations, setMascotCustomizations] = useState<Record<string, Partial<FriendItem>>>(() => {
    try {
      const saved = StorageService.getItemSync('mascot_customizations_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load mascot customizations:', e);
    }
    return {};
  });

  // Filter state
  const [filterTab, setFilterTab] = useState<'all' | 'real' | 'mascots'>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFriend, setEditingFriend] = useState<FriendItem | null>(null);

  // Form states for adding/editing friend
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formEmoji, setFormEmoji] = useState('🧒');
  const [formRole, setFormRole] = useState('Best Friend');

  // High five feedback state
  const [activeHighFiveId, setActiveHighFiveId] = useState<string | null>(null);

  // Save real friends to StorageService
  useEffect(() => {
    try {
      StorageService.setItem('real_friends_v1', JSON.stringify(realFriends));
    } catch (e) {
      console.warn('Failed to save real friends:', e);
    }
  }, [realFriends]);

  // Save mascot customizations to StorageService
  useEffect(() => {
    try {
      StorageService.setItem('mascot_customizations_v1', JSON.stringify(mascotCustomizations));
    } catch (e) {
      console.warn('Failed to save mascot customizations:', e);
    }
  }, [mascotCustomizations]);

  const speakQuote = (name: string, nickname: string, quote: string) => {
    const displayName = nickname ? `${name}, also known as ${nickname}` : name;
    SpeechService.speak(`${displayName} says: ${quote}`, { rate: 0.92, pitch: 1.15 });
  };

  const handleUnlockClick = (id: string, cost: number) => {
    if (onUnlock) {
      onUnlock(id, cost);
      fireUnlockConfetti();
    }
  };

  const handleGiveHighFive = (e: React.MouseEvent, friendId: string) => {
    e.stopPropagation();
    soundFx.playPop(soundEnabled);
    setActiveHighFiveId(friendId);
    setTimeout(() => setActiveHighFiveId(null), 1200);

    // If it's a real friend, update high five count
    setRealFriends(prev => prev.map(f => f.id === friendId ? { ...f, highFives: f.highFives + 1 } : f));
  };

  const openAddFriendModal = () => {
    soundFx.playPop(soundEnabled);
    setFormName('');
    setFormNickname('');
    setFormQuote('High five! You are doing awesome!');
    setFormEmoji('🧒');
    setFormRole('Best Friend');
    setShowAddModal(true);
  };

  const handleCreateRealFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newFriend: FriendItem = {
      id: `real-${Date.now()}`,
      name: formName.trim(),
      funnyNickname: formNickname.trim() || formName.trim(),
      emoji: formEmoji,
      quote: formQuote.trim() || 'Let us learn together!',
      role: formRole,
      highFives: 1,
      isReal: true,
    };

    setRealFriends(prev => [newFriend, ...prev]);
    soundFx.playChime(soundEnabled);
    fireUnlockConfetti();
    setShowAddModal(false);
  };

  const openEditModal = (e: React.MouseEvent, friend: FriendItem) => {
    e.stopPropagation();
    soundFx.playPop(soundEnabled);
    setEditingFriend(friend);
    setFormName(friend.name);
    setFormNickname(friend.funnyNickname);
    setFormQuote(friend.quote);
    setFormEmoji(friend.emoji);
    setFormRole(friend.role);
  };

  const handleSaveEditFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFriend) return;

    if (editingFriend.isReal) {
      setRealFriends(prev =>
        prev.map(f =>
          f.id === editingFriend.id
            ? {
                ...f,
                name: formName.trim() || f.name,
                funnyNickname: formNickname.trim() || formName.trim() || f.name,
                quote: formQuote.trim() || f.quote,
                emoji: formEmoji,
                role: formRole,
              }
            : f
        )
      );
    } else {
      // Mascot friend customization
      setMascotCustomizations(prev => ({
        ...prev,
        [editingFriend.id]: {
          name: formName.trim() || editingFriend.name,
          funnyNickname: formNickname.trim() || formName.trim() || editingFriend.name,
          quote: formQuote.trim() || editingFriend.quote,
          emoji: formEmoji,
          role: formRole,
        }
      }));
    }

    soundFx.playPop(soundEnabled);
    setEditingFriend(null);
  };

  const handleDeleteRealFriend = (id: string) => {
    soundFx.playPop(soundEnabled);
    setRealFriends(prev => prev.filter(f => f.id !== id));
    setEditingFriend(null);
  };

  const handleResetMascotCustomization = (id: string) => {
    soundFx.playPop(soundEnabled);
    setMascotCustomizations(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setEditingFriend(null);
  };

  // Combine mascot friends with customizations
  const combinedMascotFriends: FriendItem[] = CHARACTERS.map(c => {
    const cust = mascotCustomizations[c.id] || {};
    return {
      id: c.id,
      name: cust.name || c.name,
      funnyNickname: cust.funnyNickname || cust.name || c.name,
      emoji: cust.emoji || c.emoji,
      quote: cust.quote || c.quote || 'Hello friend!',
      role: cust.role || 'Mascot Companion',
      highFives: 5,
      isReal: false,
      cost: c.cost,
    };
  });

  // Filtered friends
  const displayFriends = filterTab === 'real'
    ? realFriends
    : filterTab === 'mascots'
    ? combinedMascotFriends
    : [...realFriends, ...combinedMascotFriends];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 p-4 md:p-5 rounded-3xl border-4 border-amber-200 shadow-sm text-center relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="text-center sm:text-left">
            <h3 className="font-black text-stone-800 text-lg md:text-xl uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span>👫</span> Friends & Companions
            </h3>
            <p className="text-stone-600 font-bold text-xs uppercase tracking-wider mt-0.5">
              Add your real friends, rename them with funny titles, give high-fives & hear them cheer!
            </p>
          </div>

          <button
            onClick={openAddFriendModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-teal-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b-3 border-teal-700 hover:brightness-105 active:scale-95 transition-all shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4 text-teal-950" />
            <span>Add Real Friend</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 bg-stone-100/90 p-1.5 rounded-2xl max-w-md mx-auto border-2 border-stone-200">
        <button
          onClick={() => {
            soundFx.playPop(soundEnabled);
            setFilterTab('all');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            filterTab === 'all'
              ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All ({realFriends.length + combinedMascotFriends.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playPop(soundEnabled);
            setFilterTab('real');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            filterTab === 'real'
              ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>👫</span>
          <span>Real ({realFriends.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playPop(soundEnabled);
            setFilterTab('mascots');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            filterTab === 'mascots'
              ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>🐻</span>
          <span>Mascots ({combinedMascotFriends.length})</span>
        </button>
      </div>

      {/* Friends Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {displayFriends.map((friend) => {
          const isMascot = !friend.isReal;
          const isUnlocked = friend.isReal || unlockedIds.includes(friend.id);
          const canAfford = isMascot && availableCoins >= (friend.cost || 0);

          return (
            <motion.div
              key={friend.id}
              whileHover={isUnlocked ? { scale: 1.03, y: -3 } : {}}
              onClick={() => {
                if (isUnlocked) {
                  speakQuote(friend.name, friend.funnyNickname, friend.quote);
                }
              }}
              className={`relative p-4 rounded-[32px] border-4 transition-all cursor-pointer flex flex-col justify-between ${
                isUnlocked
                  ? friend.isReal
                    ? 'bg-gradient-to-b from-white via-sky-50/40 to-teal-50/60 border-teal-200 shadow-md hover:shadow-lg'
                    : 'bg-gradient-to-b from-white to-amber-50/50 border-amber-200 shadow-md hover:shadow-lg'
                  : 'bg-stone-50/80 border-stone-200 opacity-70'
              }`}
            >
              {/* High Five Floating Toast */}
              <AnimatePresence>
                {activeHighFiveId === friend.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1.2, y: -30 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                  >
                    <span className="bg-amber-400 text-amber-950 font-black text-sm px-3 py-1.5 rounded-full border-2 border-amber-600 shadow-lg flex items-center gap-1">
                      ✋ High Five Sent! +1
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Badges & Actions */}
              <div className="flex items-center justify-between w-full mb-1">
                {/* Role / Tag Badge */}
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border tracking-wide uppercase truncate max-w-[120px] ${
                  friend.isReal
                    ? 'bg-teal-100 text-teal-800 border-teal-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {friend.role}
                </span>

                {/* Edit Button for Unlocked Friends */}
                {isUnlocked && (
                  <button
                    onClick={(e) => openEditModal(e, friend)}
                    className="w-7 h-7 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-all shadow-xs"
                    title="Edit name, nickname, or quote"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Avatar & Animation */}
              <div className={`text-6xl my-2 flex justify-center ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                <motion.span
                  role="img"
                  aria-label={friend.name}
                  animate={isUnlocked ? {
                    y: [0, -6, 0],
                    rotate: [0, -4, 4, 0]
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {friend.emoji}
                </motion.span>
              </div>

              {/* Friend Info */}
              <div className="text-center space-y-1">
                {/* Real Name */}
                <p className="text-sm md:text-base font-black text-stone-800 uppercase tracking-tight truncate">
                  {friend.name}
                </p>

                {/* Funny Nickname / Title */}
                {friend.funnyNickname && friend.funnyNickname !== friend.name && (
                  <p className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 inline-block truncate max-w-full">
                    "{friend.funnyNickname}"
                  </p>
                )}

                {/* Quote Preview */}
                {isUnlocked && (
                  <p className="text-[11px] text-stone-500 italic line-clamp-2 px-1">
                    "{friend.quote}"
                  </p>
                )}

                {/* Bottom Interactive Controls */}
                {isUnlocked ? (
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => speakQuote(friend.name, friend.funnyNickname, friend.quote)}
                      className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <Volume2 className="w-3 h-3 text-amber-700" /> Hear Cheer
                    </button>

                    <button
                      onClick={(e) => handleGiveHighFive(e, friend.id)}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-400 hover:brightness-105 text-amber-950 border-b-2 border-amber-600 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all active:translate-y-0.5"
                    >
                      <Hand className="w-3 h-3" /> ✋ {friend.highFives}
                    </button>
                  </div>
                ) : (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUnlockClick(friend.id, friend.cost || 0)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 mx-auto transition-all shadow-sm ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border-b-2 border-amber-600 hover:brightness-105 active:border-b-0 active:translate-y-0.5'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3 h-3" /> {friend.cost} Coins
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Real Friend Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              className="bg-white rounded-3xl border-4 border-teal-200 p-5 md:p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-stone-100">
                <h3 className="text-lg font-black text-stone-800 uppercase tracking-tight flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-600" /> Add Real Friend
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRealFriend} className="mt-4 space-y-4">
                {/* Real Name */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Friend's Real Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lucas, Sophia, Mommy"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-teal-500 focus:outline-none font-bold text-stone-800 text-sm"
                  />
                </div>

                {/* Funny Nickname / Title */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Funny Nickname or Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Captain Giggles, Noodle Master, or keep original name!"
                    value={formNickname}
                    onChange={(e) => setFormNickname(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-teal-500 focus:outline-none font-bold text-stone-800 text-sm"
                  />
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">
                    Keep it as funny as you want, or leave blank to use their real name!
                  </p>
                </div>

                {/* Avatar Emoji Picker */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Choose Avatar Emoji
                  </label>
                  <div className="grid grid-cols-8 gap-1.5 p-2 bg-stone-50 rounded-2xl border-2 border-stone-200 max-h-28 overflow-y-auto">
                    {DEFAULT_AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormEmoji(emoji)}
                        className={`text-2xl p-1.5 rounded-xl transition-all ${
                          formEmoji === emoji
                            ? 'bg-teal-200 border-2 border-teal-500 scale-110 shadow-xs'
                            : 'hover:bg-stone-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role / Tag Selector */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Friend Tag
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-teal-500 focus:outline-none font-bold text-stone-800 text-sm bg-white"
                  >
                    {DEFAULT_ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Catchphrase / Cheer */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Funny Catchphrase / Cheer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High five bestie! Let us spell together!"
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-teal-500 focus:outline-none font-bold text-stone-800 text-sm"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-stone-500 font-black text-xs uppercase tracking-wider hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-teal-950 font-black text-xs uppercase tracking-wider border-b-3 border-teal-700 hover:brightness-105 active:scale-95 shadow-sm"
                  >
                    Save Friend 🎉
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Friend Modal */}
      <AnimatePresence>
        {editingFriend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              className="bg-white rounded-3xl border-4 border-amber-200 p-5 md:p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-stone-100">
                <h3 className="text-lg font-black text-stone-800 uppercase tracking-tight flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" /> Edit {editingFriend.name}
                </h3>
                <button
                  onClick={() => setEditingFriend(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditFriend} className="mt-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Friend Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none font-bold text-stone-800 text-sm"
                  />
                </div>

                {/* Funny Nickname */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Funny Nickname or Title
                  </label>
                  <input
                    type="text"
                    placeholder="Keep it as funny as it is or change it!"
                    value={formNickname}
                    onChange={(e) => setFormNickname(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none font-bold text-stone-800 text-sm"
                  />
                </div>

                {/* Avatar Emoji */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Avatar Emoji
                  </label>
                  <div className="grid grid-cols-8 gap-1.5 p-2 bg-stone-50 rounded-2xl border-2 border-stone-200 max-h-28 overflow-y-auto">
                    {DEFAULT_AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormEmoji(emoji)}
                        className={`text-2xl p-1.5 rounded-xl transition-all ${
                          formEmoji === emoji
                            ? 'bg-amber-200 border-2 border-amber-500 scale-110 shadow-xs'
                            : 'hover:bg-stone-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catchphrase / Quote */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-1">
                    Catchphrase / Cheer
                  </label>
                  <input
                    type="text"
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none font-bold text-stone-800 text-sm"
                  />
                </div>

                {/* Submit and Delete/Reset Options */}
                <div className="pt-3 flex items-center justify-between gap-2 border-t border-stone-100">
                  {editingFriend.isReal ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteRealFriend(editingFriend.id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs uppercase tracking-wider flex items-center gap-1 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResetMascotCustomization(editingFriend.id)}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-black text-xs uppercase tracking-wider flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingFriend(null)}
                      className="px-3 py-2 rounded-xl text-stone-500 font-black text-xs uppercase tracking-wider hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 font-black text-xs uppercase tracking-wider border-b-2 border-amber-600 hover:brightness-105 shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

