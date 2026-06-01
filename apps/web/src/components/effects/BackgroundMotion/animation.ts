export const waveVariants = {
  animate: {
    x: [0, 50, 0],
    opacity: [0.05, 0.1, 0.05],
    transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const particleVariants = {
  animate: (i: number) => ({
    y: [0, -30, 0],
    opacity: [0.1, 0.3, 0.1],
    transition: {
      duration: 3 + i * 0.5,
      delay: i * 0.3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};

export const lineVariants = {
  animate: (i: number) => ({
    scaleY: [0.5, 1, 0.5],
    opacity: [0.2, 0.5, 0.2],
    transition: {
      duration: 1.5,
      delay: i * 0.1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};

export const INTENSITY_CONFIG = {
  low: 0.3,
  medium: 0.6,
  high: 1,
};