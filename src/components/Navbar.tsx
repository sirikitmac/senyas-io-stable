'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Accessibility } from 'lucide-react';

const navItems = [
  { name: 'Home', id: 'home' },
  { name: 'How', id: 'how' },
  { name: 'Features', id: 'features' },
  { name: 'Impact', id: 'impact' },
  { name: 'Contact', id: 'contact' },
];

interface NavbarProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export default function Navbar({ toggleTheme, isDarkMode }: NavbarProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Scroll Spy logic
      const sections = navItems.map(item => document.getElementById(item.id));
      
      // Bottom of page check
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      
      if (isBottom) {
        setActiveTab('contact');
      } else {
        const currentSection = sections.find(section => {
          if (!section) return false;
          const rect = section.getBoundingClientRect();
          const offset = window.innerWidth < 768 ? 150 : 100;
          return rect.top <= offset && rect.bottom >= offset;
        });

        if (currentSection) {
          setActiveTab(currentSection.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - (window.innerWidth < 768 ? 100 : 80),
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 sm:p-6 pointer-events-none">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={`nav-pill rounded-full p-1.5 flex items-center gap-1 sm:gap-2 pointer-events-auto transition-all duration-300 shadow-2xl w-full max-w-fit mx-auto ${isScrolled ? 'backdrop-blur-xl' : ''}`}
      >
        {/* Logo Section */}
        <button 
          onClick={() => scrollTo('home')}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 group cursor-pointer"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-brand group-hover:scale-125 transition-transform shadow-[0_0_12px_rgba(255,179,198,0.6)] light:shadow-[0_0_15px_rgba(255,100,140,0.5)]" />
          <span className="font-satoshi font-black text-xs sm:text-sm tracking-tight dark:text-white light:text-[#111111] px-0.5">Senyas.IO</span>
        </button>

        <div className="h-4 w-[1px] bg-white/10 dark:bg-white/10 light:bg-black/10 mx-0.5 sm:mx-1" />

        {/* Links & Toggle Group */}
        <div className="flex items-center gap-0.5 sm:gap-1 pl-1">
          {navItems.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`relative px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold transition-all rounded-full cursor-pointer whitespace-nowrap ${
                activeTab === item.id 
                  ? 'text-brand' 
                  : 'text-white/50 hover:text-white dark:text-white/50 light:text-black/80 light:hover:text-black'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-brand/10 dark:bg-brand/10 light:bg-brand/15 border border-brand/20 rounded-full"
                />
              )}
              <span className="relative z-10">{item.name}</span>
            </button>
          ))}

          {/* Custom Theme Toggle */}
          <div className="ml-1 sm:ml-2 mr-1">
            <button
              onClick={toggleTheme}
              className="relative w-12 sm:w-14 h-7 sm:h-8 bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-black/10 rounded-full p-1 flex items-center justify-between cursor-pointer group overflow-hidden"
              aria-label="Toggle theme"
            >
              {/* Sliding Background */}
              <motion.div 
                className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              
              {/* Sliding Circle */}
              <motion.div
                animate={{ x: isDarkMode ? 0 : 20 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute left-1 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-brand shadow-[0_0_10px_rgba(255,179,198,0.5)] light:shadow-[0_0_12px_rgba(255,100,140,0.4)] z-10 flex items-center justify-center p-1.5"
              >
                {isDarkMode ? <Moon className="text-black w-full h-full fill-black" strokeWidth={3} /> : <Sun className="text-black w-full h-full fill-black" strokeWidth={3} />}
              </motion.div>

              <div className="w-full flex justify-around items-center px-1">
                <Moon className={`w-3 h-3 transition-opacity ${isDarkMode ? 'opacity-0' : 'text-black opacity-100'}`} />
                <Sun className={`w-3 h-3 transition-opacity ${!isDarkMode ? 'opacity-0' : 'text-white/40 opacity-100'}`} />
              </div>
            </button>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-white/10 dark:bg-white/10 light:bg-black/10 mx-0.5 sm:mx-1" />

        {/* CTA Group */}
        <div className="pl-1 pr-1 sm:pr-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 sm:px-6 py-2 bg-brand text-black text-[10px] sm:text-xs font-black rounded-full cursor-pointer shadow-[0_5px_15px_rgba(255,179,198,0.3)] light:shadow-[0_5px_15px_rgba(255,100,140,0.3)] hover:shadow-[0_8px_20px_rgba(255,179,198,0.4)] light:hover:shadow-[0_8px_25px_rgba(255,100,140,0.4)] transition-all whitespace-nowrap"
          >
            Sign Up
          </motion.button>
        </div>
      </motion.div>
    </nav>
  );
}
