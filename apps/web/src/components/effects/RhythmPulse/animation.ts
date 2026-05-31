export const pulseVariants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.6, 0.3, 0.6],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};
