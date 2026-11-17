import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from '../services/AudioManager';

let oscillatorSpy = vi.fn();

describe('central audio manager', () => {
  beforeEach(() => {
    AudioManager.setScene('learn');
    AudioManager.updatePreferences({
      muted: false,
      musicEnabled: false,
      musicVolume: 0.18,
      effectsVolume: 0.42,
      voiceVolume: 0.9,
      voiceLocale: 'device',
      voiceURI: null,
      speechRate: 0.9,
    });
  });

  it('persists independent volume, voice, and music preferences locally', () => {
    AudioManager.updatePreferences({ musicVolume: 0.31, effectsVolume: 0.24, voiceVolume: 0.72, speechRate: 1.05, voiceLocale: 'en-GB' });
    const stored = JSON.parse(localStorage.getItem('learn_audio_preferences_v1') || '{}');
    expect(stored).toMatchObject({ musicVolume: 0.31, effectsVolume: 0.24, voiceVolume: 0.72, speechRate: 1.05, voiceLocale: 'en-GB' });
  });

  it('does not start music until music is opted into, then pauses and resumes on app lifecycle changes', async () => {
    const audioInstances: Array<{ src: string; paused: boolean; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; volume: number; currentTime: number; duration: number; loop: boolean; preload: string; load: ReturnType<typeof vi.fn>; addEventListener: ReturnType<typeof vi.fn>; removeAttribute: ReturnType<typeof vi.fn> }> = [];
    class MockAudio {
      src = '';
      paused = true;
      volume = 1;
      currentTime = 0;
      duration = 18;
      loop = false;
      preload = '';
      play = vi.fn(async () => { this.paused = false; });
      pause = vi.fn(() => { this.paused = true; });
      load = vi.fn();
      addEventListener = vi.fn();
      removeAttribute = vi.fn(() => { this.src = ''; });
      constructor() { audioInstances.push(this); }
    }
    vi.stubGlobal('Audio', MockAudio);

    AudioManager.setScene('story');
    expect(audioInstances).toHaveLength(0);
    AudioManager.updatePreferences({ musicEnabled: true });
    await vi.waitFor(() => expect(audioInstances.some((audio) => audio.src.endsWith('/audio/reading.wav') && audio.play.mock.calls.length > 0)).toBe(true));
    const player = audioInstances.find((audio) => audio.src.endsWith('/audio/reading.wav'))!;
    expect(player.loop).toBe(true);
    expect(player.volume).toBe(0);

    AudioManager.setAppActive(false);
    expect(player.pause).toHaveBeenCalled();
    AudioManager.setAppActive(true);
    await vi.waitFor(() => expect(player.play).toHaveBeenCalledTimes(2));
    AudioManager.setScene('game');
    await vi.waitFor(() => expect(audioInstances.some((audio) => audio.src.endsWith('/audio/game.wav') && audio.play.mock.calls.length > 0)).toBe(true));
    AudioManager.updatePreferences({ musicEnabled: false });
    AudioManager.setScene('learn');
    vi.unstubAllGlobals();
  });

  it('plays short synthesized effects through the shared effects bus', () => {
    const createOscillator = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { setValueAtTime: vi.fn() } }));
    oscillatorSpy = createOscillator;
    const createGain = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn(), gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() } }));
    class FakeContext {
      currentTime = 0; destination = {};
      createOscillator = createOscillator;
      createGain = createGain;
      resume = vi.fn(async () => undefined);
      state = 'running';
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, writable: true, value: FakeContext });
    AudioManager.updatePreferences({ effectsVolume: 0.3, muted: false });
    AudioManager.playEffect('achievement');
    expect(createOscillator).toHaveBeenCalledTimes(4);
    expect(createGain).toHaveBeenCalledTimes(5);
  });

  it('global mute silences the shared effects bus and is persisted', () => {
    AudioManager.setMuted(true);
    expect(AudioManager.isMuted()).toBe(true);
    expect(JSON.parse(localStorage.getItem('learn_audio_preferences_v1') || '{}').muted).toBe(true);
    const before = oscillatorSpy.mock.calls.length;
    AudioManager.playEffect('tap');
    expect(oscillatorSpy.mock.calls.length).toBe(before);
  });
});
