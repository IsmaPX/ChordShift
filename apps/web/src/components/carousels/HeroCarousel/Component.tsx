import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroCarouselProps } from './types';
import { heroVariants, textVariants } from './animation';

export const HeroCarousel = ({ items, autoplay = true, interval = 5000, className = '' }: HeroCarouselProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (autoplay) {
      const timer = setInterval(() => setIndex((prev) => (prev + 1) % items.length), interval);
      return () => clearInterval(timer);
    }
  }, [autoplay, interval, items.length]);

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          variants={heroVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center scale-110" 
            style={{ backgroundImage: `url(${items[index].image})` }}
          />
          <div 
            className="absolute inset-0 opacity-60"
            style={{ background: `linear-gradient(to bottom, transparent, ${items[index].color})` }}
          />
          
          <div className="relative h-full flex flex-col justify-center items-center text-center px-6">
            <motion.h1 
              custom={0}
              variants={textVariants}
              initial="initial"
              animate="animate"
              className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl mb-4"
            >
              {items[index].title}
            </motion.h1>
            <motion.p 
              custom={1}
              variants={textVariants}
              initial="initial"
              animate="animate"
              className="text-xl md:text-3xl text-white/90 font-medium mb-8 max-w-2xl"
            >
              {items[index].subtitle}
            </motion.p>
            <motion.div 
              custom={2}
              variants={textVariants}
              initial="initial"
              animate="animate"
              className="flex gap-4"
            >
              <button className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-110 transition-transform">
                Explore
              </button>
              <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors">
                Learn More
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
        {items.map((_, i) => (
          <div 
            key={i} 
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full cursor-pointer transition-all duration-500 ${i === index ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};
