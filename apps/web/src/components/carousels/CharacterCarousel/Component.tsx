import { motion } from 'framer-motion';
import { characterFlipVariants } from './animation';
import { CharacterCarouselProps } from './types';

export const CharacterCarousel = ({ items, className = '' }: CharacterCarouselProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8 ${className}`}>
      {items.map((character, i) => (
        <motion.div
          key={character.id}
          custom={i}
          initial="initial"
          whileInView="animate"
          whileHover="hover"
          viewport={{ once: true }}
          variants={characterFlipVariants}
          className="relative group cursor-pointer"
        >
          <div 
            className="absolute -inset-1 rounded-2xl opacity-50 blur-xl transition-opacity group-hover:opacity-80"
            style={{ background: `linear-gradient(135deg, ${character.color}, transparent)` }}
          />
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 ring-2 ring-white/10">
            <img
              src={character.image}
              alt={character.name}
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(to top, ${character.color}aa, transparent)` }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white font-bold text-lg">{character.name}</h3>
              <p className="text-white/70 text-sm">{character.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
