import { type Variants } from 'framer-motion';

export const musicSlideVariants: Variants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.43, 0.13, 0.22, 0.88] as const },
  },
  exit: {
    opacity: 0,
    x: -100,
    scale: 0.9,
    transition: { duration: 0.4 },
  },
};

export const coverVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const progressVariants: Variants = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1, transition: { duration: 30, ease: 'linear', repeat: Infinity } },
};