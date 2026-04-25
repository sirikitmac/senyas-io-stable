'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Camera, Languages, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Highlight } from '@/components/ui/hero-highlight';

const words = ['Fast', 'Simple', 'Accessible'];

const steps = [
  {
    icon: Camera,
    title: 'CAPTURE',
    description: 'Use your camera or select a quick message.',
  },
  {
    icon: Languages,
    title: 'TRANSLATE',
    description: 'Gestures are interpreted instantly in real time.',
  },
  {
    icon: MessageSquare,
    title: 'COMMUNICATE',
    description: 'Share your message through text or voice output.',
  },
];

export default function How() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="how" className="py-32 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-20">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-brand font-mono text-sm tracking-widest uppercase mb-4"
        >
          The Process
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-6xl font-sans font-extrabold mb-6 tracking-tight dark:text-white light:text-[#111111]"
        >
          Communication Made Simple
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-x-3 text-base sm:text-lg md:text-xl font-bold tracking-tight"
        >
          <span className="dark:text-white light:text-black">Senyas.IO is</span>
          <div className="h-10 relative min-w-[120px] text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={words[index]}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center"
              >
                <Highlight className="text-black dark:text-white">
                  {words[index]}
                </Highlight>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="group relative glass p-6 sm:p-8 h-full hover:border-brand/30 hover:shadow-[0_0_30px_rgba(255,179,198,0.05)] light:hover:shadow-[0_0_30px_rgba(255,100,140,0.1)] transition-all duration-500 rounded-3xl"
          >
            <div className="w-8 h-8 rounded-lg border border-brand/30 bg-brand/10 light:bg-brand/15 text-brand light:text-[#ff6090] flex items-center justify-center text-[10px] font-mono font-black italic mb-6 transition-colors">
              0{i + 1}
            </div>
            
            <h3 className="text-sm sm:text-base font-bold mb-3 uppercase tracking-widest text-white/90 light:text-black/90">
              {step.title}
            </h3>
            
            <p className="text-sm sm:text-base text-white/50 light:text-black/80 leading-relaxed mb-6 font-medium">
              {step.description}
            </p>

            <div className="mt-auto pt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full dark:bg-white/10 light:bg-black/10"></div>
              <span className="text-[10px] font-mono dark:text-white/20 light:text-black/40 font-bold uppercase tracking-widest">
                Step {i + 1}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
