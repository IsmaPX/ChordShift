export const rotateVariants = {
  initial: { rotate: -10, opacity: 0, x: -20 },
  animate: (custom: number) => ({
    rotate: 0,
    opacity: 1,
    x: 0,
    transition: { delay: custom, duration: 0.6, ease: 'easeOut' }
  }),
};
