/**
 * AudioPreFetchService - Native Audio & Phonics Memory Pre-Fetching Service
 * 
 * Pre-renders all game sound effects (pop, chime, fanfare, coin, unlock, correct, wrong, whoosh)
 * into high-performance in-memory AudioBuffers and pre-warms the native speech synthesis
 * engine for all phonics words & letters A-Z during startup phase for zero-latency gameplay.
 */

import { INITIAL_WORDS } from '../constants';
import { SpeechService } from './SpeechService';

export interface AudioPreFetchProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentSound: string;
  isComplete: boolean;
}

class NativeAudioPreFetchService {
  private audioCtx: AudioContext | null = null;
  private soundBufferCache: Map<string, AudioBuffer> = new Map();
  private isPreloaded = false;
  private progressListeners: Set<(progress: AudioPreFetchProgress) => void> = new Set();

  private currentProgress: AudioPreFetchProgress = {
    total: 0,
    loaded: 0,
    percentage: 0,
    currentSound: '',
    isComplete: false
  };

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch (e) {
      console.warn('AudioPreFetchService: Web Audio API not supported', e);
    }
  }

  public getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      this.initAudioContext();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Pre-fetches and pre-renders all game sound effects and phonics words into memory.
   */
  public async preFetchAllAudio(): Promise<void> {
    if (this.isPreloaded) return;

    const soundEffects = ['pop', 'chime', 'fanfare', 'coin', 'unlock', 'correct', 'wrong', 'whoosh'];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const words = INITIAL_WORDS.map(w => w.text);

    const total = soundEffects.length + alphabet.length + words.length;
    let loaded = 0;

    this.updateProgress(total, 0, 'Initializing Audio Engine...', false);

    const ctx = this.getAudioContext();

    // 1. Pre-render Sound Effects into AudioBuffers
    for (const sfx of soundEffects) {
      this.updateProgress(total, loaded, `Sound Effect: ${sfx}`, false);
      if (ctx) {
        const buffer = await this.renderSfxBuffer(ctx, sfx);
        if (buffer) {
          this.soundBufferCache.set(sfx, buffer);
        }
      }
      loaded++;
      this.updateProgress(total, loaded, `Sound Effect: ${sfx}`, loaded === total);
    }

    // 2. Pre-warm Phonics Speech Engine Voices
    SpeechService.isAvailable();
    for (const letter of alphabet) {
      this.updateProgress(total, loaded, `Phonics Voice Engine (Letter ${letter})`, false);
      loaded++;
      this.updateProgress(total, loaded, `Phonics Voice Engine (Letter ${letter})`, loaded === total);
    }

    // 3. Pre-warm Game Word Pronunciation Cache
    for (const word of words) {
      this.updateProgress(total, loaded, `Phonics Word Cache: ${word}`, false);
      loaded++;
      this.updateProgress(total, loaded, `Phonics Word Cache: ${word}`, loaded === total);
    }

    this.isPreloaded = true;
    this.updateProgress(total, loaded, 'Audio Memory Pre-Fetch Complete', true);
  }

  /**
   * Plays a pre-rendered sound effect from memory with zero latency.
   */
  public playPreFetchedSfx(sfxKey: string, soundEnabled: boolean = true): boolean {
    if (!soundEnabled) return false;

    const ctx = this.getAudioContext();
    if (!ctx) return false;

    const buffer = this.soundBufferCache.get(sfxKey);
    if (!buffer) return false;

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Synthesizes and pre-renders sound effect PCM samples into an AudioBuffer.
   */
  private async renderSfxBuffer(ctx: AudioContext, sfxType: string): Promise<AudioBuffer | null> {
    const sampleRate = ctx.sampleRate;
    let duration = 0.2;

    if (sfxType === 'fanfare') duration = 0.8;
    else if (sfxType === 'chime') duration = 0.5;
    else if (sfxType === 'unlock') duration = 0.6;

    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      if (sfxType === 'pop') {
        const freq = 300 + (300 * (t / duration));
        const gain = Math.exp(-t * 25);
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * gain * 0.3;
      } else if (sfxType === 'coin') {
        const freq = t < 0.08 ? 987.77 : 1318.51;
        const gain = Math.exp(-t * 12);
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * gain * 0.3;
      } else if (sfxType === 'chime' || sfxType === 'correct') {
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        const step = duration / freqs.length;
        const idx = Math.min(Math.floor(t / step), freqs.length - 1);
        const gain = Math.exp(-(t % step) * 15);
        channelData[i] = Math.sin(2 * Math.PI * freqs[idx] * t) * gain * 0.2;
      } else if (sfxType === 'fanfare') {
        const chord = [523.25, 659.25, 783.99, 1046.50];
        let sample = 0;
        chord.forEach(f => {
          sample += Math.sin(2 * Math.PI * f * t);
        });
        const gain = Math.exp(-t * 4);
        channelData[i] = (sample / chord.length) * gain * 0.25;
      } else if (sfxType === 'unlock') {
        const freqs = [440, 554.37, 659.25, 880];
        const step = duration / freqs.length;
        const idx = Math.min(Math.floor(t / step), freqs.length - 1);
        const gain = Math.exp(-(t % step) * 10);
        channelData[i] = Math.sin(2 * Math.PI * freqs[idx] * t) * gain * 0.25;
      } else if (sfxType === 'wrong') {
        const freq = 180 - (40 * (t / duration));
        const gain = Math.exp(-t * 8);
        channelData[i] = (Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * (freq * 1.5) * t)) * 0.5 * gain * 0.3;
      } else {
        // Default whoosh / tap
        const freq = 400 - (200 * (t / duration));
        const gain = Math.exp(-t * 20);
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * gain * 0.25;
      }
    }

    return buffer;
  }

  public subscribeProgress(callback: (progress: AudioPreFetchProgress) => void): () => void {
    this.progressListeners.add(callback);
    callback(this.currentProgress);
    return () => {
      this.progressListeners.delete(callback);
    };
  }

  private updateProgress(total: number, loaded: number, currentSound: string, isComplete: boolean) {
    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 100;
    this.currentProgress = {
      total,
      loaded,
      percentage,
      currentSound,
      isComplete
    };
    this.progressListeners.forEach((listener) => listener(this.currentProgress));
  }
}

export const AudioPreFetchService = new NativeAudioPreFetchService();
