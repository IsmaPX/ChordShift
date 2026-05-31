import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { coverflowVariants } from './animation';
import { CoverflowCarouselProps } from './types';

export const CoverflowCarousel = ({ items, className = '' }: CoverflowCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getVariant = (index: number) => {
    if (index === currentIndex) return 'center' as const;
    if (index === currentIndex - 1) return 'left' as const;
    if (index === currentIndex + 1) return 'right' as const;
    return 'hidden' as const;
  };

  return (
    <div className={`relative w-full h-[500px] flex items-center justify-center perspective-[1000px] ${className}`}>
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            variants={coverflowVariants}
            initial="hidden"
            animate={getVariant(i)}
            exit="hidden"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            onClick={() => setCurrentIndex(i)}
          >
            <div className="relative w-72 h-96 overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white/20">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-lg">{item.title}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`size-2 rounded-full cursor-pointer transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};
