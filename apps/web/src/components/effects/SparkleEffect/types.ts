export interface SparkleEffectProps {
  count?: number;
  className?: string;
  maxSize?: number;
  color?: string;
}

export interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}