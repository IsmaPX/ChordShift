import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';

interface ParallaxContextType {
  scrollY: number;
}

const ParallaxContext = createContext<ParallaxContextType>({ scrollY: 0 });

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      lastScrollRef.current = window.scrollY;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrollY(lastScrollRef.current);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <ParallaxContext.Provider value={{ scrollY }}>
      {children}
    </ParallaxContext.Provider>
  );
}

export function useParallax() {
  return useContext(ParallaxContext);
}