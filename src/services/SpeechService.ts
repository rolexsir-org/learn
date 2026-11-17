import { AudioManager } from './AudioManager';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (err: unknown) => void;
  onEnd?: () => void;
}

export interface AvailableSpeechVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
}

class MobileSpeechService {
  private activeRecognition: any = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceListeners = new Set<(voices: AvailableSpeechVoice[]) => void>();
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeStopCallback: (() => void) | null = null;

  constructor() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', () => this.loadVoices());
  }

  private loadVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.voices = window.speechSynthesis.getVoices();
      const options = this.getAvailableVoices();
      this.voiceListeners.forEach((listener) => listener(options));
    } catch { this.voices = []; }
  }

  refreshVoices(): AvailableSpeechVoice[] {
    this.loadVoices();
    return this.getAvailableVoices();
  }

  /** Only expose exact US/GB English engines; no unsupported accent is implied. */
  getAvailableVoices(): AvailableSpeechVoice[] {
    return this.voices
      .filter((voice) => /^(en-US|en-GB)$/i.test(voice.lang))
      .map((voice) => ({ voiceURI: voice.voiceURI, name: voice.name, lang: voice.lang, localService: voice.localService }));
  }

  subscribeVoices(listener: (voices: AvailableSpeechVoice[]) => void): () => void {
    this.voiceListeners.add(listener);
    listener(this.getAvailableVoices());
    return () => this.voiceListeners.delete(listener);
  }

  speak(text: string, options: SpeechOptions = {}): void {
    const cleanText = typeof text === 'string'
      ? text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim()
      : '';
    if (!cleanText || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onError?.(new Error('Text-to-speech is not available on this device.'));
      return;
    }
    if (AudioManager.isMuted() || AudioManager.getVoiceVolume() <= 0) return;

    this.stop();
    const prefs = AudioManager.getPreferences();
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = options.rate ?? prefs.speechRate;
      utterance.pitch = options.pitch ?? 1;
      const selectedVoice = prefs.voiceURI ? this.voices.find((voice) => voice.voiceURI === prefs.voiceURI) : undefined;
      const exactLocaleVoice = prefs.voiceLocale === 'device' ? undefined : this.voices.find((voice) => voice.lang.toLowerCase() === prefs.voiceLocale.toLowerCase());
      const voice = selectedVoice || exactLocaleVoice;
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else if (prefs.voiceLocale !== 'device') {
        // Keep the requested locale truthful; browser/OS may choose its own fallback voice.
        utterance.lang = prefs.voiceLocale;
      } else {
        const systemVoice = this.voices.find((candidate) => /^en-/i.test(candidate.lang));
        if (systemVoice) {
          utterance.voice = systemVoice;
          utterance.lang = systemVoice.lang;
        }
      }
      utterance.volume = AudioManager.getVoiceVolume();
      utterance.onstart = () => { AudioManager.beginVoice(); options.onStart?.(); };
      utterance.onend = () => {
        if (this.activeUtterance !== utterance) return;
        this.activeUtterance = null;
        this.activeStopCallback = null;
        AudioManager.endVoice();
        options.onEnd?.();
      };
      utterance.onerror = (event) => {
        if (this.activeUtterance !== utterance) return;
        this.activeUtterance = null;
        this.activeStopCallback = null;
        AudioManager.endVoice();
        options.onError?.(event);
      };
      this.activeUtterance = utterance;
      this.activeStopCallback = options.onEnd || null;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      AudioManager.endVoice();
      options.onError?.(error);
    }
  }

  pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.pause();
  }

  resume(): void {
    if (AudioManager.isMuted()) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.resume();
  }

  stop(): void {
    const hadUtterance = this.activeUtterance !== null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch { /* unsupported platform */ }
    }
    this.activeUtterance = null;
    const callback = this.activeStopCallback;
    this.activeStopCallback = null;
    AudioManager.endVoice();
    if (hadUtterance) callback?.();
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  listen(options: SpeechRecognitionOptions): { stop: () => void } {
    this.stopRecognition();
    if (typeof window === 'undefined') {
      options.onError?.(new Error('Speech recognition is not available in this environment.'));
      return { stop: () => undefined };
    }
    const RecognitionConstructor = (window as typeof window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition
      || (window as typeof window & { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!RecognitionConstructor) {
      options.onError?.(new Error('Speech recognition is not supported by this browser.'));
      return { stop: () => undefined };
    }
    try {
      const recognition = new RecognitionConstructor();
      this.activeRecognition = recognition;
      recognition.lang = options.lang || 'en-US';
      recognition.interimResults = options.interimResults ?? true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => options.onStart?.();
      recognition.onresult = (event: any) => {
        const results = Array.from(event.results as ArrayLike<{ isFinal: boolean; 0?: { transcript?: string } }>);
        const transcript = results.map((result) => result[0]?.transcript || '').join(' ');
        const isFinal = results.some((result) => result.isFinal);
        options.onResult?.(transcript, isFinal);
      };
      recognition.onerror = (event: unknown) => options.onError?.(event);
      recognition.onend = () => {
        if (this.activeRecognition === recognition) this.activeRecognition = null;
        options.onEnd?.();
      };
      recognition.start();
      return { stop: () => this.stopRecognition() };
    } catch (error) {
      options.onError?.(error);
      return { stop: () => undefined };
    }
  }

  stopRecognition(): void {
    if (!this.activeRecognition) return;
    try { this.activeRecognition.stop(); } catch { /* recognizer may already have stopped */ }
    this.activeRecognition = null;
  }
}

export const SpeechService = new MobileSpeechService();
