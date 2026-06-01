export const sceneVariants = {
  initial: {
    scale: 1.1,
    opacity: 0,
    filter: 'blur(20px)',
  },
  animate: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.22, 0.88] as const,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    filter: 'blur(10px)',
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.22, 0.88] as const,
    },
  },
};

export const blurRevealVariants = {
  initial: { opacity: 0, filter: 'blur(10px)', y: 20 },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  exit: { opacity: 0, filter: 'blur(10px)', y: -20, transition: { duration: 0.4 } },
};

export const morphVariants = {
  initial: { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
  animate: {
    clipPath: 'inset(0% 0 0 0)',
    opacity: 1,
    transition: { duration: 0.8, ease: [0.43, 0.13, 0.22, 0.88] as const },
  },
  exit: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
    transition: { duration: 0.6 },
  },
};