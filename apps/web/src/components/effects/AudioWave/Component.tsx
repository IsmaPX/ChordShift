import { motion } from 'framer-motion';
import { waveVariants } from './animation';
import { AudioWaveProps } from './types';

export const AudioWave = ({ className }: AudioWaveProps) => {
  const bars = Array.from({ length: 10 });

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {bars.map((_, i) => (
        <motion.div
          key={i}
          variants={waveVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: i * 0.1 }}
          className="w-1 bg-white rounded-full"
          style={{ height: '20px' }}
        />
      ))}
    </div>
  );
};
