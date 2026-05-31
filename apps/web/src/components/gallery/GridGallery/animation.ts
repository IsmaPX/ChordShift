export const imageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' }
  }),
  hover: {
    scale: 1.05,
    filter: 'brightness(1.1)',
    transition: { duration: 0.3 }
  }
};
