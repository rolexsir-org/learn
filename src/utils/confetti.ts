import confetti from 'canvas-confetti';

export function fireWordCompleteConfetti() {
  // Wave 1: Simultaneous left & right side cannons
  confetti({
    particleCount: 70,
    spread: 80,
    origin: { y: 0.6, x: 0.15 },
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1DD1A1', '#FF9FF3', '#A855F7']
  });
  confetti({
    particleCount: 70,
    spread: 80,
    origin: { y: 0.6, x: 0.85 },
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1DD1A1', '#FF9FF3', '#A855F7']
  });

  // Wave 2: Center golden sparkle shower after 250ms delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.4, x: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00E5FF', '#76FF03'],
      scalar: 1.2,
      ticks: 120
    });
  }, 250);
}

export function fireTreasureChestConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
}

export function fireUnlockConfetti() {
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#FFD700', '#FFA500', '#FF4500', '#00FFFF', '#FF1493']
  });
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
