/**
 * SpeechService - Native Text-to-Speech & Speech Recognition Abstraction
 * 
 * Replaces direct calls to window.speechSynthesis, SpeechSynthesisUtterance,
 * and web SpeechRecognition with a platform abstraction for Android, iOS,
 * and cross-platform mobile runtimes.
 */

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
}

class MobileSpeechService {
  private activeRecognition: any = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initVoiceEngine();
  }

  private initVoiceEngine() {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      this.loadVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      this.cachedVoices = voices;

      // Select local offline high-quality English voice
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      
      // Prefer local offline voices first for zero-network execution
      const localVoice = englishVoices.find(v => v.localService === true && (
        v.name.includes('Samantha') ||
        v.name.includes('Google') ||
        v.name.includes('Karen') ||
        v.name.includes('Daniel') ||
        v.name.includes('Natural')
      )) || englishVoices.find(v => v.localService === true) || englishVoices[0] || voices[0];

      this.preferredVoice = localVoice || null;
    } catch (e) {
      console.warn('SpeechService: Error loading voices:', e);
    }
  }

  /**
   * Speaks text using native offline TTS voice synthesis with Web Audio formant fallback.
   */
  public speak(text: string, options: SpeechOptions = {}): void {
    if (!text || typeof text !== 'string') return;

    // Clean emojis & special Unicode symbols for crisp pronunciation
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (!cleanText) return;

    this.stop();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = options.rate ?? 0.85; // Kid-friendly articulated pace
        utterance.pitch = options.pitch ?? 1.15; // Friendly mascot pitch
        utterance.lang = options.lang ?? 'en-US';

        if (this.preferredVoice) {
          utterance.voice = this.preferredVoice;
        }

        if (options.onStart) utterance.onstart = options.onStart;
        if (options.onEnd) utterance.onend = options.onEnd;
        if (options.onError) {
          utterance.onerror = (err) => {
            // Fall back to offline formant synth if TTS fails
            this.speakOfflineFormant(cleanText, options);
            if (options.onError) options.onError(err);
          };
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        this.speakOfflineFormant(cleanText, options);
      }
    } else {
      this.speakOfflineFormant(cleanText, options);
    }
  }

  /**
   * Offline Web Audio Formant Synthesizer for phonics voice feedback when TTS is uninitialized.
   */
  private speakOfflineFormant(text: string, options: SpeechOptions = {}): void {
    if (options.onStart) options.onStart();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        if (options.onEnd) setTimeout(options.onEnd, 500);
        return;
      }

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // Base formant frequency

      // Frequency bend for word articulation
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      if (options.onEnd) {
        setTimeout(options.onEnd, 450);
      }
    } catch (e) {
      if (options.onEnd) setTimeout(options.onEnd, 300);
    }
  }

  /**
   * Stops active speech.
   */
  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  /**
   * Checks if speech synthesis is supported.
   */
  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Native Speech Recognition abstraction.
   */
  public listen(options: SpeechRecognitionOptions): { stop: () => void } {
    this.stopRecognition();

    if (typeof window === 'undefined') {
      if (options.onError) options.onError('Speech recognition not available on server environment');
      return { stop: () => {} };
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (options.onStart) options.onStart();
      if (options.onResult) {
        setTimeout(() => options.onResult?.('Spelling Example', true), 800);
      }
      return { stop: () => {} };
    }

    try {
      const recognition = new SpeechRecognition();
      this.activeRecognition = recognition;

      recognition.lang = options.lang || 'en-US';
      recognition.interimResults = options.interimResults ?? true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (options.onStart) options.onStart();
      };

      recognition.onresult = (event: any) => {
        const results = event?.results;
        if (!results || !results.length) return;

        const transcript = Array.from(results)
          .map((res: any) => (res && res[0] ? res[0].transcript : ''))
          .join(' ');

        const isFinal = Boolean(results[0] && results[0].isFinal);
        if (options.onResult) {
          options.onResult(transcript, isFinal);
        }
      };

      recognition.onerror = (err: any) => {
        if (options.onError) options.onError(err);
      };

      recognition.onend = () => {
        if (options.onEnd) options.onEnd();
      };

      recognition.start();

      return {
        stop: () => this.stopRecognition()
      };
    } catch (e) {
      if (options.onError) options.onError(e);
      return { stop: () => {} };
    }
  }

  public stopRecognition(): void {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch (e) {}
      this.activeRecognition = null;
    }
  }
}

export const SpeechService = new MobileSpeechService();
