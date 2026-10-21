import React, { useEffect, useState } from 'react';
import { X, XCircle, AlertOctagon } from 'lucide-react';
import type { UnsoldNotification } from '../types/auction.ts';
import { soundEffects } from '../utils/audio.ts';

interface UnsoldPoppingModalProps {
  notification: UnsoldNotification;
  onDismiss: () => void;
}

export const UnsoldPoppingModal: React.FC<UnsoldPoppingModalProps> = ({ notification, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState<number>(4.5);

  useEffect(() => {
    soundEffects.playUnsoldGong();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn font-mono">
      {/* Main Brutalist Card Container */}
      <div className="relative w-full max-w-lg bg-white border-4 border-black brutal-shadow-xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Top Dismiss Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 bg-[#FF1744] hover:bg-black hover:text-white border-2 border-black text-white font-bold cursor-pointer z-20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stadium Unsold Gavel Sticker */}
        <div className="bg-[#FF1744] text-white border-3 border-black px-4 py-1.5 font-mono text-xs font-black uppercase tracking-widest brutal-shadow-sm mb-4 rotate-[-2deg] flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          <span>LOT PASSED · MARKED UNSOLD</span>
        </div>

        {/* Player Photo with Grayscale Filter & Stamp */}
        <div className="relative my-2">
          <div className="w-36 h-36 sm:w-44 sm:h-44 border-4 border-black bg-[#FFF8E7] brutal-shadow overflow-hidden relative">
            <img
              src={notification.playerPhoto}
              alt={notification.playerName}
              className="w-full h-full object-cover filter grayscale contrast-125"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
              }}
            />
            <div className="absolute bottom-2 left-2 right-2 text-xs font-heading bg-black text-white px-2 py-0.5 truncate uppercase">
              {notification.club}
            </div>
          </div>

          {/* Giant Brutalist Rubber UNSOLD Stamp */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF1744]/95 text-white font-heading font-black text-2xl sm:text-3xl px-4 py-1.5 rotate-[-15deg] border-4 border-white brutal-shadow-lg tracking-widest uppercase shadow-2xl animate-pulse">
            UNSOLD
          </div>
        </div>

        {/* Player Name */}
        <h2 className="text-3xl sm:text-4xl font-heading uppercase tracking-tight text-black my-2">
          {notification.playerName}
        </h2>
        <div className="text-xs text-black/70 font-bold uppercase mb-3">
          {notification.position} · {notification.club}
        </div>

        {/* Unsold Details Box */}
        <div className="w-full bg-[#FFF0F2] border-3 border-black p-4 my-2 text-left space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-black/20">
            <span className="text-[11px] font-black uppercase text-black/70 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-[#FF1744]" />
              <span>GAVEL ADJUDICATION</span>
            </span>
            <span className="bg-[#FF1744] text-white px-2 py-0.5 text-[10px] font-black border border-black uppercase">
              NO BIDS RECORDED
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-black pt-1">
            <span>RESERVE BASE PRICE:</span>
            <span className="bg-[#FFD600] px-2 py-0.5 border border-black font-black text-sm">
              £{notification.basePrice}M
            </span>
          </div>

          <p className="text-[11px] text-black/80 font-bold leading-snug pt-1">
            No franchise met the opening reserve. Player returns to the auction pool and may re-enter in the accelerated round.
          </p>
        </div>

        {/* Countdown Progress Bar */}
        <div className="w-full mt-3 flex flex-col gap-1 font-mono">
          <div className="w-full h-3 bg-[#FFF8E7] border-2 border-black overflow-hidden">
            <div
              className="h-full bg-[#FF1744] border-r-2 border-black transition-all duration-100 ease-linear"
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
