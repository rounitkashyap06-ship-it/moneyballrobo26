import React, { useState } from 'react';
import {
  Flame,
  Maximize2,
  Minimize2,
  Trophy,
  UserCheck,
  X,
  Gavel,
  Radio,
  CheckCircle,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { FCCard } from './FCCard.tsx';
import type { Team } from '../types/auction.ts';

interface ViewerSimulationViewProps {
  onExitViewer?: () => void;
}

export const ViewerSimulationView: React.FC<ViewerSimulationViewProps> = ({ onExitViewer }) => {
  const { state, wsConnected } = useAuction();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inspectTeam, setInspectTeam] = useState<Team | null>(null);

  const currentPlayer = state?.players.find((p) => p.id === state.currentPlayerId);
  const liveBidding = state?.liveBidding || {
    playerId: currentPlayer?.id || null,
    currentBid: currentPlayer?.basePrice || 60,
    currentBidderTeamId: null,
    currentBidderTeamName: null,
    callStage: 'NORMAL',
    lastBidTimestamp: null,
  };

  const teams = state?.teams || [];
  const salesHistory = state?.salesHistory || [];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 font-mono text-black">
      {/* Broadcast Header Control Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-4 border-black brutal-shadow-lg px-6 py-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-[#FFD600] border-3 border-black brutal-shadow-sm flex items-center justify-center flex-shrink-0">
            <span className="font-heading font-black text-2xl text-black">M</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-heading font-black tracking-tight text-black uppercase">
                MONEYBALL '26
              </span>
              <span className="text-[10px] font-mono tracking-widest text-black bg-[#B6FF3B] border-2 border-black px-2 py-0.5 uppercase font-black">
                PROJECTOR MODE
              </span>
            </div>
            <div className="text-xs text-black/80 flex items-center gap-2 font-bold">
              <span className="h-2.5 w-2.5 bg-[#00C853] inline-block rounded-full animate-ping" />
              <span>LIVE EVENT HALL SPECTATOR BROADCAST · 10 TEAMS · £500M PURSE</span>
            </div>
          </div>
        </div>

        {/* Live Stage Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 ${
              wsConnected ? 'bg-[#00C853] text-white' : 'bg-[#FF6D00] text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{wsConnected ? 'WEBSOCKET SYNCHRONIZED' : 'CONNECTING...'}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white hover:bg-[#FFF8E7] border-2 border-black brutal-shadow-sm text-black cursor-pointer transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onExitViewer && (
            <button
              onClick={onExitViewer}
              className="p-2 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black brutal-shadow-sm text-black cursor-pointer transition-all"
              title="Exit Projector Mode"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Call Stage Live Gavel Banner */}
      {liveBidding.callStage === 'GOING_ONCE' && (
        <div className="bg-[#FFD600] border-4 border-black p-5 brutal-shadow-lg text-center font-heading font-black text-3xl sm:text-4xl uppercase tracking-wider animate-pulse flex items-center justify-center gap-3">
          <Gavel className="w-8 h-8 text-black" />
          <span>GOING ONCE... £{liveBidding.currentBid}M ({liveBidding.currentBidderTeamName || 'NO BIDDER'})</span>
        </div>
      )}

      {liveBidding.callStage === 'GOING_TWICE' && (
        <div className="bg-[#FF6D00] text-white border-4 border-black p-5 brutal-shadow-lg text-center font-heading font-black text-3xl sm:text-4xl uppercase tracking-wider animate-bounce flex items-center justify-center gap-3">
          <Gavel className="w-8 h-8 text-white" />
          <span>GOING TWICE... £{liveBidding.currentBid}M ({liveBidding.currentBidderTeamName})</span>
        </div>
      )}

      {liveBidding.callStage === 'SOLD' && (
        <div className="bg-[#00C853] text-white border-4 border-black p-5 brutal-shadow-lg text-center font-heading font-black text-3xl sm:text-4xl uppercase tracking-wider flex items-center justify-center gap-3">
          <CheckCircle className="w-8 h-8 text-white" />
          <span>SOLD TO {liveBidding.currentBidderTeamName}! (£{liveBidding.currentBid}M)</span>
        </div>
      )}

      {/* Main Split: Center Gavel Stage & Side Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ==================== CENTER GAVEL ARENA (8 Cols) ==================== */}
        <div className="xl:col-span-8 space-y-6">
          {currentPlayer ? (
            <div className="bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-8 space-y-6">
              {/* Header Lot Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b-4 border-black">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FF5CA8] text-black border-2 border-black px-4 py-1.5 font-heading font-black text-sm tracking-wider uppercase brutal-shadow-sm flex items-center gap-2">
                    <Flame className="w-5 h-5 fill-black" />
                    <span>LOT ON HAMMER</span>
                  </div>
                  <span className="font-heading font-black text-sm uppercase">
                    SET {currentPlayer.setId || 1}: {currentPlayer.setName || 'Marquee Players'} · #{currentPlayer.orderInSet || 1}
                  </span>
                </div>

                <div className="bg-[#FFF8E7] border-2 border-black px-3 py-1 font-mono font-bold text-xs uppercase">
                  OPENING BASE: <strong className="text-black">£{currentPlayer.basePrice}M</strong>
                </div>
              </div>

              {/* Card & Bid Figures Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* 5 Cols: FC Card */}
                <div className="md:col-span-5 flex justify-center">
                  <FCCard player={currentPlayer} size="hero" showHover={false} />
                </div>

                {/* 7 Cols: Massive Live Bid Numbers & Bidder */}
                <div className="md:col-span-7 space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-heading font-black text-black uppercase tracking-tight">
                      {currentPlayer.name}
                    </h2>
                    <div className="text-sm font-mono text-black/70 font-bold mt-1">
                      {currentPlayer.position} · {currentPlayer.currentClub} · {currentPlayer.nationality}
                    </div>
                  </div>

                  {/* Current Bid Card */}
                  <div className="bg-[#FFF8E7] border-4 border-black p-6 brutal-shadow text-center">
                    <span className="text-xs text-black/70 font-black uppercase tracking-wider block">
                      CURRENT HIGHEST BID
                    </span>
                    <div className="text-5xl sm:text-6xl font-heading font-black text-black mt-1">
                      £{liveBidding.currentBid}M
                    </div>
                  </div>

                  {/* Current Bidder Box */}
                  <div className="bg-black text-white p-5 border-4 border-black brutal-shadow">
                    <div className="text-xs text-[#FFD600] font-black uppercase tracking-wider">
                      CURRENT BIDDER FRANCHISE
                    </div>
                    <div className="text-3xl font-heading font-black uppercase mt-1 truncate">
                      {liveBidding.currentBidderTeamName || 'NO BIDDER YET'}
                    </div>
                    <div className="text-xs text-white/70 font-bold mt-1">
                      {liveBidding.lastBidTimestamp
                        ? `Adjudicated at ${new Date(liveBidding.lastBidTimestamp).toLocaleTimeString()}`
                        : 'Awaiting opening verbal offer'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Attributes Grid */}
              <div className="pt-4 border-t-2 border-black">
                <div className="grid grid-cols-6 gap-2 text-center font-mono">
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[10px] text-black/60 font-black">PACE</div>
                    <div className="text-lg font-heading font-black">{currentPlayer.stats.pace}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[10px] text-black/60 font-black">SHOOTING</div>
                    <div className="text-lg font-heading font-black">{currentPlayer.stats.shooting}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[10px] text-black/60 font-black">PASSING</div>
                    <div className="text-lg font-heading font-black">{currentPlayer.stats.passing}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[10px] text-black/60 font-black">DRIBBLING</div>
                    <div className="text-lg font-heading font-black">{currentPlayer.stats.dribbling}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[10px] text-black/60 font-black">DEFENDING</div>
                    <div className="text-lg font-heading font-black">{currentPlayer.stats.defending}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[10px] text-black/60 font-black">PHYSICAL</div>
                    <div className="text-lg font-heading font-black">{currentPlayer.stats.physical}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-black brutal-shadow-lg p-16 text-center">
              <Trophy className="w-16 h-16 text-black mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-black uppercase">AUCTIONEER PREPARING NEXT LOT</h2>
              <p className="text-xs text-black/70 mt-1">Please stand by for the next superstar.</p>
            </div>
          )}
        </div>

        {/* ==================== SIDE FEED: RECENT SALES & LOT QUEUE (4 Cols) ==================== */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border-4 border-black brutal-shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="font-heading font-black text-sm uppercase text-black">
                CONFIRMED SALES FEED
              </span>
              <span className="text-[10px] bg-[#B6FF3B] px-2 py-0.5 border border-black font-black">
                {salesHistory.length} LOTS SOLD
              </span>
            </div>

            {salesHistory.length === 0 ? (
              <div className="p-4 bg-[#FFF8E7] border-2 border-black text-center text-xs text-black/60 font-bold">
                No lots hammered yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {salesHistory.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 bg-[#FFFDF0] border-2 border-black flex items-center justify-between"
                  >
                    <div className="truncate">
                      <div className="font-heading font-black text-sm uppercase truncate text-black">
                        {sale.playerName}
                      </div>
                      <div className="text-xs text-black/70 truncate">
                        Sold to <strong className="text-black">{sale.teamName}</strong>
                      </div>
                    </div>
                    <span className="bg-[#FFD600] px-2.5 py-1 border-2 border-black font-black text-sm text-black flex-shrink-0">
                      £{sale.soldPrice}M
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRD Section 15 & 19: Global Team Purse Table on Projector Screen */}
      <div className="bg-white border-4 border-black brutal-shadow-lg overflow-x-auto">
        <div className="p-4 bg-black text-white font-heading font-black text-sm uppercase flex items-center justify-between">
          <span>FRANCHISE BUDGET & SQUAD CAPACITY AUDIT</span>
          <span className="font-mono text-xs text-[#B6FF3B]">£500M EQUAL COMMENCEMENT</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FFF8E7] border-b-2 border-black text-black font-black uppercase text-[11px]">
              <th className="p-3 border-r border-black">FRANCHISE</th>
              <th className="p-3 border-r border-black text-right">STARTING PURSE</th>
              <th className="p-3 border-r border-black text-right">SPENT</th>
              <th className="p-3 border-r border-black text-right">REMAINING PURSE</th>
              <th className="p-3 border-r border-black text-center">SQUAD SIZE</th>
              <th className="p-3 text-center">QUALIFICATION</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, idx) => {
              const spent = Number((t.startingBalance - t.remainingBalance).toFixed(1));
              return (
                <tr
                  key={t.id}
                  className={`border-b border-black/15 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF0]'}`}
                >
                  <td className="p-3 font-heading font-black text-sm uppercase border-r border-black/10 flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 inline-block border border-black"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.teamName}</span>
                  </td>
                  <td className="p-3 text-right border-r border-black/10 text-black/70">
                    £{t.startingBalance}M
                  </td>
                  <td className="p-3 text-right border-r border-black/10 text-red-600 font-bold">
                    £{spent}M
                  </td>
                  <td className="p-3 text-right border-r border-black/10 font-heading font-black text-sm text-black">
                    <span className="bg-[#B6FF3B] px-2 py-0.5 border border-black">
                      £{t.remainingBalance}M
                    </span>
                  </td>
                  <td className="p-3 text-center border-r border-black/10 font-black">
                    {t.boughtPlayers.length} / {t.maxSquadSize}
                  </td>
                  <td className="p-3 text-center font-bold text-[10px] uppercase">
                    <span
                      className={`px-2 py-0.5 border border-black uppercase ${
                        t.qualificationStatus === 'TOP_4'
                          ? 'bg-[#3D5AFE] text-white'
                          : t.qualificationStatus === 'BOTTOM_6'
                          ? 'bg-[#FF6D00] text-white'
                          : 'bg-black/10 text-black'
                      }`}
                    >
                      {t.qualificationStatus}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
