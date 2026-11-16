/**
 * Advanced Kid-Friendly UI Audio Engine
 * Uses Web Audio API to synthesize high-quality, multi-harmonic instrument-like sounds.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime); // Global volume limit
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  // Helper for bouncier, multi-harmonic tones
  private async playTone(options: {
    freqs: number[],
    type?: OscillatorType,
    duration: number,
    attack?: number,
    decay?: number,
    glide?: number
  }) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const { freqs, type = 'sine', duration, attack = 0.02, decay = 0.1, glide = 0 } = options;
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      if (glide > 0) {
        osc.frequency.exponentialRampToValueAtTime(freq * glide, now + duration);
      }

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2 / freqs.length, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  playPop() {
    this.playTone({
      freqs: [300, 450],
      duration: 0.1,
      glide: 1.5,
      type: 'sine'
    });
  }

  playChime() {
    // C5, E5, G5, C6 arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.50];
    this.playTone({
      freqs: chord,
      duration: 0.5,
      attack: 0.05,
      type: 'triangle'
    });
  }

  playSuccessFanfare() {
    const chord = [523.25, 659.25, 783.99, 987.77, 1046.50];
    this.playTone({
      freqs: chord,
      duration: 1.2,
      attack: 0.1,
      type: 'sine'
    });
  }

  playCoin() {
    this.playTone({
      freqs: [987.77, 1318.51], // B5 -> E6
      duration: 0.3,
      attack: 0.01,
      type: 'sine'
    });
  }

  playUnlock() {
    this.playTone({
      freqs: [440, 554.37, 659.25, 880], // A4, C#5, E5, A5
      duration: 0.6,
      attack: 0.08,
      type: 'triangle'
    });
  }

  playCorrect() {
    this.playTone({
      freqs: [783.99, 1046.50], // G5 -> C6
      duration: 0.4,
      glide: 1.1,
      type: 'sine'
    });
  }

  playIncorrect() {
    this.playTone({
      freqs: [220, 164.81], // A3 -> E3 slide down
      duration: 0.3,
      glide: 0.8,
      type: 'triangle'
    });
  }

  playNav() {
    this.playTone({
      freqs: [400],
      duration: 0.08,
      type: 'sine'
    });
  }
}

export const soundFx = new SoundEngine();
