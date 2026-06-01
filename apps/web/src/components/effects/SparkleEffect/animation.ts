import { Sparkle } from './types';

const SPARKLE_COLORS = ['#ff6b9d', '#c445f6', '#4ecdc4', '#ffd93d', '#fff', '#ff9a9e'];

export const sparkleVariants = {
  initial: { opacity: 0, scale: 0, rotate: 0 },
  animate: () => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0.5],
    rotate: [0, 180, 360],
  }),
  transition: (custom: { delay: number; duration: number }) => ({
    duration: custom.duration,
    delay: custom.delay,
    repeat: Infinity,
    ease: 'easeInOut',
  }),
};

export function generateSparkles(count: number, maxSize: number = 20): Sparkle[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * maxSize,
    duration: 1 + Math.random() * 3,
    delay: Math.random() * 5,
    color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
  }));
}