export const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  wave: {
    initial: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
    animate: { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
    exit: { clipPath: 'inset(100% 0 0% 0)', opacity: 0 },
  },
  curtain: {
    initial: { scaleY: 0 },
    animate: { scaleY: 1 },
    exit: { scaleY: 0 },
  },
};
