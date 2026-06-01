import { motion } from 'framer-motion';
import { AnimeCharacterShowcaseProps } from './types';
import { cardVariants } from './animation';

export function AnimeCharacterShowcase({ characters, className = '' }: AnimeCharacterShowcaseProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {characters.map((char, i) => (
        <motion.div
          key={char.id}
          custom={i}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative group cursor-pointer"
        >
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-30"
            style={{ backgroundColor: char.color || '#c445f6' }}
          />
          <div className="relative bg-bg-secondary rounded-2xl overflow-hidden border border-border">
            <div className="aspect-square overflow-hidden">
              <img
                src={char.imageUrl}
                alt={char.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg">{char.name}</h3>
              {char.role && <p className="text-white/60 text-sm">{char.role}</p>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}