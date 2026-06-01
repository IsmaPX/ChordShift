export interface MusicalParticlesProps {
  count?: number;
  className?: string;
  color?: string;
  speed?: 'slow' | 'medium' | 'fast';
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  duration: number;
  delay: number;
  size: number;
}