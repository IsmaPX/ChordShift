export const scaleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: (custom: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay: custom, duration: 0.5, ease: 'backOut' }
  }),
};
