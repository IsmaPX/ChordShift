export const fadeInVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom, duration: 0.6, ease: 'easeOut' }
  }),
};
