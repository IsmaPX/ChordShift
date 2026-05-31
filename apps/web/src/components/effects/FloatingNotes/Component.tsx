import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { noteVariants } from './animation';
import { FloatingNotesProps } from './types';

const NOTES = ['♩', '♪', '♫', '♬', '♭', '♮', '♯'];

export const FloatingNotes = ({ count = 20 }: FloatingNotesProps) => {
  const notes = useMemo(() => 
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      char: NOTES[Math.floor(Math.random() * NOTES.length)],
      x: Math.random() * 100, 
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 10,
      rotate: Math.random() * 360,
    })), [count]
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          custom={{ duration: note.duration, delay: note.delay, x: `${note.x}vw`, rotate: note.rotate }}
          variants={noteVariants}
          initial="initial"
          animate="animate"
          className="absolute text-white/20 font-serif text-2xl"
          style={{ left: `${note.x}vw` }}
        >
          {note.char}
        </motion.div>
      ))}
    </div>
  );
};
