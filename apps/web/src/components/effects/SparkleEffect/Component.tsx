import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SparkleEffectProps } from './types';
import { generateSparkles } from './animation';

function StarSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0l3.09 6.27L22 7.27l-5 4.87 1.18 6.88L12 15.77l-6.18 3.25L7 12.14 2 7.27l6.91-1L12 0z" />
    </svg>
  );
}

export function SparkleEffect({ count = 30, className = '', maxSize = 20, color }: SparkleEffectProps) {
  const sparkles = useMemo(() => generateSparkles(count, maxSize), [count, maxSize]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], rotate: [0, 180, 360] }}
          transition={{ duration: sparkle.duration, delay: sparkle.delay, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
        >
          <StarSVG size={sparkle.size} color={color || sparkle.color} />
        </motion.div>
      ))}
    </div>
  );
}