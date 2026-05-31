import { motion } from 'framer-motion';
import { GalleryProps } from '../types';
import { imageVariants } from './animation';

export const GridGallery = ({ images, className, onImageClick }: GalleryProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ${className}`}>
      {images.map((img, i) => (
        <motion.div
          key={img.id}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          whileHover="hover"
          variants={imageVariants}
          custom={i}
          onClick={() => onImageClick?.(img)}
          className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
        >
          <img 
            src={img.url} 
            alt={img.alt} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-white text-sm font-medium">{img.alt}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
