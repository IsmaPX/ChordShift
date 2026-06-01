import { useState, useRef, useCallback } from 'react';

interface UseMomentumOptions {
  velocityThreshold?: number;
  decay?: number;
}

export function useMomentum({ velocityThreshold = 0.5, decay = 0.95 }: UseMomentumOptions = {}) {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  const onDragStart = useCallback((x: number) => {
    setIsDragging(true);
    lastXRef.current = x;
    velocityRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const onDragMove = useCallback((x: number) => {
    if (!isDragging) return;
    const delta = x - lastXRef.current;
    velocityRef.current = delta;
    lastXRef.current = x;
    setPosition((prev) => prev + delta);
  }, [isDragging]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    const animate = () => {
      if (Math.abs(velocityRef.current) > velocityThreshold) {
        velocityRef.current *= decay;
        setPosition((prev) => prev + velocityRef.current);
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  }, [velocityThreshold, decay]);

  return { position, isDragging, onDragStart, onDragMove, onDragEnd };
}