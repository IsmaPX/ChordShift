export const noteVariants = {
  initial: { y: '100vh', opacity: 0, rotate: 0 },
  animate: (custom: { duration: number; delay: number; x: number; rotate: number }) => ({
    y: '-10vh',
    opacity: [0, 1, 1, 0],
    rotate: custom.rotate,
    x: custom.x,
    transition: {
      duration: custom.duration,
      delay: custom.delay,
      repeat: Infinity,
      ease: 'linear'
    }
  }),
};
