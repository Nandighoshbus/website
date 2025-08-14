'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { BackgroundParticles } from '@/components/ui/BackgroundParticles';
import { useLanguage } from '@/components/context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentLanguage, setCurrentLanguage, currentLang } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
      <BackgroundParticles />
      <Navbar 
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        currentLang={currentLang}
      />
      <main className="pt-20">
        {children}
      </main>
      <Footer 
        currentLang={currentLang}
        currentTime={currentTime}
      />
    </div>
  );
};
