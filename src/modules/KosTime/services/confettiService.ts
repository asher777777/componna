import confetti from 'canvas-confetti';

export function fireTaskConfetti(x = 0.5, y = 0.6) {
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x, y },
      colors: ['#00F0FF', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
      ticks: 150,
      gravity: 1.1,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
  } catch (e) {
    console.error('Confetti error:', e);
  }
}

export function fireBigCelebration() {
  try {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#00F0FF', '#10b981', '#6366f1', '#ec4899', '#f97316'],
        disableForReducedMotion: true,
      });
    }, 250);
  } catch (e) {
    console.error('Fanfare confetti error:', e);
  }
}
