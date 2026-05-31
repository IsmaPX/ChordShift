import { motion } from 'framer-motion';
import { scaleVariants } from './animation';
import { ScaleRevealProps } from './types';

export const ScaleReveal = ({ children, delay = 0, className }: ScaleRevealProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      custom={delay}
      variants={scaleVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
