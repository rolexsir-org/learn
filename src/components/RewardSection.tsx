import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Zap, ShoppingBag, X, Trophy, Flame } from 'lucide-react';
import { LEVEL_TITLES } from '../constants';
import { fireTreasureChestConfetti } from '../utils/confetti';

interface RewardSectionProps {
  stars: number;
  coins: number;
  streak: number;
  dailyBonusAvailable?: boolean;
  onClaimDaily?: () => void;
}

export default function RewardSection({ stars, coins, streak, dailyBonusAvailable, onClaimDaily }: RewardSectionProps) {
  const [showChest, setShowChest] = useState(false);

  // Compute Level from stars
  const xp = stars * 10;
  const currentLevelObj = [...LEVEL_TITLES].reverse().find(l => xp >= l.minXp) || LEVEL_TITLES[0];
  const nextLevelObj = LEVEL_TITLES.find(l => l.level === currentLevelObj.level + 1);

  const levelMin = currentLevelObj.minXp;
  const levelMax = nextLevelObj ? nextLevelObj.minXp : levelMin + 100;
  const levelProgress = Math.min(100, Math.max(0, ((xp - levelMin) / (levelMax - levelMin)) * 100));

  const handleClaim = () => {
    if (dailyBonusAvailable && onClaimDaily) {
      onClaimDaily();
      fireTreasureChestConfetti();
    }
    setShowChest(false);
  };

  return (
    <div className="w-full bg-white border-4 border-stone-200 rounded-[32px] p-4 md:p-5 shadow-lg mb-6 flex flex-col gap-3">
      {/* Top Bar: Level & XP Progress */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md border-b-2 border-indigo-700">
            L{currentLevelObj.level}
          </div>
          <div>
            <div className="font-black text-stone-800 text-xs md:text-sm uppercase tracking-wide">
              {currentLevelObj.name}
            </div>
            <div className="w-28 md:w-40 h-2.5 bg-stone-100 rounded-full overflow-hidden mt-1 shadow-inner border border-stone-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Action Button: Daily Gift Chest */}
        <button
          onClick={() => setShowChest(true)}
          className="relative group px-3.5 py-2 bg-gradient-to-b from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 rounded-2xl flex items-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-md"
        >
          <Gift className="w-5 h-5 text-amber-950 group-hover:rotate-12 transition-transform" />
          <span className="font-black text-amber-950 text-xs uppercase tracking-wider hidden sm:inline">Bonus</span>
          {dailyBonusAvailable && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
          )}
        </button>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t-2 border-stone-100">
        <div className="flex items-center justify-center gap-1.5 bg-yellow-50/80 px-2.5 py-2 rounded-2xl border border-yellow-200">
          <span className="text-lg">⭐</span>
          <span className="font-black text-yellow-800 text-sm md:text-base">{stars}</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 bg-amber-50/80 px-2.5 py-2 rounded-2xl border border-amber-200">
          <span className="text-lg">🪙</span>
          <span className="font-black text-amber-800 text-sm md:text-base">{coins}</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 bg-orange-50/80 px-2.5 py-2 rounded-2xl border border-orange-200">
          <span className="text-lg">🔥</span>
          <span className="font-black text-orange-800 text-xs md:text-sm">{streak}d</span>
        </div>
      </div>

      {/* Daily Reward Treasure Chest Modal */}
      <AnimatePresence>
        {showChest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center relative overflow-hidden border-4 border-amber-200 shadow-2xl"
            >
              <button
                onClick={() => setShowChest(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-600 transition-colors"
                id="close-reward"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6 relative">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, -6, 6, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="w-28 h-28 bg-gradient-to-b from-amber-300 to-yellow-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg border-b-6 border-amber-600 text-5xl"
                >
                  🎁
                </motion.div>
                <div className="absolute inset-0 bg-yellow-300/30 blur-2xl -z-10 rounded-full" />
              </div>

              <h2 className="text-2xl font-black text-stone-800 mb-1 tracking-tight uppercase">Daily Treasure!</h2>
              <p className="text-stone-500 mb-6 font-bold text-xs tracking-wide">
                {dailyBonusAvailable ? "OPEN YOUR CHEST TO CLAIM FREE REWARDS!" : "ALREADY OPENED TODAY! COME BACK TOMORROW."}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <Star className="w-7 h-7 text-yellow-500 mx-auto mb-1 fill-yellow-500" />
                  <span className="text-2xl font-black text-amber-900">+5 Stars</span>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <span className="text-2xl block mb-1">🪙</span>
                  <span className="text-2xl font-black text-amber-900">+50 Coins</span>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={!dailyBonusAvailable}
                className={`w-full py-4 rounded-2xl text-lg font-black shadow-lg transition-all ${
                  dailyBonusAvailable
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
                id="claim-reward"
              >
                {dailyBonusAvailable ? "CLAIM TREASURE!" : "CLAIMED TODAY"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
