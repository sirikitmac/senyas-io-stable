'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Github, Linkedin, Globe, MessageSquare } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';

export default function Contact() {
  const [isHoveringEmail, setIsHoveringEmail] = useState(false);

  const socials = [
    { name: 'Gmail', icon: Mail, href: 'mailto:hello@senyas.io' },
    { name: 'Discord', icon: MessageSquare, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Facebook', icon: Globe, href: '#' },
  ];

  return (
    <section id="contact" className="py-24 sm:py-32 px-6 sm:px-12 relative bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        
        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-start"
        >
          {/* Header */}
          <div className="mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-8xl sm:text-9xl md:text-[10rem] font-serif leading-[0.8] mb-2 dark:text-white light:text-[#111111] italic"
            >
              Let&apos;s
            </motion.h2>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-8xl sm:text-9xl md:text-[11rem] font-sans font-black leading-[0.8] text-brand tracking-tight"
            >
              Talk.
            </motion.h2>
          </div>

          {/* Subtext */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md"
          >
            <p className="text-lg sm:text-xl font-light leading-relaxed dark:text-white/60 light:text-black/80 mb-12">
              Have questions, feedback, or ideas for Senyas.IO? <br className="hidden sm:block" />
              Reach out and help us build more accessible communication.
            </p>

            {/* Email Interaction */}
            <div 
              className="relative inline-flex mt-4"
              onMouseEnter={() => setIsHoveringEmail(true)}
              onMouseLeave={() => setIsHoveringEmail(false)}
            >
              <Magnetic strength={0.4}>
                <a 
                  href="mailto:hello@senyas.io"
                  className="group relative inline-flex flex-col cursor-pointer p-12 -m-12"
                >
                  <div className="h-12 flex items-center overflow-hidden min-w-[120px] sm:min-w-[280px]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isHoveringEmail ? 'say-hi' : 'email'}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={`text-2xl sm:text-4xl font-serif font-medium dark:text-white light:text-black tracking-tight ${isHoveringEmail ? 'dark:text-brand light:text-[#ff6090] italic' : ''}`}
                      >
                        {isHoveringEmail ? 'Say Hi!' : 'hello@senyas.io'}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <motion.div 
                    className="h-[2px] bg-brand mt-1"
                    initial={{ width: '80px' }}
                    animate={{ width: isHoveringEmail ? '100%' : '80px' }}
                    transition={{ duration: 0.4 }}
                  />
                  {isHoveringEmail && (
                    <motion.div 
                      layoutId="email-glow"
                      className="absolute inset-x-0 bottom-0 h-2 bg-brand/10 blur-xl -z-10 rounded-full"
                    />
                  )}
                </a>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>

        {/* Links & Information Area */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:items-end justify-between lg:h-full py-10"
        >
          {/* Socials */}
          <div className="mb-20 lg:mb-0 w-full lg:w-auto">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-mono dark:text-white/60 light:text-black/80 mb-10 lg:text-right font-black">
              Connect with us
            </h4>
            <div className="flex flex-wrap lg:flex-col lg:items-end gap-x-12 gap-y-6 sm:gap-8">
              {socials.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ x: -10 }}
                  className="group flex items-center gap-3 text-sm font-black dark:text-white light:text-[#111111] hover:text-brand light:hover:text-[#ff6090] transition-colors"
                >
                  <social.icon size={16} strokeWidth={2} className="dark:text-white/60 light:text-black/70 group-hover:text-brand light:group-hover:text-[#ff6090] transition-colors" />
                  <span className="tracking-tight">{social.name}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Location & Rights */}
          <div className="lg:text-right w-full lg:w-auto mt-auto lg:mt-0">
            <div className="mb-12 sm:mb-16">
              <h4 className="text-[10px] uppercase tracking-[0.4em] font-mono dark:text-white/60 light:text-black/80 mb-2 font-black">
                Location
              </h4>
              <p className="text-sm dark:text-white light:text-black/90 font-black">
                Iligan City, Philippines
              </p>
            </div>
            
            <p className="text-[10px] uppercase tracking-[0.4em] font-mono dark:text-white/70 light:text-black/80 font-black leading-loose">
              © 2026 Senyas.IO <br className="sm:hidden" />
              <span className="hidden sm:inline-block mx-3">&bull;</span>
              Built for accessible communication.
            </p>
          </div>
        </motion.div>

      </div>

      {/* Decorative Glow */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand/5 blur-[150px] -z-10 rounded-full dark:opacity-100 opacity-30"></div>
    </section>
  );
}
