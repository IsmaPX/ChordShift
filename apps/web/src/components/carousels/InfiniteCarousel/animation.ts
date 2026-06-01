import { type Variants } from 'framer-motion';

export const scrollVariants = (duration: number): Variants => ({
  animate: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
    transition: {
      x: {
        duration,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  }),
});