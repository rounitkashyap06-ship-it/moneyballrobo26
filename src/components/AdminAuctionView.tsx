import React, { useState } from 'react';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Gavel,
  XCircle,
  RotateCcw,
  Users,
  Search,
  Download,
  Edit3,
  Settings,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Coins,
  Flame,
  ListFilter,
  X,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';
import { CyberButton } from './CyberButton.tsx';
import { UpcomingLotsSubpage } from './UpcomingLotsSubpage.tsx';
import { TeamLogo } from './TeamLogo.tsx';

export const AdminAuctionView: React.FC = () => {
  const {
    state,
    startAuction,
    pauseAuction,
    nextPlayer,
    prevPlayer,
    setPlayer,
    sellPlayer,
    markUnsold,
    editSale,
    resetAuction,
    updateConfig,
    recordBid,
    setCallStage,
  } = useAuction();

  const [activeTab, setActiveTab] = useState<'simulation' | 'upcoming_subpage' | 'sold_overview' | 'edit_sale' | 'setup'>('simulation');

  // Gavel Bid Recording State
  const [selectedBidderTeamId, setSelectedBidderTeamId] = useState<string>('');
  const [deskBidError, setDeskBidError] = useState<string | null>(null);

  // Sell Modal
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [soldPriceInput, setSoldPriceInput] = useState<string>('');
  const [sellError, setSellError] = useState<string | null>(null);

  // Edit Sale
  const [editPlayerId, setEditPlayerId] = useState<string>('');
  const [editTeamId, setEditTeamId] = useState<string>('');
  const [editPriceInput, setEditPriceInput] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Sold Overview Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterTeam, setSelectedFilterTeam] = useState('ALL');

  // Reset Modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // Setup tab state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerClub, setNewPlayerClub] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState<'FWD' | 'MID' | 'DEF' | 'GK'>('FWD');
  const [newPlayerBase, setNewPlayerBase] = useState('60');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');
  const [setupFeedback, setSetupFeedback] = useState<string | null>(null);

  const currentPlayer = state?.players.find((p) => p.id === state.currentPlayerId);
  const soldPlayers = state?.players.filter((p) => p.status === 'sold') || [];
  const upcomingPlayers = state?.players.filter((p) => p.status === 'upcoming') || [];

  const handleOpenSellModal = () => {
    soundEffects.playClick();
    if (!currentPlayer) return;
    setSellError(null);
    setSelectedTeamId(state?.teams[0]?.id || '');
    setSoldPriceInput(String(currentPlayer.basePrice));
    setShowSellModal(true);
  };

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlayer) return;
    const price = Number(soldPriceInput);
    if (isNaN(price)) {
      setSellError('Please provide a valid numeric sold price.');
      return;
    }

    const res = await sellPlayer(currentPlayer.id, selectedTeamId, price);
    if (!res.success) {
      setSellError(res.error || 'Failed to execute sale.');
    } else {
      setShowSellModal(false);
      setSellError(null);
    }
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;
    if (window.confirm(`Mark ${currentPlayer.name} as UNSOLD?`)) {
      await markUnsold(currentPlayer.id);
    }
  };

  const handleExecuteEditSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);
    const price = Number(editPriceInput);
    if (!editPlayerId || !editTeamId || isNaN(price)) {
      setEditError('Please select a player, winning team, and enter a valid price.');
      return;
    }

    const res = await editSale(editPlayerId, editTeamId, price);
    if (!res.success) {
      setEditError(res.error || 'Failed to update sale.');
    } else {
      setEditSuccess('Sale successfully updated! Balances recalculated and celebration broadcasted.');
      setTimeout(() => setEditSuccess(null), 4000);
    }
  };

  const handleSelectEditPlayer = (pId: string) => {
    setEditPlayerId(pId);
    const player = state?.players.find((p) => p.id === pId);
    if (player) {
      setEditTeamId(player.soldToTeamId || state?.teams[0]?.id || '');
      setEditPriceInput(String(player.soldPrice || player.basePrice));
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword.trim()) {
      setResetError('Enter admin passkey.');
      return;
    }

    setResetting(true);
    setResetError(null);
    const res = await resetAuction(resetPassword);
    setResetting(false);

    if (!res.success) {
      setResetError(res.error || 'Invalid credentials or failed to reset.');
    } else {
      setShowResetConfirm(false);
      setResetPassword('');
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !newPlayerClub.trim()) {
      setSetupFeedback('Player name and club are required.');
      return;
    }

    const fallbackPhotos = [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
    ];

    const randomPhoto = fallbackPhotos[Math.floor(Math.random() * fallbackPhotos.length)];

    const newPlayer = {
      id: `p-${Date.now().toString().slice(-4)}`,
      name: newPlayerName.trim(),
      position: newPlayerPos,
      nationality: 'International',
      currentClub: newPlayerClub.trim(),
      basePrice: Number(newPlayerBase) || 50,
      photo: newPlayerPhoto.trim() || randomPhoto,
      status: 'upcoming' as const,
      stats: {
        overall: Math.floor(Math.random() * 8) + 85,
        pace: Math.floor(Math.random() * 15) + 80,
        shooting: Math.floor(Math.random() * 20) + 75,
        passing: Math.floor(Math.random() * 15) + 78,
        dribbling: Math.floor(Math.random() * 15) + 80,
        defending: Math.floor(Math.random() * 30) + 60,
        physical: Math.floor(Math.random() * 20) + 75,
      },
    };

    try {
      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      });
      if (res.ok) {
        setSetupFeedback(`Added ${newPlayer.name} to the auction roster!`);
        setNewPlayerName('');
        setNewPlayerClub('');
        setNewPlayerPhoto('');
        setTimeout(() => setSetupFeedback(null), 3500);
      } else {
        setSetupFeedback('Failed to add player.');
      }
    } catch {
      setSetupFeedback('Failed to add player.');
    }
  };

  const filteredSoldPlayers = soldPlayers.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.currentClub.toLowerCase().includes(searchTerm.toLowerCase());
    const winningTeam = state?.teams.find((t) => t.id === p.soldToTeamId);
    const matchTeam = selectedFilterTeam === 'ALL' || winningTeam?.teamName === selectedFilterTeam;
    return matchSearch && matchTeam;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Admin Navigation Hub Strip */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-white border-4 border-black brutal-shadow p-3 sm:px-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('simulation');
            }}
            className={`px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-[#FFD600] text-black brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-black hover:bg-[#FFF8E7]'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>SIMULATION DESK</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('upcoming_subpage');
            }}
            className={`px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'upcoming_subpage'
                ? 'bg-[#FFD600] text-black brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-black hover:bg-[#FFF8E7]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>UPCOMING LOTS ({upcomingPlayers.length})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('sold_overview');
            }}
            className={`px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sold_overview'
                ? 'bg-[#FFD600] text-black brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-black hover:bg-[#FFF8E7]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>SOLD LEDGER ({soldPlayers.length})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('edit_sale');
            }}
            className={`px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'edit_sale'
                ? 'bg-[#FFD600] text-black brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-black hover:bg-[#FFF8E7]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT SALE</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('setup');
            }}
            className={`px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'setup'
                ? 'bg-[#FFD600] text-black brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-black hover:bg-[#FFF8E7]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>SETUP & ROSTER</span>
          </button>
        </div>

        {/* Reset Action */}
        <CyberButton
          title="RESET AUCTION"
          onClick={() => {
            soundEffects.playClick();
            setShowResetConfirm(true);
          }}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          variant="danger"
          size="sm"
        />
      </div>

      {/* If Upcoming Lots Subpage is selected */}
      {activeTab === 'upcoming_subpage' && (
        <UpcomingLotsSubpage onBackToLive={() => setActiveTab('simulation')} />
      )}

      {/* ==================== TAB 1: MAIN AUCTION SIMULATION ==================== */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ==================== 1. LEFT SIDE: ALL TEAMS SIMULTANEOUSLY (4 Cols) ==================== */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-black inline-block"></span>
                  <h3 className="text-sm font-heading text-black uppercase tracking-tight">
                    ALL FRANCHISE VAULTS
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-black font-black bg-[#FFD600] px-1.5 py-0.2 border border-black">
                  {state?.teams.length} TEAMS
                </span>
              </div>

              {/* Stacked Simultaneous Team Cards */}
              <div className="space-y-3.5 max-h-[820px] overflow-y-auto pr-1">
                {state?.teams.map((team) => {
                  const used = team.startingBalance - team.remainingBalance;
                  const usedPct = (used / team.startingBalance) * 100;

                  return (
                    <div
                      key={team.id}
                      className="bg-white border-3 border-black brutal-shadow p-3.5"
                      style={{ borderLeftWidth: '6px', borderLeftColor: team.color }}
                    >
                      {/* Team Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 border border-black bg-white flex items-center justify-center p-1 brutal-shadow-sm flex-shrink-0">
                            <TeamLogo logo={team.logo} name={team.teamName} size="custom" className="w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-heading text-black uppercase leading-tight truncate">
                              {team.teamName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-xs font-black text-black bg-[#FFF8E7] px-1.5 py-0.5 border border-black">
                            ${team.remainingBalance.toFixed(1)}M
                          </div>
                          <div className="text-[9px] text-black/60 font-black mt-0.5">PURSE</div>
                        </div>
                      </div>

                      {/* Mini Budget Bar */}
                      <div className="w-full h-2 bg-[#FFF8E7] border border-black overflow-hidden mb-2">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${100 - usedPct}%`,
                            backgroundColor: team.color,
                          }}
                        />
                      </div>

                      {/* Bought Players Roster for this Team */}
                      <div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-black font-black mb-1 flex items-center justify-between">
                          <span>BOUGHT ROSTER ({team.boughtPlayers.length})</span>
                          <span>SPENT: ${used.toFixed(1)}M</span>
                        </div>

                        {team.boughtPlayers.length === 0 ? (
                          <div className="text-[10px] text-black/60 font-mono py-1 px-2 bg-[#FFF8E7] border border-dashed border-black text-center font-bold">
                            NO SIGNINGS YET
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                            {team.boughtPlayers.map((bp) => (
                              <div
                                key={bp.playerId}
                                className="flex items-center justify-between px-2 py-0.5 bg-[#FFF8E7] border border-black text-[11px] font-mono"
                              >
                                <span className="font-bold text-black truncate max-w-[150px]">
                                  {bp.playerName} ({bp.position})
                                </span>
                                <span className="font-black text-black bg-[#FFD600] px-1">
                                  ${bp.price.toFixed(1)}M
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ==================== 2. CENTER: PLAYER NAME, PHOTO IN BETWEEN + MASTER CONTROLS (4 Cols) ==================== */}
            <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-center">
              {currentPlayer ? (
                <div className="w-full bg-white border-4 border-black brutal-shadow-lg p-5 sm:p-6 flex flex-col items-center text-center">
                  {/* Live Badge & Quick Picker */}
                  <div className="w-full flex items-center justify-between mb-3">
                    <span className="bg-[#FF5CA8] text-black px-2.5 py-0.5 font-mono text-xs font-black uppercase border-2 border-black flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-black" />
                      <span>ON GAVEL</span>
                    </span>

                    {/* Quick Lot Selector Dropdown */}
                    <select
                      value={state?.currentPlayerId || ''}
                      onChange={(e) => setPlayer(e.target.value)}
                      className="bg-[#FFF8E7] border-2 border-black text-xs text-black font-mono font-bold px-2 py-1 max-w-[150px] truncate focus:outline-none"
                    >
                      <option value="" disabled>SELECT LOT...</option>
                      {state?.players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.basePrice}M) - [{p.status.toUpperCase()}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Big Player Name at top of Center */}
                  <h2 className="text-2xl sm:text-3xl xl:text-4xl font-heading text-black uppercase tracking-tight mb-2 leading-none">
                    {currentPlayer.name}
                  </h2>

                  {/* Player Photo Centerpiece */}
                  <div className="relative my-2 w-full max-w-[280px] sm:max-w-[320px] flex justify-center">
                    {currentPlayer.photo.includes('card') || currentPlayer.photo.includes('mbappe') ? (
                      <div className="w-full flex justify-center py-1">
                        <img
                          src={currentPlayer.photo}
                          alt={currentPlayer.name}
                          className="w-full h-auto max-h-[360px] object-contain drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:scale-[1.02] transition-transform duration-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 sm:h-72 border-4 border-black bg-white brutal-shadow overflow-hidden relative">
                        <img
                          src={currentPlayer.photo}
                          alt={currentPlayer.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
                          }}
                        />

                        {/* Position Tag */}
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white font-mono font-black text-xs border border-white">
                          {currentPlayer.position}
                        </span>

                        {/* Overall Rating */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#FFD600] text-black font-heading font-black text-xs border-2 border-black brutal-shadow-sm">
                          OVR {currentPlayer.stats.overall}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Club & Base in between underneath photo */}
                  <div className="bg-[#FFFDF0] border-2 border-black p-2.5 my-2 w-full brutal-shadow-sm font-mono">
                    <div className="text-sm font-heading text-black uppercase">
                      {currentPlayer.currentClub} · {currentPlayer.nationality}
                    </div>
                    <div className="text-xs text-black font-bold mt-0.5">
                      BASE: <strong className="bg-[#FFD600] px-1.5 py-0.2 border border-black">${currentPlayer.basePrice.toFixed(1)}M</strong>
                    </div>
                  </div>

                  {/* Clean Lot Navigation Toolbar */}
                  <div className="w-full flex items-center justify-between pt-3 border-t-2 border-black mt-2 font-mono">
                    <button
                      onClick={prevPlayer}
                      className="px-3.5 py-2 bg-white hover:bg-[#FFD600] border-2 border-black font-black text-xs uppercase brutal-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Previous Lot"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>PREV LOT</span>
                    </button>

                    <button
                      onClick={nextPlayer}
                      className="px-3.5 py-2 bg-white hover:bg-[#FFD600] border-2 border-black font-black text-xs uppercase brutal-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Next Lot"
                    >
                      <span>NEXT LOT</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-4 border-black brutal-shadow-lg p-8 text-center text-xs text-black font-mono font-bold w-full">
                  NO ACTIVE LOT SELECTED.
                </div>
              )}
            </div>

            {/* ==================== 3. RIGHT SIDE: REST OF PLAYER STATS & AUCTION METRICS (4 Cols) ==================== */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-5">
              {/* Live Bid & Current Bidder Gavel Desk */}
              {(() => {
                const liveBidding = state?.liveBidding || {
                  currentBid: currentPlayer?.basePrice || 60,
                  currentBidderTeamId: null,
                  currentBidderTeamName: null,
                  callStage: 'NORMAL',
                  lastBidTimestamp: null,
                };
                const bidderTeam = state?.teams.find((t) => t.id === liveBidding.currentBidderTeamId);
                const activeTeamId = selectedBidderTeamId || state?.teams[0]?.id || '';

                const handleQuickBid = async (inc: number) => {
                  if (!activeTeamId) return;
                  const newBid = Math.max(currentPlayer?.basePrice || 10, liveBidding.currentBid + inc);
                  setDeskBidError(null);
                  const res = await recordBid(newBid, activeTeamId);
                  if (!res.success) {
                    setDeskBidError(res.error || 'Bid rejected');
                  }
                };

                return (
                  <div className="bg-white border-4 border-black brutal-shadow-lg p-5 space-y-4 font-mono">
                    <div className="flex items-center justify-between border-b-2 border-black pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-black bg-[#B6FF3B] px-2 py-0.5 border border-black">
                        LIVE GAVEL & BIDDER DESK
                      </span>
                      <span className="text-xs font-bold bg-black text-white px-2 py-0.5">
                        STAGE: {liveBidding.callStage}
                      </span>
                    </div>

                    {/* Current Bid Display */}
                    <div className="bg-[#FFF8E7] border-3 border-black p-3.5 brutal-shadow-sm text-center">
                      <div className="text-[10px] text-black/70 font-black uppercase">CURRENT HIGHEST BID</div>
                      <div className="text-3xl font-heading font-black text-black mt-0.5">
                        £{liveBidding.currentBid}M
                      </div>
                      <div className="text-[11px] text-black/80 font-bold mt-1">
                        OPENING BASE: £{currentPlayer?.basePrice || 60}M
                      </div>
                    </div>

                    {/* Current Bidder Box */}
                    <div className="bg-black text-white p-4 border-3 border-black brutal-shadow-sm">
                      <div className="text-[10px] text-[#FFD600] font-black uppercase tracking-wider flex items-center justify-between">
                        <span>CURRENT BIDDER FRANCHISE</span>
                        {liveBidding.currentBidderTeamId && (
                          <span className="text-[#00C853] text-[9px] font-black">● ACTIVE</span>
                        )}
                      </div>
                      {bidderTeam ? (
                        <div className="flex items-center gap-2.5 mt-2">
                          <TeamLogo
                            logo={bidderTeam.logo}
                            name={bidderTeam.teamName}
                            size="sm"
                            className="w-6 h-6 object-contain flex-shrink-0"
                          />
                          <div className="font-heading font-black text-lg uppercase text-white truncate">
                            {bidderTeam.teamName}
                          </div>
                        </div>
                      ) : (
                        <div className="font-heading font-black text-sm uppercase text-white/80 mt-1.5">
                          NO BID RECORDED YET
                        </div>
                      )}
                      <div className="text-[10px] text-white/60 font-bold mt-1">
                        {liveBidding.lastBidTimestamp
                          ? `Recorded at ${new Date(liveBidding.lastBidTimestamp).toLocaleTimeString()}`
                          : 'Awaiting opening verbal offer'}
                      </div>
                    </div>

                    {/* Bidding Franchise Selection & Quick Adjust */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-black/70 mb-1">
                        BID AS FRANCHISE:
                      </label>
                      <select
                        value={selectedBidderTeamId || activeTeamId}
                        onChange={(e) => {
                          setSelectedBidderTeamId(e.target.value);
                          setDeskBidError(null);
                        }}
                        className="w-full p-2 bg-[#FFF8E7] border-2 border-black text-xs font-bold font-mono mb-2"
                      >
                        {state?.teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.teamName} (Purse: £{t.remainingBalance}M)
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleQuickBid(2.5)}
                          className="py-2 bg-[#B6FF3B] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                        >
                          +£2.5M
                        </button>
                        <button
                          onClick={() => handleQuickBid(5)}
                          className="py-2 bg-[#FFD600] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                        >
                          +£5M
                        </button>
                        <button
                          onClick={() => handleQuickBid(-5)}
                          className="py-2 bg-[#FFF8E7] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                        >
                          -£5M
                        </button>
                      </div>
                    </div>

                    {/* Gavel Warnings */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/20">
                      <button
                        onClick={() => setCallStage('GOING_ONCE')}
                        className="py-2 bg-[#FFD600] hover:bg-black hover:text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                      >
                        GOING ONCE
                      </button>
                      <button
                        onClick={() => setCallStage('GOING_TWICE')}
                        className="py-2 bg-[#FF6D00] hover:bg-black text-white border-2 border-black font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors"
                      >
                        GOING TWICE
                      </button>
                    </div>

                    {/* Sold & Unsold Options directly below Going Once and Going Twice */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={async () => {
                          if (!currentPlayer) return;
                          const winningTeamId = liveBidding.currentBidderTeamId || selectedBidderTeamId || activeTeamId;
                          if (!winningTeamId) {
                            setDeskBidError('Select a winning franchise first');
                            return;
                          }
                          setDeskBidError(null);
                          const res = await sellPlayer(currentPlayer.id, winningTeamId, liveBidding.currentBid);
                          if (!res.success) {
                            setDeskBidError(res.error || 'Sale failed');
                          }
                        }}
                        className="py-2.5 bg-[#00C853] hover:bg-black text-white border-2 border-black font-heading font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>🔨</span>
                        <span>SOLD!</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (!currentPlayer) return;
                          setDeskBidError(null);
                          const res = await markUnsold(currentPlayer.id);
                          if (!res.success) {
                            setDeskBidError(res.error || 'Could not mark unsold');
                          }
                        }}
                        className="py-2.5 bg-[#FF1744] hover:bg-black text-white border-2 border-black font-heading font-black text-xs uppercase brutal-shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>✕</span>
                        <span>UNSOLD</span>
                      </button>
                    </div>

                    {deskBidError && (
                      <div className="p-2 bg-red-100 border-2 border-red-600 text-red-700 font-bold text-xs">
                        {deskBidError}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Auction Gross Metrics */}
              <div className="bg-white border-4 border-black brutal-shadow-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <span className="text-xs font-mono font-black text-black uppercase flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>AUCTION GROSS TOTALS</span>
                  </span>
                  <a
                    href="/api/export-csv"
                    download="moneyball-results.csv"
                    className="text-xs font-mono text-black bg-[#FFD600] px-2 py-0.5 border border-black hover:bg-black hover:text-white flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono">
                  <div className="bg-[#FFF8E7] p-2.5 border-2 border-black">
                    <span className="text-[10px] text-black font-bold uppercase">TOTAL LOTS</span>
                    <div className="text-xl font-heading text-black mt-0.5">
                      {state?.players.length}
                    </div>
                  </div>

                  <div className="bg-[#B6FF3B] p-2.5 border-2 border-black">
                    <span className="text-[10px] text-black font-bold uppercase">HAMMERED</span>
                    <div className="text-xl font-heading text-black mt-0.5">
                      {soldPlayers.length}
                    </div>
                  </div>

                  <div className="bg-[#FFD600] p-2.5 border-2 border-black">
                    <span className="text-[10px] text-black font-bold uppercase">COMMITTED $</span>
                    <div className="text-xl font-heading text-black mt-0.5">
                      ${soldPlayers.reduce((acc, p) => acc + (p.soldPrice || 0), 0).toFixed(1)}M
                    </div>
                  </div>

                  <div className="bg-[#FF5CA8] p-2.5 border-2 border-black">
                    <span className="text-[10px] text-black font-bold uppercase">UNSOLD LOTS</span>
                    <div className="text-xl font-heading text-black mt-0.5">
                      {state?.players.filter((p) => p.status === 'unsold').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: SOLD PLAYERS OVERVIEW ==================== */}
      {activeTab === 'sold_overview' && (
        <div className="bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-black pb-4">
            <div>
              <h2 className="text-2xl font-heading text-black uppercase">
                SOLD PLAYERS AUDIT & TRANSACTION LEDGER
              </h2>
              <p className="text-xs text-black/80 mt-1 font-mono font-bold">
                Official records of all hammer drops. Filter by franchise, search by name, or export.
              </p>
            </div>

            <CyberButton
              title="EXPORT CSV"
              onClick={() => {
                window.location.href = '/api/export-csv';
              }}
              leftIcon={<Download className="w-4 h-4" />}
              variant="primary"
              size="sm"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH PLAYER OR CLUB..."
                className="w-full pl-10 pr-4 py-2 bg-[#FFF8E7] border-2 border-black text-xs text-black font-mono font-bold placeholder-black/50 focus:outline-none focus:bg-white"
              />
            </div>

            <select
              value={selectedFilterTeam}
              onChange={(e) => setSelectedFilterTeam(e.target.value)}
              className="w-full sm:w-60 px-3 py-2 bg-[#FFF8E7] border-2 border-black text-xs text-black font-mono font-bold focus:outline-none"
            >
              <option value="ALL">ALL WINNING TEAMS</option>
              {state?.teams.map((t) => (
                <option key={t.id} value={t.teamName}>
                  {t.teamName}
                </option>
              ))}
            </select>
          </div>

          {/* Ledger Table */}
          {filteredSoldPlayers.length === 0 ? (
            <div className="text-center py-12 font-mono text-xs text-black font-bold bg-[#FFF8E7] border-2 border-dashed border-black p-6">
              NO COMPLETED SALES FOUND.
            </div>
          ) : (
            <div className="overflow-x-auto border-3 border-black">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-black text-white text-[11px] uppercase">
                  <tr>
                    <th className="p-3 border-b-2 border-black">LOT #</th>
                    <th className="p-3 border-b-2 border-black">PLAYER</th>
                    <th className="p-3 border-b-2 border-black">POSITION</th>
                    <th className="p-3 border-b-2 border-black">WINNING FRANCHISE</th>
                    <th className="p-3 border-b-2 border-black text-right">BASE PRICE</th>
                    <th className="p-3 border-b-2 border-black text-right">HAMMER PRICE</th>
                    <th className="p-3 border-b-2 border-black text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black bg-white">
                  {filteredSoldPlayers.map((player) => {
                    const team = state?.teams.find((t) => t.id === player.soldToTeamId);
                    return (
                      <tr key={player.id} className="hover:bg-[#FFF8E7]">
                        <td className="p-3 font-bold">{player.id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="w-7 h-7 object-cover border border-black"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                            <span className="font-bold">{player.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold">{player.position}</td>
                        <td className="p-3">
                          <span className="bg-[#FFF8E7] px-2 py-0.5 border border-black font-bold">
                            {team ? team.teamName : 'Unknown'}
                          </span>
                        </td>
                        <td className="p-3 text-right">${player.basePrice}M</td>
                        <td className="p-3 text-right font-black bg-[#FFD600]">
                          ${player.soldPrice?.toFixed(1)}M
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              handleSelectEditPlayer(player.id);
                              setActiveTab('edit_sale');
                            }}
                            className="px-2 py-0.5 bg-black text-white hover:bg-[#3D5AFE] font-bold text-[10px] cursor-pointer"
                          >
                            EDIT
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: EDIT SALE ==================== */}
      {activeTab === 'edit_sale' && (
        <div className="bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-2xl font-heading text-black uppercase">
              EDIT OFFICIAL HAMMER PRICE
            </h2>
            <p className="text-xs text-black/80 mt-1 font-mono font-bold">
              Correct a sale entry, adjust winning franchise, and recalculate balances in real time.
            </p>
          </div>

          {editSuccess && (
            <div className="p-3 bg-[#B6FF3B] border-2 border-black font-mono text-xs font-bold">
              ✓ {editSuccess}
            </div>
          )}
          {editError && (
            <div className="p-3 bg-[#FF5CA8] border-2 border-black font-mono text-xs font-bold">
              ⚠ {editError}
            </div>
          )}

          <form onSubmit={handleExecuteEditSale} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Select Sold Player
              </label>
              <select
                value={editPlayerId}
                onChange={(e) => handleSelectEditPlayer(e.target.value)}
                className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                required
              >
                <option value="">-- Choose a sold player --</option>
                {soldPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Sold for ${p.soldPrice}M to {state?.teams.find((t) => t.id === p.soldToTeamId)?.teamName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Winning Franchise
              </label>
              <select
                value={editTeamId}
                onChange={(e) => setEditTeamId(e.target.value)}
                className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                required
              >
                <option value="">-- Select franchise --</option>
                {state?.teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamName} (Remaining Purse: ${t.remainingBalance.toFixed(1)}M)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Updated Sold Price ($M)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={editPriceInput}
                onChange={(e) => setEditPriceInput(e.target.value)}
                className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-base text-black font-bold focus:outline-none"
                required
              />
            </div>

            <div className="pt-2">
              <CyberButton
                type="submit"
                title="RECALCULATE & UPDATE SALE"
                leftIcon={<Edit3 className="w-4 h-4" />}
                variant="primary"
                size="md"
                fullWidth
              />
            </div>
          </form>
        </div>
      )}

      {/* ==================== TAB 4: SETUP & ROSTER ==================== */}
      {activeTab === 'setup' && (
        <div className="bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-2xl font-heading text-black uppercase">
              ADD NEW PLAYER LOT
            </h2>
            <p className="text-xs text-black/80 mt-1 font-mono font-bold">
              Add custom players to the upcoming lots queue during live testing.
            </p>
          </div>

          {setupFeedback && (
            <div className="p-3 bg-[#B6FF3B] border-2 border-black font-mono text-xs font-bold">
              ✓ {setupFeedback}
            </div>
          )}

          <form onSubmit={handleCreatePlayer} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Player Full Name
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="e.g. Bukayo Saka"
                className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Current Club
              </label>
              <input
                type="text"
                value={newPlayerClub}
                onChange={(e) => setNewPlayerClub(e.target.value)}
                placeholder="e.g. Arsenal"
                className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Position
                </label>
                <select
                  value={newPlayerPos}
                  onChange={(e) => setNewPlayerPos(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                >
                  <option value="FWD">FWD - Forward</option>
                  <option value="MID">MID - Midfielder</option>
                  <option value="DEF">DEF - Defender</option>
                  <option value="GK">GK - Goalkeeper</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Base Price ($M)
                </label>
                <input
                  type="number"
                  value={newPlayerBase}
                  onChange={(e) => setNewPlayerBase(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={newPlayerPhoto}
                onChange={(e) => setNewPlayerPhoto(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <CyberButton
                type="submit"
                title="ADD TO QUEUE"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                variant="lime"
                size="md"
                fullWidth
              />
            </div>
          </form>
        </div>
      )}

      {/* ==================== SELL MODAL ==================== */}
      {showSellModal && currentPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl font-mono">
            <button
              onClick={() => setShowSellModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black text-black font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
              <div className="w-10 h-10 bg-[#FFD600] border-2 border-black flex items-center justify-center font-bold">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-heading text-black uppercase">DROP GAVEL</h3>
                <span className="text-xs text-black/70 font-bold">CONFIRM HAMMER DROP</span>
              </div>
            </div>

            {sellError && (
              <div className="mb-4 p-3 bg-[#FF5CA8] border-2 border-black text-xs font-bold">
                ⚠ {sellError}
              </div>
            )}

            <form onSubmit={handleConfirmSale} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Winning Franchise
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                  required
                >
                  {state?.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName} (Purse: ${t.remainingBalance.toFixed(1)}M)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Final Hammer Price ($M)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={currentPlayer.basePrice}
                  value={soldPriceInput}
                  onChange={(e) => setSoldPriceInput(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-base text-black font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2">
                <CyberButton
                  type="submit"
                  title="CONFIRM HAMMER DROP"
                  leftIcon={<Gavel className="w-4 h-4" />}
                  variant="lime"
                  size="lg"
                  fullWidth
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== RESET MODAL ==================== */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl font-mono">
            <button
              onClick={() => {
                setShowResetConfirm(false);
                setResetError(null);
              }}
              className="absolute top-4 right-4 p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black text-black font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
              <div className="w-10 h-10 bg-[#FF5CA8] border-2 border-black flex items-center justify-center text-black font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-heading text-black uppercase">RESET AUCTION?</h3>
                <span className="text-xs text-[#FF5CA8] bg-black px-1.5 py-0.2 font-black uppercase">FULL SYSTEM WIPE</span>
              </div>
            </div>

            <p className="text-xs text-black/80 font-bold mb-4">
              All sales will be cleared, every team wallet restored to $250.0M, and all connected screens returned to pre-auction.
            </p>

            {resetError && (
              <div className="mb-4 p-3 bg-[#FF5CA8] border-2 border-black text-xs font-bold">
                ⚠ {resetError}
              </div>
            )}

            <form onSubmit={handleExecuteReset} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Admin Passkey Confirmation
                </label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter 'admin123' or 'moneyball2026'"
                  className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 p-2.5 bg-white hover:bg-[#FFF8E7] border-2 border-black font-bold text-xs uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 p-2.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
                >
                  {resetting ? 'RESETTING...' : 'CONFIRM RESET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
