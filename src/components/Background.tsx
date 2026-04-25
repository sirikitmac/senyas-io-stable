'use client';

import { useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

interface BackgroundProps {
  isDarkMode: boolean;
}

export default function Background({ isDarkMode }: BackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const dx = useSpring(mouseX, springConfig);
  const dy = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className={`fixed inset-0 -z-10 transition-colors duration-700 overflow-hidden ${isDarkMode ? 'bg-[#050505]' : 'bg-[#fcfcfc]'}`}>
      {/* Noise Texture */}
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 ${!isDarkMode ? 'invert opacity-[0.05]' : ''}`}></div>
      
      {/* Radial depth */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,0),rgba(5,5,5,1))]' : 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0),rgba(252,252,252,1))]'}`}></div>

      {/* Following Glow Orb */}
      <motion.div
        style={{
          x: dx,
          y: dy,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className={`absolute top-0 left-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full blur-[80px] sm:blur-[100px] pointer-events-none ${isDarkMode ? 'bg-brand/10 mix-blend-screen opacity-100' : 'bg-brand/40 mix-blend-multiply opacity-80'}`}
      />

      {/* Static Glows for Depth */}
      <div className={`absolute top-[-100px] left-[-100px] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-brand/15 rounded-full blur-[40px] sm:blur-[60px] pointer-events-none transition-all duration-700 ${!isDarkMode ? 'opacity-20' : ''}`}></div>
      <div className={`absolute bottom-[-200px] right-[-100px] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-orange-500/8 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none transition-all duration-700 ${!isDarkMode ? 'opacity-20' : ''}`}></div>
    </div>
  );
}
