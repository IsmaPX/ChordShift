import { motion } from 'framer-motion';
import { HeroTransitionProps } from './types';
import { heroContainerVariants, heroImageVariants } from './animation';

export function HeroTransition({ children, className = '' }: HeroTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={heroContainerVariants}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

HeroTransition.Image = function HeroImage({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={heroImageVariants} className={className}>
      {children}
    </motion.div>
  );
};