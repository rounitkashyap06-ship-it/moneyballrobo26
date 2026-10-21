import React, { useEffect, useState } from 'react';

export const BackgroundSpotlight: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Crisp Architectural Grid Pattern */}
      <div className="absolute inset-0 brutal-grid-bg opacity-70" />

      {/* Tiny live coordinate tracker in the corner - pure brutalist engineering detail */}
      <div className="fixed bottom-3 right-3 bg-black text-[#FFD600] font-mono text-[10px] font-bold px-2.5 py-1 border-2 border-black brutal-shadow-sm hidden md:block">
        POS: [{mousePos.x}, {mousePos.y}] /// ROBOFIESTA '26
      </div>
    </div>
  );
};
