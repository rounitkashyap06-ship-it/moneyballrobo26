import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import { FCCard } from './FCCard.tsx';
import {
  Flame,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Gavel,
  Radio,
  Plus,
  Minus,
  CheckCircle,
} from 'lucide-react';

export const UserLiveAuctionView: React.FC = () => {
  const { state, currentUser, recordBid, setCallStage, sellPlayer, markUnsold, nextPlayer, prevPlayer } =
    useAuction();

  const isAdmin = currentUser?.role === 'admin';
  const myTeam = state?.teams.find((t) => t.id === currentUser?.teamId);

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

  // Admin Verbal Bidding Controls state
  const [selectedBidderTeamId, setSelectedBidderTeamId] = useState<string>(teams[0]?.id || '');
  const [customBidAmount, setCustomBidAmount] = useState<number>(liveBidding.currentBid + 5);
  const [adminActionError, setAdminActionError] = useState<string | null>(null);

  const handleAdjustBid = async (increment: number) => {
    if (!isAdmin) return;
    const newBid = Math.max(currentPlayer?.basePrice || 10, liveBidding.currentBid + increment);
    const targetTeamId = selectedBidderTeamId || liveBidding.currentBidderTeamId || teams[0]?.id;
    setAdminActionError(null);
    const res = await recordBid(newBid, targetTeamId);
    if (!res.success) {
      setAdminActionError(res.error || 'Bid rejected');
    }
  };

  const handleCustomBid = async () => {
    if (!isAdmin || !customBidAmount) return;
    setAdminActionError(null);
    const res = await recordBid(customBidAmount, selectedBidderTeamId);
    if (!res.success) {
      setAdminActionError(res.error || 'Bid rejected');
    }
  };

  const handleSellNow = async () => {
    if (!isAdmin || !currentPlayer) return;
    const winningTeamId = liveBidding.currentBidderTeamId || selectedBidderTeamId;
    if (!winningTeamId) {
      setAdminActionError('Select a winning team first');
      return;
    }
    setAdminActionError(null);
    const res = await sellPlayer(currentPlayer.id, winningTeamId, liveBidding.currentBid);
    if (!res.success) {
      setAdminActionError(res.error || 'Sale failed');
    }
  };

  const handleUnsoldNow = async () => {
    if (!isAdmin || !currentPlayer) return;
    setAdminActionError(null);
    await markUnsold(currentPlayer.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Call Stage Live Alert (PRD Section 16) */}
      {liveBidding.callStage === 'GOING_ONCE' && (
        <div className="bg-[#FFD600] border-4 border-black p-4 brutal-shadow text-center font-heading font-black text-2xl uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
          <Gavel className="w-6 h-6 text-black" />
          <span>GOING ONCE... £{liveBidding.currentBid}M ({liveBidding.currentBidderTeamName || 'NO BIDDER'})</span>
        </div>
      )}

      {liveBidding.callStage === 'GOING_TWICE' && (
        <div className="bg-[#FF6D00] text-white border-4 border-black p-4 brutal-shadow text-center font-heading font-black text-2xl uppercase tracking-wider animate-bounce flex items-center justify-center gap-2">
          <Gavel className="w-6 h-6 text-white" />
          <span>GOING TWICE... £{liveBidding.currentBid}M ({liveBidding.currentBidderTeamName})</span>
        </div>
      )}

      {liveBidding.callStage === 'SOLD' && (
        <div className="bg-[#00C853] text-white border-4 border-black p-4 brutal-shadow text-center font-heading font-black text-2xl uppercase tracking-wider flex items-center justify-center gap-2">
          <CheckCircle className="w-6 h-6 text-white" />
          <span>SOLD TO {liveBidding.currentBidderTeamName}! (£{liveBidding.currentBid}M)</span>
        </div>
      )}

      {/* Main 3-Column Arena Layout (Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================== 1. LEFT: CURRENT CARD LOT (5 Cols) ==================== */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {currentPlayer ? (
            <div className="w-full bg-white border-4 border-black brutal-shadow-lg p-5 flex flex-col items-center text-center">
              {/* Top Banner Sticker */}
              <div className="bg-[#FF5CA8] text-black border-2 border-black px-3.5 py-1 font-mono font-black text-xs tracking-wider uppercase mb-4 brutal-shadow-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-black" />
                <span>SET {currentPlayer.setId || 1}: {currentPlayer.setName || 'Marquee Players'} · LOT #{currentPlayer.orderInSet || 1}</span>
              </div>

              {/* Ultra-sharp EA FC 26 Card */}
              <div className="w-full flex items-center justify-center py-2">
                <FCCard player={currentPlayer} size="hero" showHover={false} />
              </div>

              {/* Player details */}
              <div className="mt-4 font-mono text-center">
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-black uppercase tracking-tight">
                  {currentPlayer.name}
                </h2>
                <div className="text-xs text-black/70 font-bold mt-1">
                  {currentPlayer.position} · {currentPlayer.currentClub} · {currentPlayer.nationality}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-white border-4 border-black brutal-shadow-lg p-12 text-center font-mono">
              <Award className="w-12 h-12 text-black mx-auto mb-3" />
              <h3 className="text-xl font-heading font-black uppercase">NO ACTIVE LOT ON GAVEL</h3>
              <p className="text-xs text-black/70 mt-1">Auctioneer is selecting the next player.</p>
            </div>
          )}
        </div>

        {/* ==================== 2. CENTER: LIVE BID LADDER & STATS (4 Cols) ==================== */}
        <div className="lg:col-span-4 space-y-5">
          {/* Real-time Bid Display (PRD Section 14 & 15) */}
          <div className="bg-white border-4 border-black brutal-shadow-lg p-6 space-y-5 font-mono">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="text-xs text-black font-black uppercase bg-[#B6FF3B] px-2 py-0.5 border border-black">
                LIVE GAVEL STATUS
              </span>
              <span className="text-[10px] text-black/70 font-bold uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#00C853] animate-pulse" />
                <span>SYNCED VIA WEBSOCKET</span>
              </span>
            </div>

            {/* Current Bid Figure */}
            <div className="bg-[#FFF8E7] border-3 border-black p-4 brutal-shadow-sm text-center">
              <span className="text-[10px] text-black/70 font-black uppercase tracking-wider">
                CURRENT HIGHEST BID
              </span>
              <div className="text-4xl sm:text-5xl font-heading font-black text-black mt-1">
                £{liveBidding.currentBid}M
              </div>
              <div className="text-xs text-black/80 font-bold mt-2">
                OPENING BASE: <strong>£{currentPlayer?.basePrice || 60}M</strong>
              </div>
            </div>

            {/* Current Bidder Franchise */}
            <div className="bg-black text-white p-4 border-3 border-black brutal-shadow-sm">
              <div className="text-[10px] text-[#FFD600] font-black uppercase tracking-wider">
                CURRENT BIDDER FRANCHISE
              </div>
              <div className="text-2xl font-heading font-black uppercase mt-1 truncate">
                {liveBidding.currentBidderTeamName || 'NO BID RECORDED YET'}
              </div>
              <div className="text-[10px] text-white/70 font-bold mt-1">
                {liveBidding.lastBidTimestamp
                  ? `Recorded at ${new Date(liveBidding.lastBidTimestamp).toLocaleTimeString()}`
                  : 'Awaiting opening verbal offer'}
              </div>
            </div>

            {/* Core Stats Overview */}
            {currentPlayer && (
              <div className="pt-2">
                <span className="text-[10px] text-black/70 font-black uppercase block mb-2">
                  OFFICIAL 6 ATTRIBUTES
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[9px] text-black/60">PACE</div>
                    <div className="text-base font-heading font-black">{currentPlayer.stats.pace}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[9px] text-black/60">SHOOTING</div>
                    <div className="text-base font-heading font-black">{currentPlayer.stats.shooting}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[9px] text-black/60">PASSING</div>
                    <div className="text-base font-heading font-black">{currentPlayer.stats.passing}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[9px] text-black/60">DRIBBLING</div>
                    <div className="text-base font-heading font-black">{currentPlayer.stats.dribbling}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[9px] text-black/60">DEFENDING</div>
                    <div className="text-base font-heading font-black">{currentPlayer.stats.defending}</div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2">
                    <div className="text-[9px] text-black/60">PHYSICAL</div>
                    <div className="text-base font-heading font-black">{currentPlayer.stats.physical}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================== ADMIN VERBAL BIDDING CONTROL PANEL (PRD Section 13) ==================== */}
          {isAdmin && (
            <div className="bg-white border-4 border-black brutal-shadow-lg p-5 font-mono space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <div className="flex items-center gap-1.5 font-heading font-black text-xs uppercase text-black">
                  <Shield className="w-4 h-4 text-black" />
                  <span>AUCTIONEER GAVEL DESK</span>
                </div>
                <span className="text-[10px] font-black bg-[#FFD600] px-1.5 py-0.2 border border-black uppercase">
                  VERBAL ENTRY
                </span>
              </div>

              {/* Team Selector Buttons (10 Teams) */}
              <div>
                <label className="block text-[10px] font-black uppercase text-black/70 mb-1">
                  1. SELECT BIDDING FRANCHISE:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedBidderTeamId(t.id)}
                      className={`p-1.5 text-left text-[11px] font-bold border-2 border-black truncate transition-all cursor-pointer ${
                        selectedBidderTeamId === t.id
                          ? 'bg-black text-white brutal-shadow-sm'
                          : 'bg-[#FFF8E7] text-black hover:bg-black/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-heading font-black">{t.teamName}</span>
                        <span className="text-[9px] opacity-75 font-mono">£{t.remainingBalance}M</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Bid Increments */}
              <div>
                <label className="block text-[10px] font-black uppercase text-black/70 mb-1">
                  2. RECORD BID INCREMENT:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAdjustBid(2.5)}
                    className="py-2 bg-[#B6FF3B] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                  >
                    +£2.5M
                  </button>
                  <button
                    onClick={() => handleAdjustBid(5)}
                    className="py-2 bg-[#FFD600] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                  >
                    +£5M
                  </button>
                  <button
                    onClick={() => handleAdjustBid(-5)}
                    className="py-2 bg-[#FFF8E7] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                  >
                    -£5M
                  </button>
                </div>
              </div>

              {/* Custom Bid Input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customBidAmount}
                  onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                  placeholder="Custom £M"
                  className="flex-1 p-2 bg-[#FFF8E7] border-2 border-black font-black text-xs"
                />
                <button
                  onClick={handleCustomBid}
                  className="px-3 py-2 bg-black text-white hover:bg-[#3D5AFE] font-black text-xs uppercase border-2 border-black cursor-pointer transition-colors"
                >
                  SET BID
                </button>
              </div>

              {/* Gavel Call Triggers */}
              <div>
                <label className="block text-[10px] font-black uppercase text-black/70 mb-1">
                  3. GAVEL CALLS & SOLD:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCallStage('GOING_ONCE')}
                    className="py-2 bg-[#FFD600] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer"
                  >
                    GOING ONCE
                  </button>
                  <button
                    onClick={() => setCallStage('GOING_TWICE')}
                    className="py-2 bg-[#FF6D00] hover:bg-black text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer"
                  >
                    GOING TWICE
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={handleSellNow}
                    className="py-2.5 bg-[#00C853] hover:bg-black text-white border-2 border-black font-heading font-black text-xs uppercase brutal-shadow-sm cursor-pointer"
                  >
                    🔨 SOLD!
                  </button>
                  <button
                    onClick={handleUnsoldNow}
                    className="py-2.5 bg-[#FF1744] hover:bg-black text-white border-2 border-black font-heading font-black text-xs uppercase brutal-shadow-sm cursor-pointer"
                  >
                    UNSOLD
                  </button>
                </div>
              </div>

              {/* Player Navigation */}
              <div className="flex items-center justify-between pt-2 border-t-2 border-black">
                <button
                  onClick={prevPlayer}
                  className="px-3 py-1.5 bg-[#FFF8E7] hover:bg-black hover:text-white border-2 border-black font-black text-[11px] uppercase cursor-pointer"
                >
                  ◀ PREV LOT
                </button>
                <button
                  onClick={nextPlayer}
                  className="px-3 py-1.5 bg-[#FFF8E7] hover:bg-black hover:text-white border-2 border-black font-black text-[11px] uppercase cursor-pointer"
                >
                  NEXT LOT ▶
                </button>
              </div>

              {adminActionError && (
                <div className="p-2 bg-red-100 border-2 border-red-600 text-red-700 font-bold text-xs">
                  {adminActionError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== 3. RIGHT: MY FRANCHISE STATUS & RECENT HAMMER FEED (3 Cols) ==================== */}
        <div className="lg:col-span-3 space-y-5 font-mono">
          {/* User's Franchise Card */}
          {myTeam ? (
            <div className="bg-white border-4 border-black brutal-shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <span className="text-[10px] font-black uppercase text-black/70">MY FRANCHISE</span>
                <span className="font-heading font-black text-xs uppercase text-black bg-[#FFD600] px-1.5 py-0.2 border border-black">
                  {myTeam.qualificationStatus}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 border-2 border-black flex items-center justify-center font-heading font-black text-white text-sm"
                  style={{ backgroundColor: myTeam.color }}
                >
                  {myTeam.teamName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-black">
                    {myTeam.teamName}
                  </h3>
                  <div className="text-[10px] text-black/70 font-bold">
                    {myTeam.boughtPlayers.length} / {myTeam.maxSquadSize} SIGNED
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF8E7] border-2 border-black p-3 text-center">
                <div className="text-[10px] text-black/70 font-black uppercase">REMAINING PURSE</div>
                <div className="text-2xl font-heading font-black text-black mt-0.5">
                  £{myTeam.remainingBalance}M
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-black brutal-shadow p-5 text-center">
              <span className="text-xs font-black uppercase text-black/70 block mb-1">
                SPECTATOR / ADMIN PROTOCOL
              </span>
              <p className="text-[11px] text-black/80 font-bold">
                Logged in as Master Auctioneer. All franchise budgets are tracked live below.
              </p>
            </div>
          )}

          {/* Recent Hammer Sales Feed */}
          <div className="bg-white border-4 border-black brutal-shadow p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <span className="font-heading font-black text-xs uppercase text-black">
                RECENT HAMMER SALES
              </span>
              <span className="text-[10px] text-black/60 font-bold">
                {salesHistory.length} SOLD
              </span>
            </div>

            {salesHistory.length === 0 ? (
              <div className="p-4 bg-[#FFF8E7] border-2 border-black text-center text-[11px] text-black/60 font-bold">
                No lots hammered yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {salesHistory.slice(0, 6).map((sale) => (
                  <div
                    key={sale.id}
                    className="p-2.5 bg-[#FFFDF0] border-2 border-black flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <div className="font-heading font-black text-xs uppercase truncate text-black">
                        {sale.playerName}
                      </div>
                      <div className="text-[10px] text-black/70 truncate">
                        Sold to <strong>{sale.teamName}</strong>
                      </div>
                    </div>
                    <span className="bg-[#B6FF3B] px-2 py-0.5 border border-black font-black text-xs text-black flex-shrink-0">
                      £{sale.soldPrice}M
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRD Section 15: Global Purse Tracker Table underneath Live Stage */}
      <div className="bg-white border-4 border-black brutal-shadow overflow-x-auto font-mono text-xs">
        <div className="p-3 bg-black text-white font-heading font-black text-xs uppercase flex items-center justify-between">
          <span>FRANCHISE PURSE TRACKER TABLE (LIVE AUCTION AUDIT)</span>
          <span className="text-[#B6FF3B] text-[10px]">ALL 10 FRANCHISES SYNCED</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF8E7] border-b-2 border-black text-black font-black uppercase text-[10px]">
              <th className="p-2.5 border-r border-black">TEAM</th>
              <th className="p-2.5 border-r border-black text-right">STARTING</th>
              <th className="p-2.5 border-r border-black text-right">REMAINING PURSE</th>
              <th className="p-2.5 border-r border-black text-center">PLAYERS</th>
              <th className="p-2.5 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, idx) => (
              <tr
                key={t.id}
                className={`border-b border-black/10 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF0]'}`}
              >
                <td className="p-2.5 font-heading font-black uppercase border-r border-black/10 flex items-center gap-2">
                  <span
                    className="w-3 h-3 inline-block border border-black"
                    style={{ backgroundColor: t.color }}
                  />
                  <span>{t.teamName}</span>
                </td>
                <td className="p-2.5 text-right border-r border-black/10 text-black/70">
                  £{t.startingBalance}M
                </td>
                <td className="p-2.5 text-right border-r border-black/10 font-heading font-black text-sm text-black">
                  <span className="bg-[#B6FF3B] px-1.5 py-0.2 border border-black">
                    £{t.remainingBalance}M
                  </span>
                </td>
                <td className="p-2.5 text-center border-r border-black/10 font-bold">
                  {t.boughtPlayers.length} / {t.maxSquadSize}
                </td>
                <td className="p-2.5 text-center font-bold text-[10px] uppercase">
                  {t.qualificationStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
