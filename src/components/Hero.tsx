'use client';

import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-white/50 light:text-black/60 light:bg-black/5 light:border-black/10 mb-6"
        >
          Research Stage • Accessibility First
        </motion.div>

        <h1 className="text-6xl sm:text-7xl md:text-9xl font-satoshi font-black tracking-tight mb-4 hero-gradient leading-tight py-4 px-2">
          Senyas.IO
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl font-light dark:text-white/80 light:text-black/80 mb-6 max-w-2xl mx-auto leading-relaxed">
          Communication, without barriers.
        </p>

        <p className="text-xs sm:text-sm text-white/40 light:text-black/80 mb-8 max-w-lg mx-auto leading-relaxed px-4">
          Real-time sign language translation for everyday communication.<br />
          Simple, accessible, and built for Deaf users.
        </p>

        <div className="flex flex-col gap-8 items-center">
          <Magnetic strength={0.25}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(255,179,198,0.4)", 
                  "0 0 40px rgba(255,179,198,0.7)", 
                  "0 0 20px rgba(255,179,198,0.4)"
                ],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-full sm:w-auto px-10 py-4 bg-brand text-black font-black rounded-2xl text-base shadow-[0_0_20px_rgba(255,179,198,0.5)] cursor-pointer"
            >
              Try Senyas.IO
            </motion.button>
          </Magnetic>
          
          <div className="flex flex-row gap-6 items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 glass text-white/60 light:text-black/60 hover:text-white light:hover:text-black text-sm font-bold rounded-full transition-colors cursor-pointer flex items-center gap-2"
            >
              Explore
            </motion.button>

            <div className="w-[1px] h-4 bg-white/10" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3 glass text-white/60 light:text-black/60 hover:text-white light:hover:text-black text-sm font-bold rounded-full transition-colors cursor-pointer flex items-center gap-2"
            >
              Support
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Hero Visual Accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20"
      >
        <div className="w-[1px] h-20 bg-gradient-to-b from-brand to-transparent"></div>
        <span className="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}
