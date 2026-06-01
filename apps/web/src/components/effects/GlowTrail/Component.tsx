import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlowTrailProps } from './types';
import { getTrailColor } from './animation';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export function GlowTrail({ className = '', color, length = 12, zIndex = 40 }: GlowTrailProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const pointsRef = useRef<TrailPoint[]>([]);
  const animFrameRef = useRef<number | undefined>(undefined);

  const updateTrail = useCallback(() => {
    pointsRef.current = [
      { x: mousePos.x, y: mousePos.y, id: Date.now() },
      ...pointsRef.current.slice(0, length - 1),
    ];
    setTrail([...pointsRef.current]);
  }, [mousePos, length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const animate = () => {
      updateTrail();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateTrail]);

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex }}>
      {trail.map((point, i) => (
        <motion.div
          key={point.id + i}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: 1 - i * (0.08),
            scale: 1 - i * (0.06),
          }}
          transition={{
            duration: 0.3,
            ease: 'easeOut',
          }}
          className="absolute rounded-full"
          style={{
            left: point.x,
            top: point.y,
            width: Math.max(4, 14 - i * 1.2),
            height: Math.max(4, 14 - i * 1.2),
            backgroundColor: getTrailColor(i, color),
            boxShadow: `0 0 ${10 + i * 2}px ${getTrailColor(i, color)}, 0 0 ${20 + i * 3}px ${getTrailColor(i, color)}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}