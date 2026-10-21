import React, { useEffect, useState } from 'react';
import { X, Gavel } from 'lucide-react';
import type { SoldNotification } from '../types/auction.ts';
import { TeamLogo } from './TeamLogo.tsx';

interface SoldPoppingModalProps {
  notification: SoldNotification;
  onDismiss: () => void;
}

export const SoldPoppingModal: React.FC<SoldPoppingModalProps> = ({ notification, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState<number>(4.5);

  useEffect(() => {
    const interval = 100;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 0.1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const progressPct = (timeLeft / 4.5) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
      {/* Main Brutalist Card Container */}
      <div className="relative w-full max-w-lg bg-white border-4 border-black brutal-shadow-xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Top Dismiss Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black text-black font-bold cursor-pointer z-20"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stadium Hammer Dropped Sticker */}
        <div className="bg-[#FF5CA8] text-black border-3 border-black px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest brutal-shadow-sm mb-4 rotate-[-2deg] flex items-center gap-2">
          <Gavel className="w-4 h-4" />
          <span>GAVEL HAS FALLEN · SOLD!</span>
        </div>

        {/* Player Photo with Black Border & SOLD Stamp */}
        <div className="relative my-2">
          <div className="w-36 h-36 sm:w-44 sm:h-44 border-4 border-black bg-[#FFF8E7] brutal-shadow overflow-hidden relative">
            <img
              src={notification.playerPhoto}
              alt={notification.playerName}
              className="w-full h-full object-cover filter contrast-110"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
              }}
            />
            <div className="absolute bottom-2 left-2 right-2 text-xs font-heading bg-black text-white px-2 py-0.5 truncate uppercase">
              {notification.club}
            </div>
          </div>

          {/* Giant Brutalist SOLD Stamp */}
          <div className="absolute -bottom-3 -right-4 bg-[#FFD600] text-black font-heading font-black text-base px-3 py-1 rotate-[-8deg] border-3 border-black brutal-shadow-sm tracking-wider uppercase">
            HAMMERED!
          </div>
        </div>

        {/* Player Name */}
        <h2 className="text-3xl sm:text-4xl font-heading uppercase tracking-tight text-black my-2">
          {notification.playerName}
        </h2>

        {/* Winning Team & Price Card */}
        <div className="w-full bg-[#FFFDF0] border-3 border-black p-4 my-2 flex items-center justify-between font-mono">
          <div className="text-left flex items-center gap-2.5 min-w-0">
            <div
              className="w-11 h-11 border-2 border-black flex items-center justify-center p-1 bg-white brutal-shadow-sm flex-shrink-0"
            >
              <TeamLogo logo={notification.teamLogo} name={notification.teamName} size="custom" className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-black/70 block">
                SOLD TO FRANCHISE
              </span>
              <div className="text-lg font-heading text-black uppercase truncate">
                {notification.teamName}
              </div>
            </div>
          </div>

          {/* Sold Final Price */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-black text-black block">
              HAMMER RATE
            </span>
            <div className="text-2xl sm:text-3xl font-heading text-black bg-[#FFD600] px-2 py-0.5 border-2 border-black mt-0.5">
              £{notification.soldPrice.toFixed(1)}M
            </div>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="w-full mt-3 flex flex-col gap-1 font-mono">
          <div className="w-full h-3 bg-[#FFF8E7] border-2 border-black overflow-hidden">
            <div
              className="h-full bg-[#B6FF3B] border-r-2 border-black transition-all duration-100 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-black font-bold">
            <span>NEXT LOT IN</span>
            <span>{Math.ceil(timeLeft)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
