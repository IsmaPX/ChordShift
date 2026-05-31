import { Variants } from 'framer-motion'

/**
 * Premium Animation System
 * Inspired by Linear, Vercel and Apple
 * High stiffness, moderate damping for a "snappy" but fluid feel.
 */

export const SPRING_CONFIG = {
  stiffness: 300,
  damping: 30,
  mass: 1,
}

export const DURATIONS = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
}

export const variants: {
  fadeIn: Variants
  fadeInUp: Variants
  scaleIn: Variants
  slideLeft: Variants
  slideRight: Variants
  staggerContainer: Variants
  modal: Variants
} = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        ...SPRING_CONFIG,
        duration: DURATIONS.normal,
      }
    },
    exit: { 
      opacity: 0, 
      y: 10,
      transition: { duration: DURATIONS.fast }
    },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        ...SPRING_CONFIG,
        duration: DURATIONS.fast,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: DURATIONS.fast }
    },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        ...SPRING_CONFIG,
      }
    },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        ...SPRING_CONFIG,
      }
    },
    exit: { opacity: 0, x: 20 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  modal: {
    initial: { opacity: 0, scale: 0.9, y: '10%' },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: 'spring',
        ...SPRING_CONFIG,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: '10%',
      transition: { duration: DURATIONS.fast }
    },
  },
}

export const interactiveVariants = {
  button: {
    hover: { 
      y: -2, 
      scale: 1.02,
      transition: { duration: 0.2 } 
    },
    tap: { 
      scale: 0.97,
      transition: { duration: 0.1 } 
    },
  },
  card: {
    hover: { 
      y: -4,
      scale: 1.01,
      transition: {
        type: 'spring',
        ...SPRING_CONFIG,
      }
    },
    tap: { scale: 0.99 },
  },
}
