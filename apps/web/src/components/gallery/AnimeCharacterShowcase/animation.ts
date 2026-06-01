import { type Variants } from 'framer-motion';

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.43, 0.13, 0.22, 0.88] as const },
  }),
};

export const glowVariants: Variants = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.1, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};