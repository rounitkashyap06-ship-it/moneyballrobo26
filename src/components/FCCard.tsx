import React from 'react';
import type { Player } from '../types/auction';

interface FCCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showHover?: boolean;
}

export const FCCard: React.FC<FCCardProps> = ({
  player,
  size = 'md',
  className = '',
  showHover = true,
}) => {
  const isGK = player.position === 'GK';
  const isDedicatedCard =
    player.photo?.includes('_card') ||
    player.photo?.includes('futgg') ||
    player.photo?.includes('player-item-card') ||
    player.photo?.includes('/images/');

  // Size scaling classes
  const sizeClasses = {
    sm: 'w-[140px] h-[183px] text-[8px]',
    md: 'w-[220px] h-[287px] text-[10px]',
    lg: 'w-[290px] h-[379px] text-[12px]',
    hero: 'w-full max-w-[340px] sm:max-w-[380px] h-auto aspect-[526/687] text-[13px]',
  }[size];

  // If already an official card image asset, display it cleanly
  if (isDedicatedCard) {
    return (
      <div
        className={`relative select-none flex items-center justify-center ${sizeClasses} ${className} ${
          showHover ? 'hover:scale-[1.02] transition-transform duration-300' : ''
        }`}
      >
        <img
          src={player.photo}
          alt={player.name}
          className="w-full h-full object-contain filter drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] pointer-events-none"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
          }}
        />
      </div>
    );
  }

  // Authentic EA SPORTS FC 26 Ultimate Team Gold Rare Card Renderer
  const ovr = player.stats?.overall || 85;
  const pos = player.position || 'ST';
  const stats = player.stats || {
    pace: 85,
    shooting: 82,
    passing: 80,
    dribbling: 84,
    defending: 50,
    physical: 78,
    overall: ovr,
  };

  // Extract last name for traditional card display
  const nameParts = player.name.split(' ');
  const displayName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : player.name;

  return (
    <div
      className={`relative select-none ${sizeClasses} ${className} ${
        showHover ? 'hover:scale-[1.02] transition-transform duration-300' : ''
      }`}
    >
      {/* 526:687 aspect ratio FC Card Container */}
      <div className="w-full h-full relative overflow-hidden rounded-[18px] border-[3px] border-black bg-gradient-to-b from-[#ECD087] via-[#DDB457] to-[#B38827] shadow-[8px_8px_0px_#000] flex flex-col justify-between p-[5%]">
        
        {/* Subtle holographic sheen overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-black/25 pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

        {/* Top Header: OVR + Position + Chemistry */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex flex-col items-center leading-none text-[#2A2006]">
            <span className="font-heading font-black text-[2.4em] tracking-tighter drop-shadow-sm">
              {ovr}
            </span>
            <span className="font-heading font-black text-[1em] tracking-wider mt-0.5 uppercase opacity-90">
              {pos}
            </span>
          </div>

          {/* FC 26 PlayStyle Symbol */}
          <div className="w-[1.8em] h-[1.8em] rounded-full border-2 border-[#2A2006] bg-black/10 flex items-center justify-center font-black text-[0.8em] text-[#2A2006]">
            ★
          </div>
        </div>

        {/* Center: Player Portrait Cutout */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[72%] h-[56%] z-0 flex items-center justify-center overflow-hidden">
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-cover object-top filter contrast-105 brightness-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
            }}
          />
        </div>

        {/* Lower Banner: Name & 6 Core Attributes */}
        <div className="relative z-10 mt-auto bg-gradient-to-b from-[#EED38C]/95 to-[#CF9F34]/95 border-t-2 border-[#8E6514] pt-[4%] pb-[3%] px-[4%] rounded-b-[12px] text-[#2A2006]">
          {/* Player Name */}
          <div className="text-center font-heading font-black text-[1.25em] tracking-wide uppercase truncate drop-shadow-sm pb-[3%] border-b border-[#A6781B]/40">
            {displayName}
          </div>

          {/* 6 Stats Grid */}
          <div className="grid grid-cols-6 gap-0.5 text-center pt-[4%] font-mono font-bold leading-tight">
            {isGK ? (
              <>
                <div>
                  <div className="text-[0.65em] opacity-80">DIV</div>
                  <div className="text-[1.1em] font-black">{stats.pace}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">HAN</div>
                  <div className="text-[1.1em] font-black">{stats.shooting}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">KIC</div>
                  <div className="text-[1.1em] font-black">{stats.passing}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">REF</div>
                  <div className="text-[1.1em] font-black">{stats.dribbling}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">SPD</div>
                  <div className="text-[1.1em] font-black">{stats.defending}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">POS</div>
                  <div className="text-[1.1em] font-black">{stats.physical}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-[0.65em] opacity-80">PAC</div>
                  <div className="text-[1.1em] font-black">{stats.pace}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">SHO</div>
                  <div className="text-[1.1em] font-black">{stats.shooting}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">PAS</div>
                  <div className="text-[1.1em] font-black">{stats.passing}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">DRI</div>
                  <div className="text-[1.1em] font-black">{stats.dribbling}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">DEF</div>
                  <div className="text-[1.1em] font-black">{stats.defending}</div>
                </div>
                <div>
                  <div className="text-[0.65em] opacity-80">PHY</div>
                  <div className="text-[1.1em] font-black">{stats.physical}</div>
                </div>
              </>
            )}
          </div>

          {/* Club & Nationality strip */}
          <div className="flex items-center justify-center gap-2 pt-[3%] text-[0.75em] font-heading font-black opacity-90 truncate">
            <span>{player.nationality}</span>
            <span>·</span>
            <span>{player.currentClub}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
