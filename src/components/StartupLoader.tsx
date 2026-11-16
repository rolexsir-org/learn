import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetCacheService, PreloadProgress } from '../services/AssetCacheService';
import { Sparkles, Map as MapIcon, Music, Ghost } from 'lucide-react';
import { ProgressPill } from './UiCore';

export const StartupLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState<PreloadProgress>(AssetCacheService.getStatus());
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const unsubscribe = AssetCacheService.subscribeProgress((p) => {
      setProgress(p);
      if (p.isComplete) {
        // Delay slightly for visual smoothness
        setTimeout(onComplete, 1200);
      }
    });

    setTimeout(() => setShowContent(true), 200);

    return () => unsubscribe();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-amber-50 flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border-[40px] border-amber-200 border-dashed rounded-full"
        />
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 flex flex-col items-center max-w-md w-full text-center"
          >
            {/* Mascot Avatar */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl md:text-9xl mb-8 drop-shadow-soft-3d-lg"
            >
              🐻
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-black text-amber-950 mb-2 tracking-tighter drop-shadow-sm">
              English Explorer
            </h1>

            <p className="text-amber-800/60 font-bold uppercase tracking-[0.2em] text-xs mb-10">
              Preparing the World...
            </p>

            {/* Progress Container */}
            <div className="w-full bg-white/80 backdrop-blur-md p-6 rounded-[32px] border-3 border-amber-200 shadow-xl">
              <div className="flex justify-between items-end mb-3">
                <div className="text-left">
                  <div className="text-[10px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                    {progress.percentage < 33 && <MapIcon className="w-3 h-3" />}
                    {progress.percentage >= 33 && progress.percentage < 66 && <Music className="w-3 h-3" />}
                    {progress.percentage >= 66 && <Sparkles className="w-3 h-3 text-amber-500" />}
                    <span>{progress.percentage < 100 ? 'Warming Assets' : 'World Ready!'}</span>
                  </div>
                  <div className="text-sm font-black text-stone-700 truncate w-48">
                    {progress.currentAsset || 'Initializing...'}
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600 tabular-nums">
                  {progress.percentage}%
                </div>
              </div>

              <ProgressPill progress={progress.percentage} />
            </div>

            {/* Tips / Encouragement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex items-center gap-3 bg-amber-100/50 px-5 py-3 rounded-2xl border border-amber-200"
            >
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs">
                💡
              </div>
              <p className="text-xs font-bold text-amber-900 text-left leading-tight">
                Tip: Master 3 words in a world to earn a special world sticker!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
