export interface BlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  initialBlur?: number;
  finalBlur?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  className?: string;
}