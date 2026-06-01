import { type Particle } from './types';

interface ParticleWithTrajectory extends Particle {
  xTrajectory: number;
  yTrajectory: number;
}

export const particleVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: (custom: ParticleWithTrajectory) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0.5],
    x: custom.xTrajectory,
    y: custom.yTrajectory,
    rotate: custom.rotation,
  }),
};

export const SPEED_MULTIPLIERS = {
  slow: 2,
  medium: 1,
  fast: 0.5,
};

export function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    duration: 3 + Math.random() * 7,
    delay: Math.random() * 5,
    size: 2 + Math.random() * 6,
  }));
}

export function getParticleStyle(particle: Particle, speed: 'slow' | 'medium' | 'fast' = 'medium') {
  const multiplier = SPEED_MULTIPLIERS[speed];
  return {
    x: `${particle.x}vw`,
    y: `${particle.y}vh`,
    duration: particle.duration * multiplier,
    delay: particle.delay,
    size: particle.size,
    rotation: particle.rotation,
    xTrajectory: (Math.random() - 0.5) * 100,
    yTrajectory: (Math.random() - 0.5) * 100,
  };
}