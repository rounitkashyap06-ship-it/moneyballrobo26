import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import { FCCard } from './FCCard.tsx';
import { TeamLogo } from './TeamLogo.tsx';
import {
  Flame,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Gavel,
  Plus,
  Minus,
  CheckCircle,
  Zap,
  AlertTriangle,
} from 'lucide-react';

interface UserLiveAuctionViewProps {
  isParticipantOnly?: boolean;
}

export const UserLiveAuctionView: React.FC<UserLiveAuctionViewProps> = ({ isParticipantOnly = false }) => {
  const { state, currentUser, recordBid, setCallStage, sellPlayer, markUnsold, nextPlayer, prevPlayer } =
    useAuction();

  const isAdmin = currentUser?.role === 'admin' && !isParticipantOnly;
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

  // Active bidder team lookup
  const activeBidderTeam = teams.find((t) => t.id === liveBidding.currentBidderTeamId);

  // Selected bidder team for verbal entry or test simulation
  const [selectedBidderTeamId, setSelectedBidderTeamId] = useState<string>('');
  const [customBidAmount, setCustomBidAmount] = useState<number>(liveBidding.currentBid + 5);
  const [bidActionError, setBidActionError] = useState<string | null>(null);
  const [isBidding, setIsBidding] = useState(false);

  // Keep selectedBidderTeamId valid when teams array loads
  useEffect(() => {
    if (!selectedBidderTeamId && teams.length > 0) {
      setSelectedBidderTeamId(teams[0].id);
    }
  }, [teams, selectedBidderTeamId]);

  // Keep customBidAmount in sync with current highest bid
  useEffect(() => {
    setCustomBidAmount(liveBidding.currentBid + 5);
  }, [liveBidding.currentBid]);

  // Execute bid for a specific team
  const handlePlaceBid = async (amount: number, teamId: string) => {
    if (isBidding) return;
    setIsBidding(true);
    setBidActionError(null);
    const res = await recordBid(amount, teamId);
    setIsBidding(false);
    if (!res.success) {
      setBidActionError(res.error || 'Bid rejected');
    }
  };

  const handleAdjustBid = async (increment: number) => {
    const targetTeamId = selectedBidderTeamId || teams[0]?.id;
    if (!targetTeamId) return;

    // If no bids placed yet, opening bid can be at base price or base + increment
    let newBid: number;
    if (!liveBidding.currentBidderTeamId) {
      newBid = Math.max(currentPlayer?.basePrice || 10, (currentPlayer?.basePrice || 10) + (increment > 0 ? increment - 2.5 : 0));
    } else {
      newBid = Math.max(currentPlayer?.basePrice || 10, liveBidding.currentBid + increment);
    }

    await handlePlaceBid(newBid, targetTeamId);
  };

  const handleCustomBid = async () => {
    const targetTeamId = selectedBidderTeamId || teams[0]?.id;
    if (!targetTeamId || !customBidAmount) return;
    await handlePlaceBid(customBidAmount, targetTeamId);
  };

  const handleSellNow = async () => {
    if (!isAdmin || !currentPlayer) return;
    const winningTeamId = liveBidding.currentBidderTeamId || selectedBidderTeamId;
    if (!winningTeamId) {
      setBidActionError('Select a winning team first');
      return;
    }
    setBidActionError(null);
    const res = await sellPlayer(currentPlayer.id, winningTeamId, liveBidding.currentBid);
    if (!res.success) {
      setBidActionError(res.error || 'Sale failed');
    }
  };

  const handleUnsoldNow = async () => {
    if (!isAdmin || !currentPlayer) return;
    setBidActionError(null);
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
              <span className="text-[10px] text-black font-bold uppercase bg-[#FFF8E7] px-2 py-0.5 border border-black">
                LOT #{currentPlayer?.id || '—'}
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

            {/* Current Bidder Franchise Box - Fixed and fully active */}
            <div className="bg-black text-white p-5 border-4 border-black brutal-shadow space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/20">
                <span className="text-[10px] text-[#FFD600] font-black uppercase tracking-wider">
                  CURRENT BIDDER FRANCHISE
                </span>
                {liveBidding.currentBidderTeamId ? (
                  <span className="bg-[#00C853] text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 border border-white">
                    ● ACTIVE LEADER
                  </span>
                ) : (
                  <span className="bg-[#FFD600] text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 border border-white">
                    OPEN FOR BIDS
                  </span>
                )}
              </div>

              {activeBidderTeam ? (
                <div className="flex items-center gap-3 py-1">
                  <TeamLogo
                    logo={activeBidderTeam.logo}
                    name={activeBidderTeam.teamName}
                    size="lg"
                    className="w-12 h-12 object-contain bg-white p-1 border-2 border-white brutal-shadow-sm flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-heading font-black uppercase text-white truncate leading-none">
                      {activeBidderTeam.teamName}
                    </div>
                    <div className="text-xs text-[#FFD600] font-bold mt-1.5 flex items-center gap-2">
                      <span>PURSE: £{activeBidderTeam.remainingBalance}M</span>
                      <span className="text-white/40">·</span>
                      <span className="text-white/80">{activeBidderTeam.boughtPlayers.length} Signed</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-1">
                  <div className="text-2xl font-heading font-black uppercase text-white">
                    NO BID RECORDED YET
                  </div>
                  <div className="text-xs text-[#FFD600] font-bold">
                    Awaiting opening verbal offer at £{currentPlayer?.basePrice || 60}M base
                  </div>
                </div>
              )}

              <div className="text-[10px] text-white/60 font-mono font-bold pt-2 border-t border-white/10 flex items-center justify-between">
                <span>
                  {liveBidding.lastBidTimestamp
                    ? `Adjudicated at ${new Date(liveBidding.lastBidTimestamp).toLocaleTimeString()}`
                    : 'Awaiting opening verbal offer'}
                </span>
                {liveBidding.currentBidderTeamId && (
                  <span className="text-[#B6FF3B] font-black">£{liveBidding.currentBid}M COMMITTED</span>
                )}
              </div>
            </div>
          </div>

          {/* ==================== ADMIN VERBAL BIDDING CONTROL PANEL (PRD Section 13) ==================== */}
          {/* ONLY ADMIN / AUCTIONEER CAN EDIT BIDS, SELECT BIDDER, AND ADJUDICATE */}
          {isAdmin ? (
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
                      onClick={() => {
                        setSelectedBidderTeamId(t.id);
                        setBidActionError(null);
                      }}
                      className={`p-1.5 text-left text-[11px] font-bold border-2 border-black truncate transition-all cursor-pointer ${
                        selectedBidderTeamId === t.id
                          ? 'bg-black text-white brutal-shadow-sm'
                          : 'bg-[#FFF8E7] text-black hover:bg-black/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-heading font-black flex items-center gap-1.5">
                          <TeamLogo
                            logo={t.logo}
                            name={t.teamName}
                            size="xs"
                            className="w-3.5 h-3.5 object-contain flex-shrink-0"
                          />
                          <span className="truncate">{t.teamName}</span>
                        </span>
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
                  3. GAVEL CALLS & SOLD / UNSOLD:
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

                {/* Direct Options below Going Once and Going Twice */}
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
                    ✕ UNSOLD
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

              {bidActionError && (
                <div className="p-2 bg-red-100 border-2 border-red-600 text-red-700 font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{bidActionError}</span>
                </div>
              )}
            </div>
          ) : null}
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
                <TeamLogo
                  logo={myTeam.logo}
                  name={myTeam.teamName}
                  size="sm"
                  className="w-8 h-8 object-contain p-0.5 bg-white border-2 border-black flex-shrink-0"
                />
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

          {/* Confirmed Sales & Unsold Feed */}
          <div className="bg-white border-4 border-black brutal-shadow p-5 space-y-3">
            {(() => {
              const soldCount = salesHistory.filter((s) => !s.isUnsold && s.teamName !== 'UNSOLD').length;
              const unsoldCount = salesHistory.filter((s) => s.isUnsold || s.teamName === 'UNSOLD').length;
              return (
                <>
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <span className="font-heading font-black text-xs uppercase text-black">
                      AUCTION LOT ACTIVITY
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#FFF8E7] px-2 py-0.5 border border-black">
                      {soldCount} SOLD · {unsoldCount} UNSOLD
                    </span>
                  </div>

                  {salesHistory.length === 0 ? (
                    <div className="p-4 bg-[#FFF8E7] border-2 border-black text-center text-[11px] text-black/60 font-bold">
                      No lots hammered yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {salesHistory.slice(0, 8).map((sale) => {
                        const isUnsoldItem = sale.isUnsold || sale.teamName === 'UNSOLD';
                        return (
                          <div
                            key={sale.id}
                            className={`p-2.5 border-2 border-black flex items-center justify-between text-xs ${
                              isUnsoldItem ? 'bg-[#FFF0F2] border-l-4 border-l-[#FF1744]' : 'bg-[#FFFDF0]'
                            }`}
                          >
                            <div className="truncate mr-2">
                              <div className="font-heading font-black text-xs uppercase truncate text-black flex items-center gap-1.5">
                                <span>{sale.playerName}</span>
                                {isUnsoldItem && (
                                  <span className="bg-[#FF1744] text-white px-1 py-0.2 text-[8px] font-mono font-black uppercase">
                                    UNSOLD
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-black/70 truncate">
                                {isUnsoldItem
                                  ? `Passed reserve · Base £${sale.basePrice}M`
                                  : <>Sold to <strong>{sale.teamName}</strong></>}
                              </div>
                            </div>
                            {isUnsoldItem ? (
                              <span className="bg-[#FF1744] text-white px-2 py-0.5 border border-black font-black text-xs flex-shrink-0 uppercase">
                                UNSOLD
                              </span>
                            ) : (
                              <span className="bg-[#B6FF3B] text-black px-2 py-0.5 border border-black font-black text-xs flex-shrink-0">
                                £{sale.soldPrice}M
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
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
                  <TeamLogo
                    logo={t.logo}
                    name={t.teamName}
                    size="xs"
                    className="w-5 h-5 object-contain flex-shrink-0"
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
