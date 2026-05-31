import { motion } from 'framer-motion';
import { pulseVariants } from './animation';
import { RhythmPulseProps } from './types';

export const RhythmPulse = ({ active = true, className, color = 'rgba(255, 255, 255, 0.3)' }: RhythmPulseProps) => {
  if (!active) return null;

  return (
    <motion.div
      variants={pulseVariants}
      initial="initial"
      animate="animate"
      className={`absolute rounded-full ${className}`}
      style={{ 
        backgroundColor: color,
        boxShadow: `0 0 20px ${color}`
      }}
    />
  );
};
