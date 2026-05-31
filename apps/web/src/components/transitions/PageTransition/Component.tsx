import { variants } from './animation';
import { PageTransitionProps } from './types';
import { motion } from 'framer-motion';

export const PageTransition = ({ 
  children, 
  variant = 'fade' 
}: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={{ 
        duration: 0.5, 
        ease: [0.43, 0.13, 0.22, 0.88] 
      }}
    >
      {children}
    </motion.div>
  );
};
