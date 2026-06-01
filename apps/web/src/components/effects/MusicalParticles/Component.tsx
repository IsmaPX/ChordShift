import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MusicalParticlesProps } from './types';
import { generateParticles, getParticleStyle, particleVariants } from './animation';

const NOTE_EMOJIS = ['♩', '♪', '♫', '♬', '✨', '💫', '⭐'];

export function MusicalParticles({ count = 25, className = '', color = 'text-anime-pink', speed = 'medium' }: MusicalParticlesProps) {
  const particles = useMemo(() => generateParticles(count), [count]);

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => {
        const style = getParticleStyle(particle, speed);
        return (
          <motion.div
            key={particle.id}
            custom={style}
            variants={particleVariants}
            initial="initial"
            animate="animate"
            className={`absolute ${color}`}
            style={{
              left: style.x,
              top: style.y,
              fontSize: `${style.size}px`,
            }}
            transition={{
              duration: style.duration,
              delay: style.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {NOTE_EMOJIS[particle.id % NOTE_EMOJIS.length]}
          </motion.div>
        );
      })}
    </div>
  );
}