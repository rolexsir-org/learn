import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemedWorld } from '../constants';
import { soundFx } from '../utils/audio';

interface InteractiveBackgroundProps {
  world: ThemedWorld;
  soundEnabled: boolean;
}

interface FloatingElement {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function InteractiveBackground({ world, soundEnabled }: InteractiveBackgroundProps) {
  const [pops, setPops] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  // Seed floaters for active world
  const floaters: FloatingElement[] = React.useMemo(() => {
    const list: FloatingElement[] = [];
    const emojis = world.particleEmojis || ['✨', '☁️', '⭐', '🎈'];
    for (let i = 0; i < 14; i++) {
      list.push({
        id: i,
        emoji: emojis[i % emojis.length],
        x: (i * 7 + 5) % 90 + 3,
        y: (i * 13 + 10) % 80 + 10,
        size: Math.floor(Math.random() * 16) + 24, // 24px to 40px
        duration: Math.random() * 6 + 6, // 6s to 12s
        delay: Math.random() * 3
      });
    }
    return list;
  }, [world.id]);

  const handleFloaterClick = (e: React.MouseEvent, floater: FloatingElement) => {
    e.stopPropagation();
    soundFx.playPop(soundEnabled);

    const rect = e.currentTarget.getBoundingClientRect();
    const popId = Date.now() + Math.random();
    setPops(prev => [
      ...prev,
      { id: popId, x: rect.left + rect.width / 2, y: rect.top, text: '✨ Sparkle!' }
    ]);

    setTimeout(() => {
      setPops(prev => prev.filter(p => p.id !== popId));
    }, 1000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-1000">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${world.bgGradient} opacity-90 transition-all duration-1000`} />

      {/* Floating Interactive World Particles */}
      {floaters.map((floater) => (
        <motion.div
          key={`${world.id}-${floater.id}`}
          initial={{ y: '0%', opacity: 0.4 }}
          animate={{
            y: ['-10%', '10%', '-10%'],
            x: ['-5%', '5%', '-5%'],
            rotate: [-6, 6, -6],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{
            duration: floater.duration,
            repeat: Infinity,
            delay: floater.delay,
            ease: 'easeInOut'
          }}
          onClick={(e) => handleFloaterClick(e, floater)}
          style={{
            left: `${floater.x}%`,
            top: `${floater.y}%`,
            fontSize: `${floater.size}px`
          }}
          className="absolute cursor-pointer pointer-events-auto hover:scale-125 transition-transform active:scale-90 drop-shadow-md filter"
          title="Tap me for magic!"
        >
          {floater.emoji}
        </motion.div>
      ))}

      {/* Floating Sparkle Feedback FX */}
      <AnimatePresence>
        {pops.map(pop => (
          <motion.div
            key={pop.id}
            initial={{ opacity: 1, y: pop.y, x: pop.x - 30, scale: 0.8 }}
            animate={{ opacity: 0, y: pop.y - 40, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed z-50 font-black text-amber-500 text-xs bg-white/90 px-2.5 py-1 rounded-full border border-amber-300 shadow-lg pointer-events-none"
          >
            {pop.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
