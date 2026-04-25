'use client';

import { motion } from 'motion/react';
import { Zap, MessageCircle, Settings, AlertCircle, Volume2, Mic } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Real-Time Translation',
    description: 'Instant interpretation of ASL and local sign dialects directly through your camera.',
  },
  {
    icon: MessageCircle,
    title: 'Quick Messages',
    description: 'A library of pre-set essential phrases for fast communication in common scenarios.',
  },
  {
    icon: Settings,
    title: 'Custom Messages',
    description: 'Personalize your system with custom gestures and frequently used text outputs.',
  },
  {
    icon: AlertCircle,
    title: 'Emergency Contact',
    description: 'One-touch emergency signaling with automated location and situation reporting.',
  },
  {
    icon: Volume2,
    title: 'Optional Text-to-Speech',
    description: 'High-quality natural voice output to bridge the gap in oral communication gaps.',
  },
  {
    icon: Zap,
    title: 'AI Agent',
    description: 'Supports clear, everyday communication for Deaf users.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-4 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-brand font-mono text-sm tracking-widest uppercase mb-4"
          >
            Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-sans font-extrabold max-w-2xl dark:text-white light:text-[#111111]"
          >
            Empowering connectivity through advanced technology.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 sm:p-6 hover:border-brand/30 transition-all cursor-default group rounded-3xl"
            >
              <div className="w-8 h-8 mb-4 text-brand transform group-hover:scale-110 transition-transform">
                <feature.icon strokeWidth={1.5} className="w-full h-full" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-2 dark:text-white light:text-[#222222] tracking-tight">{feature.title}</h3>
              <p className="text-[10px] sm:text-[11px] text-white/40 light:text-black/80 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
