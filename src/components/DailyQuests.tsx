import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Award } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Quest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rewardCoins: number;
  rewardXp: number;
  current: number;
  target: number;
  isClaimed: boolean;
}

interface DailyQuestsProps {
  wordsLearnedToday: number;
  accuracyToday: number;
  onClaimQuestReward: (questId: string, coins: number, xp: number) => void;
  claimedQuestIds: string[];
  soundEnabled: boolean;
}

export default function DailyQuests({
  wordsLearnedToday,
  accuracyToday,
  onClaimQuestReward,
  claimedQuestIds,
  soundEnabled
}: DailyQuestsProps) {
  const quests: Quest[] = [
    {
      id: 'quest_words_3',
      title: 'Word Master Scout',
      description: 'Spell 3 words in any world today.',
      emoji: '📚',
      rewardCoins: 25,
      rewardXp: 20,
      current: Math.min(3, wordsLearnedToday),
      target: 3,
      isClaimed: claimedQuestIds.includes('quest_words_3')
    },
    {
      id: 'quest_accuracy',
      title: 'Star Precision',
      description: 'Achieve 100% accuracy on a word game.',
      emoji: '🎯',
      rewardCoins: 30,
      rewardXp: 25,
      current: accuracyToday >= 100 ? 1 : 0,
      target: 1,
      isClaimed: claimedQuestIds.includes('quest_accuracy')
    },
    {
      id: 'quest_words_5',
      title: 'Explorer Champion',
      description: 'Master 5 total words in your journey.',
      emoji: '🏆',
      rewardCoins: 50,
      rewardXp: 40,
      current: Math.min(5, wordsLearnedToday),
      target: 5,
      isClaimed: claimedQuestIds.includes('quest_words_5')
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/90 backdrop-blur-md p-5 rounded-[32px] border-4 border-amber-100 shadow-md text-center">
        <h3 className="font-black text-stone-800 text-lg uppercase tracking-tight flex items-center justify-center gap-2">
          <span>⚡</span> Daily Missions & Quests
        </h3>
        <p className="text-stone-500 font-bold text-xs uppercase tracking-wider mt-0.5">
          Complete daily challenges to collect bonus magic coins!
        </p>
      </div>

      <div className="space-y-3">
        {quests.map((quest) => {
          const isReady = quest.current >= quest.target;

          return (
            <div
              key={quest.id}
              className={`p-4 rounded-[28px] border-4 flex items-center justify-between gap-3 transition-all ${
                quest.isClaimed
                  ? 'bg-emerald-50/80 border-emerald-200 opacity-80'
                  : isReady
                  ? 'bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 border-amber-400 shadow-lg'
                  : 'bg-white border-stone-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border-2 border-stone-200 flex items-center justify-center text-2xl shrink-0">
                  {quest.emoji}
                </div>
                <div>
                  <h4 className="font-black text-stone-800 text-sm uppercase tracking-wide">
                    {quest.title}
                  </h4>
                  <p className="text-stone-500 font-bold text-xs leading-tight mb-2">
                    {quest.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-32 md:w-40 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                {quest.isClaimed ? (
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-2xl border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Claimed
                  </span>
                ) : isReady ? (
                  <button
                    onClick={() => {
                      soundFx.playCoin(soundEnabled);
                      onClaimQuestReward(quest.id, quest.rewardCoins, quest.rewardXp);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-xs uppercase tracking-wider rounded-2xl border-b-3 border-amber-600 shadow-md transition-all active:scale-95 animate-pulse"
                  >
                    Claim +{quest.rewardCoins} 🪙
                  </button>
                ) : (
                  <span className="text-[10px] font-black uppercase text-stone-400 bg-stone-100 px-3 py-1.5 rounded-2xl border border-stone-200">
                    {quest.current} / {quest.target}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
