export const heroContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export const heroImageVariants = {
  initial: { scale: 1.2, opacity: 0, filter: 'blur(20px)' },
  animate: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.43, 0.13, 0.22, 0.88] as const },
  },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.5 } },
};

export const heroTextVariants = {
  initial: { y: 40, opacity: 0, rotateX: -15 },
  animate: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.43, 0.13, 0.22, 0.88] as const },
  },
};

export const heroSubtextVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const heroButtonVariants = {
  initial: { y: 20, opacity: 0, scale: 0.9 },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'backOut' },
  },
};