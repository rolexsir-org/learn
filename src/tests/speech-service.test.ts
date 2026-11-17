import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from '../services/AudioManager';
import { SpeechService } from '../services/SpeechService';

const originalSpeechSynthesis = Object.getOwnPropertyDescriptor(window, 'speechSynthesis');

describe('device speech integration', () => {
  afterEach(() => {
    SpeechService.stop();
    if (originalSpeechSynthesis) Object.defineProperty(window, 'speechSynthesis', originalSpeechSynthesis);
    else Reflect.deleteProperty(window, 'speechSynthesis');
    vi.unstubAllGlobals();
  });

  it('uses only the selected device voice and applies voice volume and playback rate', () => {
    const britishVoice = { voiceURI: 'uk-1', name: 'English UK Voice', lang: 'en-GB', localService: true, default: false } as SpeechSynthesisVoice;
    const americanVoice = { voiceURI: 'us-1', name: 'English US Voice', lang: 'en-US', localService: true, default: false } as SpeechSynthesisVoice;
    const unsupportedVoice = { voiceURI: 'au-1', name: 'English AU Voice', lang: 'en-AU', localService: true, default: false } as SpeechSynthesisVoice;
    const synth = { getVoices: () => [britishVoice, americanVoice, unsupportedVoice], cancel: vi.fn(), speak: vi.fn(), pause: vi.fn(), resume: vi.fn() };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
    class FakeUtterance {
      text: string; rate = 1; pitch = 1; lang = ''; volume = 1; voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null; onend: (() => void) | null = null; onerror: ((event: unknown) => void) | null = null;
      constructor(text: string) { this.text = text; }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    expect(SpeechService.refreshVoices().map((voice) => voice.lang)).toEqual(['en-GB', 'en-US']);
    AudioManager.updatePreferences({ voiceURI: 'uk-1', voiceLocale: 'en-GB', voiceVolume: 0.47, speechRate: 0.75, muted: false });

    const onEnd = vi.fn();
    SpeechService.speak('Hello, learner!', { onEnd });
    const utterance = synth.speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.voice).toBe(britishVoice);
    expect(utterance.lang).toBe('en-GB');
    expect(utterance.volume).toBe(0.47);
    expect(utterance.rate).toBe(0.75);
    utterance.onstart?.();
    SpeechService.pause();
    SpeechService.resume();
    expect(synth.pause).toHaveBeenCalledOnce();
    expect(synth.resume).toHaveBeenCalledOnce();
    SpeechService.stop();
    expect(synth.cancel).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalledOnce();
  });
});
