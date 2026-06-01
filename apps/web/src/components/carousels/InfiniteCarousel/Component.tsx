import { motion } from 'framer-motion';
import { InfiniteCarouselProps } from './types';
import { scrollVariants } from './animation';

export function InfiniteCarousel({ items, speed = 20, className = '', direction = 'left' }: InfiniteCarouselProps) {
  const duplicated = [...items, ...items, ...items];
  const variants = scrollVariants(speed);

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex gap-4 w-max"
        custom={direction}
        variants={variants}
        animate="animate"
      >
        {duplicated.map((item, i) => (
          <div key={`${item.id}-${i}`} className="flex-shrink-0">
            {item.content}
          </div>
        ))}
      </motion.div>
    </div>
  );
}