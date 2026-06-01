import { useState, useEffect, useRef } from 'react';

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const now = Date.now();
        const deltaY = window.scrollY - lastScrollY.current;
        const deltaTime = now - lastTime.current;
        setVelocity(deltaTime > 0 ? Math.abs(deltaY / deltaTime) : 0);
        lastScrollY.current = window.scrollY;
        lastTime.current = now;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return velocity;
}