import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, Sparkles, Heart, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useMascot, MascotEmotion } from '../context/MascotContext';
import { soundFx } from '../utils/audio';
import { SpeechService } from '../services/SpeechService';

interface FloatingMascotProps {
  soundEnabled?: boolean;
}

const FUN_FACTS = [
  "Did you know? The word 'SET' has the most definitions in the English dictionary! 📖",
  "Fun fact: 'ALPHABET' comes from the first two Greek letters: Alpha & Beta! 🔤",
  "Did you know? 'SWIMS' looks the same upside down! 🏊‍♂️",
  "Fact: The shortest complete sentence in English is 'I AM.' ⚡",
  "Spelling every day builds super strong memory muscles in your brain! 🧠✨",
  "High five! You are doing amazing learning new words today! 🙌"
];

export default function FloatingMascot({ soundEnabled = true }: FloatingMascotProps) {
  const {
    currentMessage,
    emotion,
    mascotName,
    mascotEmoji,
    isMinimized,
    showThoughtBubble,
    hideThoughtBubble,
    toggleMinimize
  } = useMascot();

  const [isBlinking, setIsBlinking] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  // Periodic blinking eyes effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  const speak = (text: string) => {
    if (!soundEnabled) return;
    SpeechService.speak(`${mascotName} says: ${text}`, { rate: 0.95, pitch: 1.2 });
  };

  const handleMascotTap = () => {
    soundFx.playPop(soundEnabled);
    if (!currentMessage) {
      const nextFact = FUN_FACTS[factIndex % FUN_FACTS.length];
      setFactIndex((prev) => prev + 1);
      showThoughtBubble(nextFact, 'thinking');
      speak(nextFact);
    } else {
      speak(currentMessage);
    }
  };

  const emotionBadges: Record<MascotEmotion, { badgeBg: string; textColor: string; icon: string }> = {
    happy: { badgeBg: 'bg-amber-100 border-amber-300', textColor: 'text-amber-900', icon: '✨' },
    thinking: { badgeBg: 'bg-sky-100 border-sky-300', textColor: 'text-sky-900', icon: '💡' },
    excited: { badgeBg: 'bg-yellow-100 border-yellow-400', textColor: 'text-yellow-950', icon: '🌟' },
    proud: { badgeBg: 'bg-purple-100 border-purple-300', textColor: 'text-purple-900', icon: '👑' },
    cheering: { badgeBg: 'bg-emerald-100 border-emerald-300', textColor: 'text-emerald-900', icon: '🎉' }
  };

  const badgeStyle = emotionBadges[emotion] || emotionBadges.happy;

  return (
    <div className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-40 pointer-events-none flex flex-col items-end select-none">
      {/* Thought Bubble / Message Cloud */}
      <AnimatePresence>
        {currentMessage && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto max-w-xs md:max-w-sm mb-3 bg-white/95 backdrop-blur-md p-4 rounded-[28px] border-4 border-amber-200 shadow-2xl relative mr-2"
          >
            {/* Thought Bubble Tail Pointing Down to Mascot */}
            <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white border-r-4 border-b-4 border-amber-200 rotate-45" />

            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeStyle.badgeBg} ${badgeStyle.textColor} flex items-center gap-1`}>
                  <span>{badgeStyle.icon}</span> {mascotName}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => speak(currentMessage)}
                  className="p-1 hover:bg-stone-100 rounded-full transition-colors text-amber-700"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={hideThoughtBubble}
                  className="p-1 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
                  title="Close thought"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs md:text-sm font-bold text-stone-800 leading-snug">
              "{currentMessage}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mascot Character & Controls */}
      <div className="pointer-events-auto flex items-end gap-2">
        {/* Minimize / Collapse Toggle Button */}
        <button
          onClick={() => {
            soundFx.playPop(soundEnabled);
            toggleMinimize();
          }}
          className="p-2 bg-white/90 hover:bg-white text-stone-500 hover:text-stone-800 rounded-2xl border-2 border-amber-200 shadow-md transition-all active:scale-90"
          title={isMinimized ? "Expand Mascot" : "Minimize Mascot"}
        >
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Floating Mascot Avatar with Motion */}
        <AnimatePresence mode="wait">
          {!isMinimized ? (
            <motion.div
              key="mascot-full"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                y: [0, -8, 0]
              }}
              exit={{ scale: 0 }}
              transition={{
                scale: { type: 'spring', stiffness: 300, damping: 20 },
                y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
              }}
              onClick={handleMascotTap}
              className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-amber-300 via-yellow-300 to-amber-200 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Tap Barnaby for encouragement or fun facts!"
            >
              {/* Mascot Emoji with blinking animation filter */}
              <motion.span
                animate={isBlinking ? { scaleY: 0.2 } : { scaleY: 1 }}
                transition={{ duration: 0.1 }}
                className="text-4xl md:text-5xl select-none"
              >
                {mascotEmoji}
              </motion.span>

              {/* Sparkle Badge */}
              <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-xs">
                ✨
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mascot-min"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={handleMascotTap}
              className="w-10 h-10 bg-amber-300 rounded-2xl border-2 border-white shadow-md flex items-center justify-center text-xl cursor-pointer hover:scale-110 active:scale-90 transition-transform"
              title="Expand Barnaby"
            >
              {mascotEmoji}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
