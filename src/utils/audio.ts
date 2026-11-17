import { AudioManager } from '../services/AudioManager';

/** Backwards-compatible semantic sound facade; all effects share the app audio bus. */
class SoundEffectsFacade {
  setSoundEnabled(enabled: boolean): void { AudioManager.setSoundEnabled(enabled); }
  playPop(enabled?: boolean): void { AudioManager.playEffect('tap', enabled !== false); }
  playChime(enabled?: boolean): void { AudioManager.playEffect('reward', enabled !== false); }
  playSuccessFanfare(enabled?: boolean): void { AudioManager.playEffect('achievement', enabled !== false); }
  playCoin(enabled?: boolean): void { AudioManager.playEffect('reward', enabled !== false); }
  playUnlock(enabled?: boolean): void { AudioManager.playEffect('unlock', enabled !== false); }
  playCorrect(enabled?: boolean): void { AudioManager.playEffect('correct', enabled !== false); }
  playIncorrect(enabled?: boolean): void { AudioManager.playEffect('incorrect', enabled !== false); }
  playNav(enabled?: boolean): void { AudioManager.playEffect('transition', enabled !== false); }
}

export const soundFx = new SoundEffectsFacade();
