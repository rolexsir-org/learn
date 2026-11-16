import React, { useState, useEffect } from 'react';
import { DeviceService, ScreenOrientationType } from '../services/DeviceService';
import { RotateCw, Smartphone, Play } from 'lucide-react';

export const OrientationLockGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orientation, setOrientation] = useState<ScreenOrientationType>(() => DeviceService.getOrientation());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = DeviceService.subscribeOrientation((newOrientation) => {
      setOrientation(newOrientation);
      if (newOrientation === 'landscape') {
        setDismissed(false);
      }
    });

    DeviceService.lockLandscapeOrientation().catch(console.warn);

    return () => unsubscribe();
  }, []);

  const handleAttemptLock = () => {
    DeviceService.lockLandscapeOrientation().catch(console.warn);
    setDismissed(true);
  };

  const showGuard = orientation === 'portrait' && !dismissed;

  return (
    <div className="relative w-full h-full">
      {children}

      {showGuard && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center mb-6 animate-bounce shadow-xl">
            <RotateCw className="w-12 h-12 text-amber-300 animate-spin-slow" />
          </div>

          <h2 className="text-3xl font-black mb-3 tracking-wide text-amber-300 font-display">
            Rotate Your Device 🔄
          </h2>

          <p className="text-lg text-slate-200 max-w-md mb-8 font-medium leading-relaxed">
            For the best immersive game experience with colorful worlds, phonics activities, and interactive mascots, please turn your device to <span className="text-amber-300 font-bold">Landscape Mode</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleAttemptLock}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg hover:shadow-amber-500/30 transition-all transform active:scale-95 flex items-center gap-3 text-lg"
            >
              <Smartphone className="w-6 h-6 rotate-90" />
              Lock Landscape & Play
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 transition-all flex items-center gap-2 text-sm"
            >
              <Play className="w-4 h-4" />
              Continue Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
