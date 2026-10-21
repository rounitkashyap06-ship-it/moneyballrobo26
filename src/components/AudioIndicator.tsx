import React from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';

export const AudioIndicator: React.FC = () => {
  const { isMuted, toggleMute } = useAuction();

  const handleClick = () => {
    soundEffects.playClick();
    toggleMute();
  };

  const isPlaying = !isMuted;

  return (
    <button
      onClick={handleClick}
      title={isPlaying ? 'Mute Stadium Audio' : 'Unmute Stadium Audio'}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF8E7] hover:bg-[#FFD600] text-black border-2 border-black brutal-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer font-mono text-xs font-bold"
    >
      <div className="flex items-center gap-[3px] h-4">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`brutal-audio-bar ${isPlaying ? 'active' : ''}`}
            style={{
              animationDelay: `${bar * 0.12}s`,
              backgroundColor: isPlaying ? '#000000' : '#888888',
            }}
          />
        ))}
      </div>
      <span className="tracking-wider">
        {isPlaying ? 'AUDIO ON' : 'MUTED'}
      </span>
    </button>
  );
};
