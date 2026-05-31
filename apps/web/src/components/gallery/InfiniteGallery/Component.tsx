import { motion } from 'framer-motion';
import { GalleryProps } from '../types';

export const InfiniteGallery = ({ images, className }: GalleryProps) => {
  return (
    <div className={`relative overflow-hidden whitespace-nowrap py-8 ${className}`}>
      <motion.div 
        className="flex gap-8"
        animate={{ x: [0, -1000] }} // Approximation, ideally based on content width
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
      >
        {[...images, ...images].map((img, i) => (
          <div 
            key={`${img.id}-${i}`} 
            className="relative w-64 h-40 flex-shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/10"
          >
            <img 
              src={img.url} 
              alt={img.alt} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
