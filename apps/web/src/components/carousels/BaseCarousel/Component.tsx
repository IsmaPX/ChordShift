import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCarouselProps } from './types';

export const BaseCarousel = ({ 
  items, 
  autoplay = false, 
  interval = 5000, 
  className = '',
  onItemChange 
}: BaseCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (autoplay) {
      const timer = setInterval(next, interval);
      return () => clearInterval(timer);
    }
  }, [autoplay, interval, next]);

  useEffect(() => {
    if (onItemChange) onItemChange(currentIndex);
  }, [currentIndex, onItemChange]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="relative flex h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            {items[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${currentIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
        ←
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
        →
      </button>
    </div>
  );
};
