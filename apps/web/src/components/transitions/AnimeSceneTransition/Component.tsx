import { motion } from 'framer-motion';
import { AnimeSceneTransitionProps } from './types';
import { sceneVariants } from './animation';

export function AnimeSceneTransition({ children, className = '' }: AnimeSceneTransitionProps) {
  return (
    <motion.div
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}