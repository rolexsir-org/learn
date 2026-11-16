import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemedWorld } from '../constants';

interface AmbientEnvironmentProps {
  world: ThemedWorld;
  soundEnabled: boolean;
  children: React.ReactNode;
}

// Web Audio API Ambient Sound Synthesizer for thematic atmospheres
class AmbientSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private isRunning: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(worldId: string, enabled: boolean) {
    this.stop();
    if (!enabled) return;

    this.initCtx();
    if (!this.ctx) return;

    this.isRunning = true;

    // Periodically play soft, subtle ambient atmosphere tones
    this.intervalId = setInterval(() => {
      if (!this.isRunning || !this.ctx) return;

      try {
        if (worldId === 'meadow') {
          // Gentle bird chirps / meadow wind
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400 + Math.random() * 400, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(2200 + Math.random() * 300, this.ctx.currentTime + 0.12);
          
          gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.15);
        } else if (worldId === 'ocean') {
          // Gentle ocean wave bubble swoosh
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(120 + Math.random() * 60, this.ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(240 + Math.random() * 80, this.ctx.currentTime + 0.8);

          gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.8);
        } else if (worldId === 'space') {
          // Cosmic soft hum / twinkling resonance
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25 + Math.random() * 200, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.012, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 1.2);
        } else if (worldId === 'jungle') {
          // Jungle chime / firefly tinkle
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880 + Math.random() * 600, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.4);
        } else if (worldId === 'castle') {
          // Royal harp / soft bell chime
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(659.25 + (Math.floor(Math.random() * 4) * 100), this.ctx.currentTime);

          gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.6);
        }
      } catch (e) {
        // Audio policy protection
      }
    }, 4500);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

const synth = new AmbientSoundSynthesizer();

export default function AmbientEnvironment({ world, soundEnabled, children }: AmbientEnvironmentProps) {
  useEffect(() => {
    synth.start(world.id, soundEnabled);
    return () => {
      synth.stop();
    };
  }, [world.id, soundEnabled]);

  // Generate dynamic shifting background particle positions
  const particles = React.useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: (i * 11 + 7) % 95 + 2,
      y: (i * 17 + 5) % 90 + 5,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background Animated Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Dynamic Gradient Transition */}
        <motion.div
          key={world.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className={`absolute inset-0 bg-gradient-to-b ${world.bgGradient}`}
        />

        {/* Ambient Shifting Particle Glows */}
        {particles.map((p) => (
          <motion.div
            key={`${world.id}-p-${p.id}`}
            initial={{ opacity: 0.1, y: 0 }}
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              opacity: [0.15, 0.45, 0.15]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut'
            }}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size * 2}px`,
              height: `${p.size * 2}px`,
              willChange: 'transform, opacity'
            }}
            className="absolute rounded-full bg-white/40 blur-xs gpu-accelerated pointer-events-none"
          />
        ))}
      </div>

      {/* Main Wrapped Application Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
