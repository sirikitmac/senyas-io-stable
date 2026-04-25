'use client';

import { motion } from 'motion/react';
import { Heart, Stethoscope, Users } from 'lucide-react';
import { useState } from 'react';

const impacts = [
  {
    icon: Stethoscope,
    title: 'Healthcare Communication',
    description: 'Enabling private and accurate dialogue between Deaf patients and medical professionals without barriers.',
  },
  {
    icon: Users,
    title: 'Public Service Assistance',
    description: 'Transforming how public services interact with the community, ensuring every citizen is heard and understood.',
  },
  {
    icon: Heart,
    title: 'Everyday Conversations',
    description: 'Bringing back the joy of casual interaction, from ordering coffee to meeting new friends in the park.',
  },
];

const marqueeData = [
  {
    direction: 'left',
    items: ['Community Clinics', 'Public Hospitals', 'Health Centers', 'Emergency Rooms', 'Medical Staff'],
    speed: 35,
  },
  {
    direction: 'right',
    items: ['Government Offices', 'ID Processing Centers', 'Registration Desks', 'Public Service Counters'],
    speed: 40,
  },
  {
    direction: 'left',
    items: ['Schools', 'Universities', 'Enrollment Offices', 'Student Services', 'Classrooms'],
    speed: 30,
  },
];

const MarqueeRow = ({ direction, items, speed }: { direction: 'left' | 'right', items: string[], speed: number, key?: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative flex overflow-hidden py-4 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ x: direction === 'left' ? 0 : -1500 }}
        animate={{
          x: direction === 'left' ? [0, -1500] : [-1500, 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ 
          display: 'flex', 
          whiteSpace: 'nowrap',
          animationPlayState: isHovered ? 'paused' : 'running'
        }}
        className="gap-8 items-center flex"
      >
        {/* Multiplying items to ensure seamless loop */}
        {[...Array(8)].flatMap(() => items).map((item, i) => (
          <div key={i} className="flex items-center gap-8 shrink-0">
            <motion.span 
              whileHover={{ 
                scale: 1.05,
                backgroundColor: '#ffb3c6',
                color: '#000000',
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="px-6 py-2.5 rounded-full dark:text-white/30 light:text-black/50 text-sm sm:text-base md:text-lg font-medium transition-colors cursor-default border border-transparent hover:border-[#ffb3c6]/20"
            >
              {item}
            </motion.span>
            <span className="text-white/10 dark:text-white/10 light:text-black/10 text-2xl">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function Impact() {
  return (
    <section id="impact" className="relative py-32 overflow-hidden dark:bg-[#050505] light:bg-[#f8f7f3] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 mb-20">
        {/* Fade-in Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-start text-left max-w-4xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/40 light:text-black/40 font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-4"
          >
            Practical Applications
          </motion.p>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium dark:text-white light:text-[#111111] leading-[1.1] mb-6"
          >
            Built for <span className="text-[#ffb3c6] italic">Everyday</span> Environments
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 light:text-black/50 max-w-xl text-sm sm:text-base font-normal leading-relaxed"
          >
            Supporting communication across real-world environments where it matters most.
          </motion.p>
        </motion.div>
      </div>

      <div className="relative mb-40 w-full overflow-hidden select-none">
        {/* Gradient edge fades blending with background */}
        <div className="absolute inset-y-0 left-0 w-32 sm:w-80 bg-gradient-to-r dark:from-[#050505] light:from-[#f8f7f3] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 sm:w-80 bg-gradient-to-l dark:from-[#050505] light:from-[#f8f7f3] to-transparent z-10 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="flex flex-col gap-4 sm:gap-6 py-4"
        >
          {marqueeData.map((data, idx) => (
            <MarqueeRow 
              key={idx}
              direction={data.direction as 'left' | 'right'}
              items={data.items}
              speed={data.speed}
            />
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Grid displays below marquees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12 text-left">
          {impacts.map((impact, i) => (
            <motion.div
              key={impact.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass p-6 sm:p-8 group flex flex-col justify-between rounded-3xl ${i === impacts.length - 1 ? 'sm:col-span-2 lg:col-span-2 flex-row items-center gap-8' : ''}`}
            >
              <div className={i === impacts.length - 1 ? 'flex-1 pr-2 sm:pr-4' : ''}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 mb-6 text-brand">
                  <impact.icon strokeWidth={1.5} className="w-full h-full" />
                </div>
                <h3 className="text-sm sm:text-base font-bold mb-3 dark:text-white light:text-[#222222] tracking-tight">{impact.title}</h3>
                <p className="text-[11px] sm:text-xs text-white/40 light:text-black/80 leading-relaxed max-w-[280px]">
                  {impact.description}
                </p>
              </div>
              
              {i === impacts.length - 1 && (
                <div className="flex -space-x-4 hidden sm:flex">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 dark:border-black light:border-white dark:bg-white/${n * 10} light:bg-black/${n * 5} shadow-2xl backdrop-blur-md flex items-center justify-center text-[10px] sm:text-xs font-bold dark:text-white/40 light:text-black/40 hover:z-20 hover:scale-110 transition-transform cursor-pointer`}>
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
