import React, { useState, useEffect } from 'react';
import { Play, Shield, Coins, Users, Award } from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';
import { CyberButton } from './CyberButton.tsx';
import { TeamLogo } from './TeamLogo.tsx';

interface PreAuctionViewProps {
  onGoToAdmin?: () => void;
}

export const PreAuctionView: React.FC<PreAuctionViewProps> = ({ onGoToAdmin }) => {
  const { state, currentUser, startAuction } = useAuction();
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    if (!state?.config.startTime) return;

    const targetDate = new Date(state.config.startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state?.config.startTime]);

  const handleStart = async () => {
    soundEffects.playClick();
    await startAuction();
  };

  const isAdmin = currentUser?.role === 'admin';
  const totalPlayers = state?.players.length || 0;
  const totalTeams = state?.teams.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative animate-fadeIn">
      {/* Top Raw Sticker Header */}
      <div className="mb-10 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-[#FFD600] text-black border-2 border-black brutal-shadow-sm px-4 py-1 font-mono text-xs font-black uppercase tracking-wider mb-6 rotate-[-1deg]">
          ★ ROBOFIESTA '26 OFFICIAL PROTOCOL ★
        </div>

        <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl tracking-tight text-black uppercase leading-none mb-6">
          THE AUCTION IS <span className="bg-[#B6FF3B] px-3 py-1 border-4 border-black inline-block rotate-[1deg]">LIVE</span>
        </h1>

        <p className="text-base sm:text-xl text-black font-mono font-medium max-w-2xl mx-auto mb-8">
          {state?.config.detailsText ||
            'Ten franchise teams. Real-time bidding. Zero second chances. Manage your £500M war chest and build your championship squad.'}
        </p>

        {/* Chunky Brutalist Countdown Block */}
        <div className="inline-flex items-center justify-center gap-3 sm:gap-6 bg-white border-4 border-black brutal-shadow-lg p-5 sm:p-7">
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-6xl font-heading text-black leading-none">
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/70 font-black mt-2 bg-[#FFD600] px-2 py-0.5 border border-black">
              HOURS
            </span>
          </div>
          <span className="text-4xl sm:text-5xl font-heading text-black">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-6xl font-heading text-[#3D5AFE] leading-none">
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-white font-black mt-2 bg-[#3D5AFE] px-2 py-0.5 border border-black">
              MINUTES
            </span>
          </div>
          <span className="text-4xl sm:text-5xl font-heading text-black">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-6xl font-heading text-[#FF5CA8] leading-none">
              {String(countdown.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-black font-black mt-2 bg-[#FF5CA8] px-2 py-0.5 border border-black">
              SECONDS
            </span>
          </div>
        </div>

        {/* Admin Gavel Armed Strip */}
        {isAdmin && (
          <div className="mt-8 p-5 bg-[#FFD600] border-4 border-black brutal-shadow flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto">
            <div className="text-left flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-[#FFD600] border-2 border-black flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-black font-heading text-black uppercase">GAVEL MASTER CONTROLS</div>
                <div className="text-xs text-black/80 font-mono font-bold">Auctioneer desk is ready</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <CyberButton
                title="Start Auction"
                onClick={handleStart}
                leftIcon={<Play className="w-4 h-4 fill-black" />}
                variant="lime"
                size="md"
              />
              {onGoToAdmin && (
                <CyberButton
                  title="Admin Desk"
                  onClick={onGoToAdmin}
                  variant="ghost"
                  size="md"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3 Metric Blocks - Flat Loud Color Fills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Metric 1 */}
        <div className="bg-[#FFFDF0] border-4 border-black brutal-shadow p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-black text-black bg-[#FFD600] px-2 py-0.5 border border-black">
                FRANCHISE PURSE
              </span>
              <Coins className="w-5 h-5 text-black" />
            </div>
            <div className="text-4xl sm:text-5xl font-heading text-black my-2">
              £500.0M
            </div>
            <p className="text-xs text-black/80 font-mono font-medium">
              Hard budget cap per franchise. No debt, no overdrafts.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[11px] font-bold text-black flex justify-between">
            <span>MIN BID INCREMENT</span>
            <span className="bg-black text-[#FFD600] px-1.5 py-0.5">£2.5M</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFDF0] border-4 border-black brutal-shadow p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-black text-black bg-[#B6FF3B] px-2 py-0.5 border border-black">
                SUPERSTAR LOTS
              </span>
              <Award className="w-5 h-5 text-black" />
            </div>
            <div className="text-4xl sm:text-5xl font-heading text-black my-2">
              {totalPlayers} STARS
            </div>
            <p className="text-xs text-black/80 font-mono font-medium">
              World-class forwards, midfielders, defenders & goalkeepers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[11px] font-bold text-black flex justify-between">
            <span>SQUAD LIMITS</span>
            <span className="bg-black text-[#B6FF3B] px-1.5 py-0.5">13 TO 15 PLAYERS</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FFFDF0] border-4 border-black brutal-shadow p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-black text-white bg-[#3D5AFE] px-2 py-0.5 border border-black">
                FRANCHISE ARENA
              </span>
              <Users className="w-5 h-5 text-black" />
            </div>
            <div className="text-4xl sm:text-5xl font-heading text-black my-2">
              {totalTeams} TEAMS
            </div>
            <p className="text-xs text-black/80 font-mono font-medium">
              10 competing clubs connected with live synchronized gavel state.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t-2 border-black font-mono text-[11px] font-bold text-black flex justify-between">
            <span>SYNC STATUS</span>
            <span className="bg-black text-[#3D5AFE] text-white px-1.5 py-0.5">REAL-TIME</span>
          </div>
        </div>
      </div>

      {/* Rules & Teams Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rules - 6 Cols */}
        <div className="lg:col-span-6 bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-3">
            <span className="bg-black text-[#FFD600] px-2 py-0.5 font-mono text-xs font-black uppercase">
              OFFICIAL
            </span>
            <h2 className="text-2xl font-heading text-black uppercase">
              AUCTION RULES & PROTOCOL
            </h2>
          </div>

          <div className="space-y-4">
            {state?.config.rules?.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-[#FFF8E7] p-3 border-2 border-black brutal-shadow-sm">
                <span className="w-7 h-7 bg-black text-white font-mono text-xs font-black flex items-center justify-center flex-shrink-0">
                  0{idx + 1}
                </span>
                <span className="text-xs sm:text-sm text-black font-mono font-medium leading-relaxed">
                  {rule}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Registered Franchises - 6 Cols */}
        <div className="lg:col-span-6 bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-7">
          <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-3">
            <h2 className="text-2xl font-heading text-black uppercase">
              FRANCHISE VAULTS
            </h2>
            <span className="bg-[#FF5CA8] text-black font-mono text-xs font-black px-2 py-0.5 border-2 border-black">
              {state?.teams.length} REGISTERED
            </span>
          </div>

          <div className="space-y-3">
            {state?.teams.map((team, idx) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3.5 bg-[#FFF8E7] border-2 border-black brutal-shadow-sm hover:translate-x-1 hover:bg-[#FFD600] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 border-2 border-black flex items-center justify-center p-1 bg-white shadow-[2px_2px_0_#000] flex-shrink-0"
                  >
                    <TeamLogo logo={team.logo} name={team.teamName} size="custom" className="w-full h-full" />
                  </div>
                  <div>
                    <div className="text-sm font-heading text-black uppercase">{team.teamName}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-black bg-white px-2 py-0.5 border-2 border-black">
                    ${team.startingBalance.toFixed(1)}M
                  </div>
                  <div className="text-[9px] text-black/60 font-black uppercase mt-0.5">PURSE</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
