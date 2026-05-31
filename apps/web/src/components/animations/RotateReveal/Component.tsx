import { motion } from 'framer-motion';
import { rotateVariants } from './animation';
import { RotateRevealProps } from './types';

export const RotateReveal = ({ children, delay = 0, className }: RotateRevealProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      custom={delay}
      variants={rotateVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
