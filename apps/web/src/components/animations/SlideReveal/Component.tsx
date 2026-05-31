import { motion } from 'framer-motion';
import { slideVariants } from './animation';
import { SlideRevealProps } from './types';

export const SlideReveal = ({ children, direction = 'up', delay = 0, className }: SlideRevealProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      custom={delay}
      variants={slideVariants[direction]}
      className={className}
    >
      {children}
    </motion.div>
  );
};
