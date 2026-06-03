import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export function AtmosphereBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Base dark background */}
      <div className="fixed inset-0 bg-[#06060a]" />

      {/* Animated gradient orbs */}
      <motion.div
        className="fixed -top-[10%] -left-[5%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.12)_0%,transparent_70%)] blur-3xl"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 10, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed -bottom-[10%] -right-[5%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.08)_0%,transparent_70%)] blur-3xl"
        animate={{
          x: [0, -20, 30, 0],
          y: [0, 10, -20, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed top-[40%] left-[30%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06)_0%,transparent_70%)] blur-3xl"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}