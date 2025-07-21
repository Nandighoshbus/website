'use client';

import React from 'react';
import SimpleNavbar from './SimpleNavbar';
import SimpleFooter from './SimpleFooter';
import { BackgroundParticles } from '@/components/ui/BackgroundParticles';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 relative overflow-hidden">
      <BackgroundParticles />
      <SimpleNavbar />
      <main className="pt-20">
        {children}
      </main>
      <SimpleFooter />
    </div>
  );
};
