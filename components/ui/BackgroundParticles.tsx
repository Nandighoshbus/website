'use client';

import React from 'react';

export const BackgroundParticles: React.FC = () => {
  const particles = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      position: i, // Use position index instead of random values
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-2 h-2 bg-orange-300 rounded-full opacity-20 animate-float particle-${particle.position}`}
        />
      ))}
    </div>
  );
};
