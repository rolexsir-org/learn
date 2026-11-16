import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, CheckCircle, Gift, Sparkles, Play, Trophy, ChevronRight } from 'lucide-react';
import { ThemedWorld, WordItem } from '../constants';
import { soundFx } from '../utils/audio';
import { ExplorerButton, ExplorerCard, IconBadge } from './UiCore';
import { cn } from '../lib/utils';

interface AdventureMapProps {
  world: ThemedWorld;
  wordsInWorld: WordItem[];
  completedWordIds: string[];
  activeWordIndex: number;
  onSelectWordIndex: (idx: number) => void;
  soundEnabled: boolean;
  onOpenTreasureChest: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  world,
  wordsInWorld,
  completedWordIds,
  activeWordIndex,
  onSelectWordIndex,
  onOpenTreasureChest,
}) => {
  const safeWords = wordsInWorld || [];

  return (
    <ExplorerCard glass padding="none" className="relative overflow-hidden border-none shadow-none bg-transparent">
      {/* Immersive World Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-gradient-to-br from-white/90 to-amber-50/50 p-8 rounded-[40px] border-4 border-amber-100 shadow-xl">
        <div className="flex items-center gap-6">
          <IconBadge
            icon={world.emoji}
            size="lg"
            color="bg-gradient-to-br from-amber-400 to-orange-500 border-amber-200 text-white shadow-lg animate-float"
          />
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-amber-950 flex items-center justify-center md:justify-start gap-2 mb-1">
              {world.name}
              <Sparkles className="w-6 h-6 text-amber-500 fill-amber-400" />
            </h2>
            <p className="text-sm text-amber-800/60 font-bold uppercase tracking-widest">
              Adventure Journey
            </p>
          </div>
        </div>

        <ExplorerButton variant="primary" onClick={() => { soundFx.playCoin(); onOpenTreasureChest(); }}>
          <Gift className="w-6 h-6 animate-bounce" />
          <span>Bonus Chest</span>
        </ExplorerButton>
      </div>

      {/* Winding Adventure Path */}
      <div className="relative pb-12">
        {/* Background Connector Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-amber-100/50 rounded-full hidden md:block" />

        <div className="flex flex-col gap-8 relative z-10">
          {safeWords.map((word, index) => {
            const wordIdLower = word.id.toLowerCase();
            const wordTextLower = word.text.toLowerCase();
            const isCompleted = completedWordIds.includes(wordIdLower) || completedWordIds.includes(wordTextLower);
            const isActive = index === activeWordIndex;
            
            const prevWord = index > 0 ? safeWords[index - 1] : null;
            const isPrevCompleted = prevWord
              ? (completedWordIds.includes(prevWord.id.toLowerCase()) || completedWordIds.includes(prevWord.text.toLowerCase()))
              : false;

            const isUnlocked = index === 0 || isCompleted || isPrevCompleted;
            const isOdd = index % 2 !== 0;

            return (
              <motion.div
                key={word.id || index}
                initial={{ opacity: 0, x: isOdd ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "flex items-center w-full",
                  isOdd ? "justify-end" : "justify-start"
                )}
              >
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      soundFx.playPop();
                      onSelectWordIndex(index);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={cn(
                    "group relative w-full md:w-[45%] p-5 rounded-[32px] border-4 transition-all duration-300 flex items-center gap-4 text-left soft-3d",
                    isActive
                      ? "bg-amber-400 border-amber-600 scale-105 z-20 shadow-amber-200"
                      : isCompleted
                      ? "bg-white border-emerald-400 hover:border-emerald-500 shadow-emerald-50"
                      : isUnlocked
                      ? "bg-white border-amber-200 hover:border-amber-400"
                      : "bg-stone-50 border-stone-200 opacity-60 grayscale cursor-not-allowed"
                  )}
                >
                  {/* Floating Rank Indicator */}
                  <div className={cn(
                    "absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2",
                    isActive ? "bg-amber-950 text-amber-400 border-white" : "bg-white text-stone-400 border-stone-100"
                  )}>
                    {index + 1}
                  </div>

                  {/* Icon Section */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner-soft transition-transform group-hover:scale-110",
                    isActive ? "bg-white text-amber-900" : isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-stone-100 text-stone-400"
                  )}>
                    {isUnlocked ? word.emoji : <Lock className="w-6 h-6" />}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "text-xl font-black uppercase tracking-tight truncate",
                      isActive ? "text-amber-950" : "text-stone-800"
                    )}>
                      {word.text}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                        isActive ? "bg-amber-950/20 text-amber-900" : "bg-stone-100 text-stone-400"
                      )}>
                        {word.category}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  {isUnlocked && !isCompleted && (
                    <ChevronRight className={cn("w-6 h-6", isActive ? "text-amber-950" : "text-amber-300")} />
                  )}
                  {isCompleted && <CheckCircle className="w-8 h-8 text-emerald-500 fill-emerald-50" />}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* World Summary Banner */}
      <ExplorerCard className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 border-none shadow-soft-3d-lg mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner">
              🏅
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-black uppercase tracking-widest opacity-80">World Mastery</p>
              <h4 className="text-3xl font-black drop-shadow-sm">
                {Math.round((completedWordIds.length / safeWords.length) * 100)}% Complete
              </h4>
            </div>
          </div>

          <ExplorerButton variant="glass" onClick={() => { soundFx.playSuccessFanfare(); onOpenTreasureChest(); }}>
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>View Rewards</span>
          </ExplorerButton>
        </div>
      </ExplorerCard>
    </ExplorerCard>
  );
};

export default AdventureMap;
