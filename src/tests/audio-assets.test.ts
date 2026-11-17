import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tracks = ['calm', 'reading', 'game', 'celebration'] as const;

describe('offline bundled music', () => {
  it('ships original local WAV tracks small enough for the native app bundle', () => {
    for (const name of tracks) {
      const path = `public/audio/${name}.wav`;
      const header = readFileSync(path).subarray(0, 12).toString('ascii');
      expect(header.slice(0, 4)).toBe('RIFF');
      expect(header.slice(8, 12)).toBe('WAVE');
      expect(statSync(path).size).toBeLessThan(900_000);
    }
  });
});
