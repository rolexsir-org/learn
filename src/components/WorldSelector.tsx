import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Check, ArrowRight } from 'lucide-react';
import { THEMED_WORLDS, ThemedWorld } from '../constants';
import { soundFx } from '../utils/audio';

interface WorldSelectorProps {
  currentWorld: ThemedWorld;
  userXp: number;
  onSelectWorld: (world: ThemedWorld) => void;
  soundEnabled: boolean;
}

export default function WorldSelector({ currentWorld, userXp, onSelectWorld, soundEnabled }: WorldSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border-4 border-amber-100 shadow-sm text-center">
        <h3 className="font-black text-stone-800 text-lg uppercase tracking-tight flex items-center justify-center gap-2">
          <span>🌎</span> Adventure Worlds & Environments
        </h3>
        <p className="text-stone-500 font-bold text-xs uppercase tracking-wider mt-0.5">
          Earn XP by spelling words to unlock new magical realms!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {THEMED_WORLDS.map((world) => {
          const isUnlocked = userXp >= world.requiredXp;
          const isActive = currentWorld.id === world.id;

          return (
            <motion.div
              key={world.id}
              whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
              onClick={() => {
                if (isUnlocked) {
                  soundFx.playUnlock(soundEnabled);
                  onSelectWorld(world);
                }
              }}
              className={`relative p-5 rounded-[32px] border-4 transition-all cursor-pointer overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-amber-400 shadow-xl ring-4 ring-amber-300/50'
                  : isUnlocked
                  ? 'bg-white border-stone-200 shadow-md hover:border-amber-300'
                  : 'bg-stone-100/90 border-stone-200 opacity-75'
              }`}
            >
              {/* Banner / Emoji Background Overlay */}
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border-2 border-stone-200 flex items-center justify-center text-3xl">
                    {world.emoji}
                  </div>
                  <div>
                    <h4 className="font-black text-stone-800 text-base md:text-lg uppercase tracking-wide flex items-center gap-2">
                      {world.name}
                      {isActive && (
                        <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black border border-amber-600">
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-stone-500 font-bold text-xs leading-snug line-clamp-2 max-w-xs">
                      {world.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="mt-4 pt-3 border-t-2 border-stone-100/80 flex items-center justify-between relative z-10">
                {isUnlocked ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Unlocked
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playUnlock(soundEnabled);
                        onSelectWorld(world);
                      }}
                      className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm ${
                        isActive
                          ? 'bg-amber-400 text-amber-950 border-b-2 border-amber-600'
                          : 'bg-stone-800 text-white hover:bg-stone-900 border-b-2 border-stone-950'
                      }`}
                    >
                      <span>{isActive ? 'Exploring' : 'Enter Realm'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 text-stone-500 font-bold text-xs">
                      <Lock className="w-4 h-4 text-stone-400" />
                      <span>Unlocks at <strong>{world.requiredXp} XP</strong></span>
                    </div>

                    <div className="w-24 h-2.5 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${Math.min(100, (userXp / world.requiredXp) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
