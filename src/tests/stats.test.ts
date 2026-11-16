import { describe, it, expect } from 'vitest';

// Simulating the stats calculation logic from App.tsx
function calculateAccuracy(completedWords: { accuracy: number }[]) {
  if (completedWords.length === 0) return 100;
  const sum = completedWords.reduce((acc, w) => acc + (w.accuracy || 100), 0);
  return Math.round(sum / completedWords.length);
}

describe('Stats Logic', () => {
  it('calculates average accuracy correctly', () => {
    const words = [
      { accuracy: 100 },
      { accuracy: 80 },
      { accuracy: 90 }
    ];
    expect(calculateAccuracy(words)).toBe(90);
  });

  it('defaults to 100 accuracy for no words', () => {
    expect(calculateAccuracy([])).toBe(100);
  });

  it('handles single word accuracy', () => {
    expect(calculateAccuracy([{ accuracy: 75 }])).toBe(75);
  });
});
