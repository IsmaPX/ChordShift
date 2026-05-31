import { motion } from 'framer-motion';
import { GalleryProps } from '../types';
import { masonryVariants } from './animation';

export const MasonryGallery = ({ images, className, onImageClick }: GalleryProps) => {
  return (
    <div className={`columns-2 md:columns-3 lg:columns-4 gap-4 p-4 space-y-4 ${className}`}>
      {images.map((img, i) => (
        <motion.div
          key={img.id}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={masonryVariants}
          custom={i}
          onClick={() => onImageClick?.(img)}
          className="relative mb-4 break-inside-avoid overflow-hidden rounded-xl cursor-pointer group"
        >
          <img 
            src={img.url} 
            alt={img.alt} 
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-white text-sm font-medium">{img.alt}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
