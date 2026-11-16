import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, CheckCircle, X, Award, Star } from 'lucide-react';
import { STICKERS, StickerItem } from '../constants';
import { soundFx } from '../utils/audio';

interface StickerAlbumProps {
  userXp: number;
  soundEnabled: boolean;
}

export default function StickerAlbum({ userXp, soundEnabled }: StickerAlbumProps) {
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-md p-5 rounded-[32px] border-4 border-amber-100 shadow-md text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-300 to-yellow-400 rounded-3xl flex items-center justify-center mx-auto mb-2 border-b-4 border-amber-600 text-3xl shadow-md">
          🎨
        </div>
        <h3 className="font-black text-stone-800 text-xl uppercase tracking-tight">Magic Sticker Album</h3>
        <p className="text-stone-500 font-bold text-xs uppercase tracking-wider mt-1">
          Collect stickers by spelling words and leveling up your Explorer Rank!
        </p>
      </div>

      {/* Grid of Stickers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {STICKERS.map((sticker) => {
          const isUnlocked = userXp >= sticker.unlockedAtXp;

          return (
            <motion.div
              key={sticker.id}
              whileHover={isUnlocked ? { scale: 1.05, y: -4 } : {}}
              onClick={() => {
                soundFx.playPop(soundEnabled);
                setSelectedSticker(sticker);
              }}
              className={`p-4 rounded-[28px] border-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden ${
                isUnlocked
                  ? 'bg-gradient-to-b from-white via-amber-50/50 to-yellow-50 border-amber-300 shadow-lg'
                  : 'bg-stone-100/90 border-stone-200 opacity-60 grayscale'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
              )}

              <div className="text-5xl mb-2 drop-shadow-sm select-none">
                {sticker.emoji}
              </div>

              <h4 className="font-black text-stone-800 text-xs uppercase tracking-tight line-clamp-1">
                {sticker.title}
              </h4>

              <div className="mt-2">
                {isUnlocked ? (
                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> {sticker.unlockedAtXp} XP
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSticker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center relative border-4 border-amber-200 shadow-2xl"
            >
              <button
                onClick={() => setSelectedSticker(null)}
                className="absolute top-5 right-5 p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>

              <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
                {selectedSticker.emoji}
              </div>

              <h3 className="text-2xl font-black text-stone-800 uppercase tracking-tight mb-2">
                {selectedSticker.title}
              </h3>

              <p className="text-stone-600 font-bold text-xs leading-relaxed mb-6">
                {selectedSticker.description}
              </p>

              {userXp >= selectedSticker.unlockedAtXp ? (
                <div className="p-3 bg-emerald-100 rounded-2xl border border-emerald-300 text-emerald-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Sticker in your collection!
                </div>
              ) : (
                <div className="p-3 bg-stone-100 rounded-2xl border border-stone-300 text-stone-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-stone-400" /> Earn {selectedSticker.unlockedAtXp - userXp} more XP to unlock!
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
