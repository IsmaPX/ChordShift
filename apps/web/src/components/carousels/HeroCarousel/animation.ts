export const heroVariants = {
  initial: { opacity: 0, scale: 1.1, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    filter: 'blur(10px)',
    transition: { duration: 0.5 } 
  },
};

export const textVariants = {
  initial: { y: 30, opacity: 0 },
  animate: (i: number) => ({
    y: 0, 
    opacity: 1, 
    transition: { delay: 0.3 + i * 0.2, duration: 0.6 }
  }),
};
