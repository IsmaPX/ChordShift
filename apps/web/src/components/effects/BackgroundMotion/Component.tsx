import { motion } from 'framer-motion';
import { BackgroundMotionProps } from './types';
import { waveVariants, particleVariants, lineVariants } from './animation';
import { useMemo } from 'react';

function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          variants={waveVariants}
          animate="animate"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, rgba(168, 85, 247,${0.1 - i * 0.02}) 0%, transparent 70%)`,
            transform: `translateX(${i * 30}px)`,
          }}
        />
      ))}
    </div>
  );
}

function ParticlesBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: `${(i * 7) % 100}%`,
        bottom: `${(i * 11) % 100}%`,
        size: 4 + (i % 4) * 2,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          custom={p.id}
          variants={particleVariants}
          animate="animate"
          className="absolute rounded-full bg-anime-purple"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            opacity: 0.2,
          }}
        />
      ))}
    </div>
  );
}

function LinesBackground() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3 overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={lineVariants}
          animate="animate"
          className="w-1 bg-gradient-to-t from-anime-pink/30 to-anime-purple/30 rounded-full"
          style={{ height: `${30 + (i % 5) * 20}px` }}
        />
      ))}
    </div>
  );
}

export function BackgroundMotion({ className = '', variant = 'wave' }: BackgroundMotionProps) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {variant === 'wave' && <WaveBackground />}
      {variant === 'particles' && <ParticlesBackground />}
      {variant === 'lines' && <LinesBackground />}
    </div>
  );
}