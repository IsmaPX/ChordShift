import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { BlurRevealProps } from './types';

export function BlurReveal({
  children,
  delay = 0,
  duration = 0.8,
  initialBlur = 20,
  finalBlur = 0,
  direction = 'up',
  distance = 40,
  className,
}: BlurRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const directionY = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
  const directionX = direction === 'left' ? distance : direction === 'right' ? -distance : 0;

  const variants = {
    hidden: {
      filter: `blur(${initialBlur}px)`,
      opacity: 0,
      y: directionY,
      x: directionX,
    },
    visible: {
      filter: `blur(${finalBlur}px)`,
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}