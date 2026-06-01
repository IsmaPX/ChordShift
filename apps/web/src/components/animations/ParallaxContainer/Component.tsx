import { motion } from 'framer-motion';
import { ParallaxContainerProps, ParallaxLayerProps } from './types';
import { ParallaxProvider, useParallax } from './context';

function ParallaxLayerComponent({ children, depth = 0.5, className = '' }: ParallaxLayerProps) {
  const { scrollY } = useParallax();
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={{ y: scrollY * depth }}
      transition={{ type: 'spring', stiffness: 100, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxContainer({ children, className = '', speed = 0.5 }: ParallaxContainerProps) {
  return (
    <ParallaxProvider>
      <div className={className} data-speed={speed}>
        {children}
      </div>
    </ParallaxProvider>
  );
}

ParallaxContainer.Layer = ParallaxLayerComponent;