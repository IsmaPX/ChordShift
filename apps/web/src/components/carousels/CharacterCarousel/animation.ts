export const characterFlipVariants = {
  initial: { opacity: 0, y: 50, scale: 0.8 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.15, duration: 0.5, ease: 'backOut' }
  }),
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(255, 100, 200, 0.3)',
    transition: { duration: 0.3 }
  }
};

export const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};
