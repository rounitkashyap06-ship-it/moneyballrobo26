import React from 'react';

interface BentoTiltProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // Kept for backwards compatibility
  intensity?: number;
}

export const BentoTilt: React.FC<BentoTiltProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`relative bg-white border-[3px] border-black shadow-[6px_6px_0_#000] rounded-[2px] transition-all duration-100 ease-out hover:-translate-y-1 hover:shadow-[8px_8px_0_#000] ${className}`}
    >
      {children}
    </div>
  );
};
