import { StorageService } from './StorageService';

export type MusicScene = 'learn' | 'story' | 'game' | 'celebration' | 'world';
export type EffectName = 'tap' | 'correct' | 'incorrect' | 'reward' | 'achievement' | 'unlock' | 'transition' | 'notification';
export type VoiceLocale = 'en-US' | 'en-GB' | 'device';

export interface MusicPlaybackStatus {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  scene: MusicScene;
}

export interface AudioPreferences {
  muted: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  voiceVolume: number;
  voiceLocale: VoiceLocale;
  voiceURI: string | null;
  speechRate: number;
}

const PREFERENCES_KEY = 'learn_audio_preferences_v1';
const TRACKS: Record<MusicScene, string> = {
  learn: '/audio/calm.wav',
  story: '/audio/reading.wav',
  game: '/audio/game.wav',
  celebration: '/audio/celebration.wav',
  world: '/audio/calm.wav',
};
const WORLD_TRACKS: Record<string, string> = {
  ocean: '/audio/calm.wav', meadow: '/audio/calm.wav', farm: '/audio/calm.wav',
  jungle: '/audio/game.wav', space: '/audio/reading.wav', castle: '/audio/reading.wav',
};
const DEFAULTS: AudioPreferences = {
  muted: false,
  // Music remains opt-in: turning on the existing sound button never starts music unexpectedly.
  musicEnabled: false,
  musicVolume: 0.18,
  effectsVolume: 0.42,
  voiceVolume: 0.9,
  voiceLocale: 'device',
  voiceURI: null,
  speechRate: 0.9,
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

/** One app-wide owner of music, short effects, sound preferences, and app visibility. */
class AudioManagerService {
  private preferences: AudioPreferences = this.readPreferences();
  private listeners = new Set<(preferences: AudioPreferences) => void>();
  private playbackListeners = new Set<(status: MusicPlaybackStatus) => void>();
  private context: AudioContext | null = null;
  private effectsBus: GainNode | null = null;
  private musicPlayers: HTMLAudioElement[] = [];
  private activePlayer = 0;
  private desiredTrack = TRACKS.learn;
  private scene: MusicScene = 'learn';
  private worldId = '';
  private appActive = true;
  private wasPlayingBeforePause = false;
  private speechActive = false;
  private transition = 0;
  private sceneGeneration = 0;
  private celebrationTimer: ReturnType<typeof setTimeout> | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private lastEffectAt = new Map<EffectName, number>();
  private idleCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private visibilityHandler = () => this.setAppActive(document.visibilityState === 'visible');

  constructor() {
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  getPreferences(): AudioPreferences {
    return { ...this.preferences };
  }

  getPlaybackStatus(): MusicPlaybackStatus {
    const player = this.musicPlayers[this.activePlayer];
    return {
      currentTime: player?.currentTime || 0,
      duration: Number.isFinite(player?.duration) ? player.duration : 0,
      isPlaying: Boolean(player && !player.paused),
      scene: this.scene,
    };
  }

  subscribePlayback(listener: (status: MusicPlaybackStatus) => void): () => void {
    this.playbackListeners.add(listener);
    listener(this.getPlaybackStatus());
    return () => this.playbackListeners.delete(listener);
  }

  subscribe(listener: (preferences: AudioPreferences) => void): () => void {
    this.listeners.add(listener);
    listener(this.getPreferences());
    return () => this.listeners.delete(listener);
  }

  updatePreferences(patch: Partial<AudioPreferences>): void {
    const next = { ...this.preferences, ...patch };
    next.musicVolume = clamp(next.musicVolume);
    next.effectsVolume = clamp(next.effectsVolume);
    next.voiceVolume = clamp(next.voiceVolume);
    next.speechRate = Math.max(0.6, Math.min(1.2, Number(next.speechRate) || DEFAULTS.speechRate));
    if (!['en-US', 'en-GB', 'device'].includes(next.voiceLocale)) next.voiceLocale = DEFAULTS.voiceLocale;
    this.preferences = next;
    this.persist();
    this.applyVolumes();
    this.listeners.forEach((listener) => listener(this.getPreferences()));
    if (patch.muted === true || patch.musicEnabled === false) this.pauseMusic();
    else if (this.preferences.musicEnabled && !this.preferences.muted && this.appActive && !this.speechActive) void this.playScene();
  }

  setMuted(muted: boolean): void {
    this.updatePreferences({ muted });
    if (muted) {
      this.stopSpeechSynthesis();
      this.speechActive = false;
    }
  }

  /** Compatibility shim for existing screens; false is a global mute. */
  setSoundEnabled(enabled: boolean): void {
    this.setMuted(!enabled);
  }

  isMuted(): boolean { return this.preferences.muted; }
  getVoiceVolume(): number { return this.preferences.muted ? 0 : this.preferences.voiceVolume; }

  setScene(scene: MusicScene, worldId = this.worldId): void {
    this.sceneGeneration++;
    if (this.celebrationTimer) clearTimeout(this.celebrationTimer);
    this.celebrationTimer = null;
    this.scene = scene;
    this.worldId = worldId;
    this.desiredTrack = scene === 'world' ? (WORLD_TRACKS[worldId] || TRACKS.world) : TRACKS[scene];
    if (this.preferences.musicEnabled && !this.preferences.muted && this.appActive && !this.speechActive) void this.playScene();
    else this.pauseMusic();
    this.notifyPlayback();
  }

  playCelebration(durationMs = 8000): void {
    if (!this.preferences.musicEnabled || this.preferences.muted || !this.appActive) return;
    const previousScene = this.scene;
    const previousWorld = this.worldId;
    this.setScene('celebration', previousWorld);
    const generation = this.sceneGeneration;
    this.celebrationTimer = setTimeout(() => {
      if (this.sceneGeneration === generation) this.setScene(previousScene, previousWorld);
    }, Math.max(1000, durationMs));
  }

  async playScene(): Promise<void> {
    if (!this.preferences.musicEnabled || this.preferences.muted || !this.appActive || this.speechActive || typeof Audio === 'undefined') return;
    const current = this.musicPlayers[this.activePlayer];
    if (current?.src.endsWith(this.desiredTrack)) {
      if (!current.paused) return;
      const version = ++this.transition;
      current.volume = 0;
      try {
        await current.play();
        if (version !== this.transition) { current.pause(); return; }
        this.fadePlayers(undefined, current, version);
        this.notifyPlayback();
      } catch { /* wait for a user gesture or a later foreground event */ }
      return;
    }
    const version = ++this.transition;
    const nextIndex = 1 - this.activePlayer;
    const next = this.getMusicPlayer(nextIndex);
    if (!next.src.endsWith(this.desiredTrack)) {
      next.pause();
      next.src = this.desiredTrack;
      next.currentTime = 0;
      next.load();
    }
    next.loop = true;
    next.volume = 0;
    try {
      await next.play();
      if (version !== this.transition || !this.preferences.musicEnabled || this.preferences.muted || !this.appActive) {
        next.pause();
        return;
      }
      this.fadePlayers(current, next, version);
      this.activePlayer = nextIndex;
    } catch {
      // Browser autoplay policy, missing asset, or a transient interruption: wait for another user gesture.
    }
  }

  preloadScene(scene: MusicScene, worldId = this.worldId): void {
    if (typeof Audio === 'undefined') return;
    const source = scene === 'world' ? (WORLD_TRACKS[worldId] || TRACKS.world) : TRACKS[scene];
    const active = this.musicPlayers[this.activePlayer];
    if (active?.src.endsWith(source)) return;
    const player = this.getMusicPlayer(1 - this.activePlayer);
    player.preload = 'metadata';
    player.src = source;
    player.load();
  }

  pauseMusic(): void {
    this.transition++;
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    this.musicPlayers.forEach((player) => {
      if (!player.paused) player.pause();
    });
    this.notifyPlayback();
  }

  resumeMusic(): void {
    if (this.preferences.musicEnabled && !this.preferences.muted && this.appActive && !this.speechActive) void this.playScene();
  }

  replayMusic(): void {
    const player = this.musicPlayers[this.activePlayer];
    if (player) player.currentTime = 0;
    this.resumeMusic();
  }

  seekMusic(time: number): void {
    const player = this.musicPlayers[this.activePlayer];
    if (!player || !Number.isFinite(player.duration) || player.duration <= 0) return;
    player.currentTime = Math.max(0, Math.min(player.duration, time));
    this.notifyPlayback();
  }

  beginVoice(): void {
    this.speechActive = true;
    this.pauseMusic();
  }

  endVoice(): void {
    this.speechActive = false;
    if (this.preferences.musicEnabled && !this.preferences.muted && this.appActive) void this.playScene();
  }

  setAppActive(active: boolean): void {
    if (this.appActive === active) return;
    this.appActive = active;
    if (!active) {
      this.wasPlayingBeforePause = this.musicPlayers.some((player) => !player.paused);
      this.pauseMusic();
      this.stopSpeechSynthesis();
      this.endVoice();
      this.context?.suspend().catch(() => undefined);
    } else {
      if (this.context?.state === 'suspended') this.context.resume().catch(() => undefined);
      if (this.wasPlayingBeforePause && this.preferences.musicEnabled && !this.preferences.muted) void this.playScene();
      this.wasPlayingBeforePause = false;
    }
  }

  /** Small, synthesized, non-overlapping feedback; creates no decoded audio cache. */
  playEffect(name: EffectName, forceEnabled = true): void {
    if (!forceEnabled || this.preferences.muted || this.preferences.effectsVolume <= 0 || !this.appActive || this.speechActive || typeof window === 'undefined') return;
    const nowMs = Date.now();
    if (nowMs - (this.lastEffectAt.get(name) || 0) < 90) return;
    const mostRecentEffect = Math.max(0, ...this.lastEffectAt.values());
    if (nowMs - mostRecentEffect < 35) return;
    this.lastEffectAt.set(name, nowMs);
    const ctx = this.getContext();
    if (!ctx || !this.effectsBus) return;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    const patterns: Record<EffectName, { notes: number[]; duration: number; wave: OscillatorType }> = {
      tap: { notes: [440], duration: 0.07, wave: 'sine' },
      correct: { notes: [659, 784], duration: 0.22, wave: 'sine' },
      incorrect: { notes: [392, 330], duration: 0.18, wave: 'sine' },
      reward: { notes: [523, 659, 784], duration: 0.42, wave: 'triangle' },
      achievement: { notes: [523, 659, 784, 988], duration: 0.65, wave: 'sine' },
      unlock: { notes: [440, 554, 659, 880], duration: 0.45, wave: 'triangle' },
      transition: { notes: [494], duration: 0.08, wave: 'sine' },
      notification: { notes: [587, 784], duration: 0.18, wave: 'sine' },
    };
    const pattern = patterns[name];
    const start = ctx.currentTime + 0.005;
    const level = this.preferences.effectsVolume * 0.12 / pattern.notes.length;
    pattern.notes.forEach((frequency, index) => {
      const when = start + index * Math.min(0.075, pattern.duration / pattern.notes.length);
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = pattern.wave;
      oscillator.frequency.setValueAtTime(frequency, when);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(level, when + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + pattern.duration);
      oscillator.connect(gain);
      gain.connect(this.effectsBus!);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(when);
      oscillator.stop(when + pattern.duration + 0.02);
    });
    this.idleCloseTimer = setTimeout(() => {
      if (this.context && !this.appActive) return;
      const context = this.context;
      this.context = null;
      this.effectsBus = null;
      if (context) void context.close().catch(() => undefined);
    }, 30_000);
  }

  destroy(): void {
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.visibilityHandler);
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    if (this.idleCloseTimer) clearTimeout(this.idleCloseTimer);
    if (this.celebrationTimer) clearTimeout(this.celebrationTimer);
    this.pauseMusic();
    this.musicPlayers.forEach((player) => { player.pause(); player.removeAttribute('src'); player.load(); });
    this.musicPlayers = [];
    void this.context?.close().catch(() => undefined);
    this.context = null;
    this.effectsBus = null;
  }

  private readPreferences(): AudioPreferences {
    try {
      const saved = StorageService.getItemSync<Partial<AudioPreferences> | null>(PREFERENCES_KEY, null);
      if (saved && typeof saved === 'object') {
        const locale = saved.voiceLocale;
        return {
          muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULTS.muted,
          musicEnabled: typeof saved.musicEnabled === 'boolean' ? saved.musicEnabled : DEFAULTS.musicEnabled,
          musicVolume: clamp(Number(saved.musicVolume ?? DEFAULTS.musicVolume)),
          effectsVolume: clamp(Number(saved.effectsVolume ?? DEFAULTS.effectsVolume)),
          voiceVolume: clamp(Number(saved.voiceVolume ?? DEFAULTS.voiceVolume)),
          voiceLocale: locale === 'en-US' || locale === 'en-GB' || locale === 'device' ? locale : DEFAULTS.voiceLocale,
          voiceURI: typeof saved.voiceURI === 'string' ? saved.voiceURI : null,
          speechRate: Math.max(0.6, Math.min(1.2, Number(saved.speechRate ?? DEFAULTS.speechRate) || DEFAULTS.speechRate)),
        };
      }
      const legacy = StorageService.getItemSync<string | null>('sound_enabled', null);
      return { ...DEFAULTS, muted: legacy === 'false' };
    } catch { return { ...DEFAULTS }; }
  }

  private persist(): void {
    StorageService.setItem(PREFERENCES_KEY, this.preferences);
    // Keep the legacy toggle in sync during the transition to the unified preference model.
    StorageService.setItem('sound_enabled', String(!this.preferences.muted));
  }

  private getContext(): AudioContext | null {
    if (this.idleCloseTimer) clearTimeout(this.idleCloseTimer);
    this.idleCloseTimer = null;
    if (!this.context && typeof window !== 'undefined') {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      try {
        this.context = new AudioCtor();
        this.effectsBus = this.context.createGain();
        this.effectsBus.gain.value = 1;
        this.effectsBus.connect(this.context.destination);
      } catch { this.context = null; }
    }
    return this.context;
  }

  private applyVolumes(): void {
    if (this.effectsBus) this.effectsBus.gain.setTargetAtTime(this.preferences.muted ? 0 : 1, this.context?.currentTime || 0, 0.025);
    this.musicPlayers.forEach((player) => {
      if (player === this.musicPlayers[this.activePlayer]) player.volume = this.preferences.muted ? 0 : this.preferences.musicVolume;
    });
  }

  private getMusicPlayer(index: number): HTMLAudioElement {
    if (!this.musicPlayers[index]) {
      const player = new Audio();
      player.preload = 'none';
      player.volume = 0;
      player.addEventListener('error', () => { player.pause(); this.notifyPlayback(); });
      for (const eventName of ['timeupdate', 'durationchange', 'loadedmetadata', 'play', 'pause', 'ended']) {
        player.addEventListener(eventName, () => this.notifyPlayback());
      }
      this.musicPlayers[index] = player;
    }
    return this.musicPlayers[index];
  }

  private fadePlayers(oldPlayer: HTMLAudioElement | undefined, newPlayer: HTMLAudioElement, version: number): void {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    const steps = 24;
    let step = 0;
    const oldStart = oldPlayer && !oldPlayer.paused ? oldPlayer.volume : 0;
    const newEnd = this.preferences.muted ? 0 : this.preferences.musicVolume;
    this.fadeTimer = setInterval(() => {
      if (version !== this.transition) {
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        this.fadeTimer = null;
        return;
      }
      step++;
      const progress = Math.min(1, step / steps);
      if (oldPlayer && oldPlayer !== newPlayer) oldPlayer.volume = Math.max(0, oldStart * (1 - progress));
      newPlayer.volume = newEnd * progress;
      if (step >= steps) {
        if (oldPlayer && oldPlayer !== newPlayer) oldPlayer.pause();
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, 35);
  }

  private notifyPlayback(): void {
    const status = this.getPlaybackStatus();
    this.playbackListeners.forEach((listener) => listener(status));
  }

  private stopSpeechSynthesis(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}

export const AudioManager = new AudioManagerService();
