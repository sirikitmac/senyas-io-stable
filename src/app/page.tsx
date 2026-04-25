'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import How from '@/components/How';
import Features from '@/components/Features';
import Impact from '@/components/Impact';
import Contact from '@/components/Contact';
import Background from '@/components/Background';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <main className={`relative selection:bg-brand selection:text-black min-h-screen overflow-x-hidden ${isDarkMode ? 'dark' : 'light'}`}>
      <Background isDarkMode={isDarkMode} />
      <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <div className="relative z-10">
        <Hero />
        <How />
        <Features />
        <Impact />
        <Contact />
      </div>
    </main>
  );
}
