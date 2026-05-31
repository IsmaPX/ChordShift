import { motion } from 'framer-motion';
import { fadeInVariants } from './animation';
import { FadeInProps } from './types';

export const FadeIn = ({ children, delay = 0, className }: FadeInProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      custom={delay}
      variants={fadeInVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
