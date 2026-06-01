import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicCarouselProps } from './types';
import { musicSlideVariants } from './animation';

export function MusicCarousel({ items, autoplay = true, interval = 5000, className = '' }: MusicCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, items.length]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-64 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={items[current].id}
            variants={musicSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0"
          >
            <img
              src={items[current].coverUrl}
              alt={items[current].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white text-2xl font-bold">{items[current].title}</h3>
              <p className="text-white/70">{items[current].artist}</p>
              {items[current].duration && (
                <p className="text-white/50 text-sm mt-1">{items[current].duration}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-anime-pink w-6' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}