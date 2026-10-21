import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import { FCCard } from './FCCard.tsx';
import type { Player, TransferOffer, Team } from '../types/auction.ts';
import {
  ArrowRightLeft,
  Trophy,
  Send,
  Check,
  X,
  Clock,
  Shield,
  Search,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const TransferMarketView: React.FC = () => {
  const {
    state,
    currentUser,
    sendTransferOffer,
    counterTransferOffer,
    acceptTransferOffer,
    rejectTransferOffer,
    withdrawTransferOffer,
    setGlobalState,
  } = useAuction();

  const isAdmin = currentUser?.role === 'admin';
  const myTeam = state?.teams.find((t) => t.id === currentUser?.teamId);
  const isBuyer = myTeam?.qualificationStatus === 'TOP_4' || isAdmin;
  const isSeller = myTeam?.qualificationStatus === 'BOTTOM_6' || isAdmin;

  const isMarketLive = state?.globalState === 'TRANSFER_MARKET_LIVE';

  const [activeTab, setActiveTab] = useState<'browse' | 'inbox' | 'my_offers' | 'negotiator_award'>(
    myTeam?.qualificationStatus === 'BOTTOM_6' ? 'inbox' : 'browse'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedSellerTeam, setSelectedSellerTeam] = useState('all');

  // Offer submission modal state
  const [selectedPlayerForOffer, setSelectedPlayerForOffer] = useState<Player | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(30);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Counter offer modal state
  const [selectedOfferForCounter, setSelectedOfferForCounter] = useState<TransferOffer | null>(null);
  const [counterAmount, setCounterAmount] = useState<number>(35);

  // Confirm Deal Modal state
  const [confirmDealOffer, setConfirmDealOffer] = useState<TransferOffer | null>(null);

  const players = state?.players || [];
  const teams = state?.teams || [];
  const transferOffers = state?.transferOffers || [];

  // Bottom 6 teams
  const bottom6Teams = useMemo(
    () => teams.filter((t) => t.qualificationStatus === 'BOTTOM_6'),
    [teams]
  );

  // Eligible transfer players: owned by Bottom 6 teams
  const eligiblePlayers = useMemo(() => {
    const bottom6Ids = bottom6Teams.map((t) => t.id);
    return players.filter(
      (p) =>
        (p.status === 'transfer_available' || p.status === 'sold') &&
        p.soldToTeamId &&
        bottom6Ids.includes(p.soldToTeamId)
    );
  }, [players, bottom6Teams]);

  // Filtered browse players
  const filteredPlayers = useMemo(() => {
    return eligiblePlayers.filter((p) => {
      if (selectedPosition !== 'all' && p.positionCategory !== selectedPosition) return false;
      if (selectedSellerTeam !== 'all' && p.soldToTeamId !== selectedSellerTeam) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.currentClub.toLowerCase().includes(q) ||
          p.soldToTeamName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [eligiblePlayers, selectedPosition, selectedSellerTeam, searchQuery]);

  // Seller Inbox: offers for my players (or all if admin)
  const receivedOffers = useMemo(() => {
    if (isAdmin) return transferOffers;
    if (!myTeam) return [];
    return transferOffers.filter((o) => o.sellerTeamId === myTeam.id);
  }, [transferOffers, myTeam, isAdmin]);

  // Buyer Outgoing Offers: offers I placed
  const myOutgoingOffers = useMemo(() => {
    if (isAdmin) return transferOffers;
    if (!myTeam) return [];
    return transferOffers.filter((o) => o.buyerTeamId === myTeam.id);
  }, [transferOffers, myTeam, isAdmin]);

  // Best Negotiator Tracker (Rank Bottom 6 by current purse)
  const bestNegotiators = useMemo(() => {
    return [...bottom6Teams].sort((a, b) => b.remainingBalance - a.remainingBalance);
  }, [bottom6Teams]);

  // Handlers
  const handleOpenOfferModal = (player: Player) => {
    setSelectedPlayerForOffer(player);
    setOfferAmount(player.soldPrice || player.basePrice);
    setOfferError(null);
  };

  const handleSubmitOffer = async () => {
    if (!selectedPlayerForOffer) return;
    setIsSubmitting(true);
    setOfferError(null);

    const res = await sendTransferOffer(selectedPlayerForOffer.id, offerAmount);
    setIsSubmitting(false);

    if (res.success) {
      setSelectedPlayerForOffer(null);
      setActiveTab('my_offers');
    } else {
      setOfferError(res.error || 'Failed to submit transfer offer');
    }
  };

  const handleOpenCounterModal = (offer: TransferOffer) => {
    setSelectedOfferForCounter(offer);
    setCounterAmount(offer.currentAmount + 5);
  };

  const handleSubmitCounter = async () => {
    if (!selectedOfferForCounter) return;
    await counterTransferOffer(selectedOfferForCounter.id, counterAmount);
    setSelectedOfferForCounter(null);
  };

  const handleConfirmDeal = async () => {
    if (!confirmDealOffer) return;
    await acceptTransferOffer(confirmDealOffer.id);
    setConfirmDealOffer(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-4 border-black brutal-shadow-lg p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 border-2 border-black font-mono font-black text-xs uppercase ${
                isMarketLive ? 'bg-[#00E5FF] text-black animate-pulse' : 'bg-[#FF5CA8] text-black'
              }`}
            >
              {isMarketLive ? 'TRANSFER MARKET LIVE' : 'TRANSFER MARKET CLOSED'}
            </span>
            <span className="font-mono text-xs text-black/70 font-bold uppercase">
              TOP 4 BUYERS · BOTTOM 6 SELLERS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black uppercase tracking-tight">
            POST-LEAGUE TRANSFER MARKET
          </h1>
          <p className="text-xs sm:text-sm text-black/80 font-mono mt-1">
            Private monetary negotiations, bilateral counter-offers, and Best Negotiator purse competition.
          </p>
        </div>

        {/* Admin Market Switcher */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            {isMarketLive ? (
              <button
                onClick={() => setGlobalState('TRANSFER_MARKET_CLOSED')}
                className="px-4 py-2 bg-[#FF1744] hover:bg-black text-white font-mono text-xs font-black uppercase border-3 border-black brutal-shadow-sm cursor-pointer transition-colors"
              >
                CLOSE TRANSFER MARKET
              </button>
            ) : (
              <button
                onClick={() => setGlobalState('TRANSFER_MARKET_LIVE')}
                className="px-4 py-2 bg-[#00E5FF] hover:bg-black hover:text-white text-black font-mono text-xs font-black uppercase border-3 border-black brutal-shadow-sm cursor-pointer transition-colors"
              >
                OPEN TRANSFER MARKET
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-4 border-black brutal-shadow p-2 flex flex-wrap items-center gap-2 font-mono text-xs font-black">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 border-2 border-black uppercase transition-all cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-black text-white brutal-shadow-sm'
              : 'bg-[#FFF8E7] text-black hover:bg-black/10'
          }`}
        >
          BROWSE PLAYERS ({eligiblePlayers.length})
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 border-2 border-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'inbox'
              ? 'bg-black text-white brutal-shadow-sm'
              : 'bg-[#FFF8E7] text-black hover:bg-black/10'
          }`}
        >
          <span>OFFER INBOX</span>
          {receivedOffers.filter((o) => o.status === 'PENDING').length > 0 && (
            <span className="bg-[#FF1744] text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {receivedOffers.filter((o) => o.status === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my_offers')}
          className={`px-4 py-2 border-2 border-black uppercase transition-all cursor-pointer ${
            activeTab === 'my_offers'
              ? 'bg-black text-white brutal-shadow-sm'
              : 'bg-[#FFF8E7] text-black hover:bg-black/10'
          }`}
        >
          MY OUTGOING OFFERS ({myOutgoingOffers.length})
        </button>

        <button
          onClick={() => setActiveTab('negotiator_award')}
          className={`px-4 py-2 border-2 border-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'negotiator_award'
              ? 'bg-[#FFD600] text-black brutal-shadow-sm'
              : 'bg-[#FFF8E7] text-black hover:bg-black/10'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-black" />
          <span>BEST NEGOTIATOR AWARD</span>
        </button>
      </div>

      {/* TAB 1: BROWSE PLAYERS */}
      {activeTab === 'browse' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-white border-4 border-black brutal-shadow p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player or owning franchise..."
                className="w-full pl-9 pr-3 py-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-black/70">POSITION:</span>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="flex-1 py-2 px-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none"
              >
                <option value="all">ALL POSITIONS</option>
                <option value="FORWARD">FORWARDS</option>
                <option value="MIDFIELDER">MIDFIELDERS</option>
                <option value="DEFENDER">DEFENDERS</option>
                <option value="GOALKEEPER">GOALKEEPERS</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-black/70">OWNING TEAM:</span>
              <select
                value={selectedSellerTeam}
                onChange={(e) => setSelectedSellerTeam(e.target.value)}
                className="flex-1 py-2 px-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none"
              >
                <option value="all">ALL BOTTOM 6 TEAMS</option>
                {bottom6Teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Player Cards Grid */}
          {filteredPlayers.length === 0 ? (
            <div className="bg-white border-4 border-black brutal-shadow p-12 text-center font-mono">
              <p className="text-sm font-bold text-black/70">
                No transfer-eligible players matching criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-white border-4 border-black brutal-shadow p-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Owning Franchise Badge */}
                    <div className="flex items-center justify-between font-mono text-[10px] pb-2 border-b-2 border-black mb-2">
                      <span className="font-black uppercase text-black/70">OWNED BY:</span>
                      <span className="bg-[#FF6D00] text-white px-2 py-0.5 border border-black font-black uppercase truncate max-w-[120px]">
                        {player.soldToTeamName}
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center py-2">
                      <FCCard player={player} size="sm" showHover={false} />
                    </div>

                    <div className="text-center mt-2">
                      <h3 className="font-heading font-black text-sm uppercase text-black truncate">
                        {player.name}
                      </h3>
                      <div className="text-[10px] font-mono text-black/70 font-bold">
                        {player.position} · OVR {player.stats?.overall}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Pricing */}
                  <div className="mt-4 pt-3 border-t-2 border-black font-mono">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[10px] font-black text-black/70">AUCTION COST</span>
                      <span className="font-black text-black">£{player.soldPrice}M</span>
                    </div>

                    {isBuyer ? (
                      <button
                        onClick={() => handleOpenOfferModal(player)}
                        disabled={!isMarketLive}
                        className={`w-full py-2 font-mono text-xs font-black uppercase border-2 border-black brutal-shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                          isMarketLive
                            ? 'bg-[#B6FF3B] hover:bg-black hover:text-white text-black cursor-pointer'
                            : 'bg-black/10 text-black/40 cursor-not-allowed'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>MAKE PRIVATE OFFER</span>
                      </button>
                    ) : (
                      <div className="text-[10px] text-center text-black/60 font-bold bg-[#FFF8E7] p-1.5 border border-black">
                        Only Top 4 buyers can bid
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SELLER OFFER INBOX (PRD Section 31) */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="bg-white border-4 border-black brutal-shadow p-5 font-mono">
            <h2 className="text-xl font-heading font-black uppercase text-black mb-1">
              INCOMING TRANSFER OFFERS
            </h2>
            <p className="text-xs text-black/70 font-bold">
              Private negotiation inbox. Review competing monetary offers, counter terms, or accept deals.
            </p>
          </div>

          {receivedOffers.length === 0 ? (
            <div className="bg-white border-4 border-black brutal-shadow p-12 text-center font-mono">
              <p className="text-sm font-bold text-black/70">No incoming transfer offers yet.</p>
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              {receivedOffers.map((offer) => {
                const isPendingOrCountered =
                  offer.status === 'PENDING' || offer.status === 'COUNTERED';

                return (
                  <div
                    key={offer.id}
                    className="bg-white border-4 border-black brutal-shadow p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-16 border-2 border-black bg-[#FFF8E7] flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={offer.playerPhoto}
                          alt={offer.playerName}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-lg text-black uppercase">
                            {offer.playerName}
                          </span>
                          <span className="bg-black text-white px-1.5 py-0.2 text-[10px] font-black uppercase">
                            {offer.playerPosition}
                          </span>
                          <span className="bg-[#FFD600] px-1 text-[10px] font-black border border-black">
                            OVR {offer.playerRating}
                          </span>
                        </div>

                        <div className="text-xs text-black/80 font-bold mt-0.5">
                          OFFER FROM: <strong className="text-[#3D5AFE]">{offer.buyerTeamName}</strong>
                        </div>

                        {/* Negotiation History snippet */}
                        <div className="text-[10px] text-black/60 mt-1">
                          Last Action: {offer.history[offer.history.length - 1]?.actionType} at{' '}
                          {new Date(offer.updatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto">
                      <div className="text-right">
                        <div className="text-[10px] text-black/60 font-black uppercase">
                          CURRENT PROPOSAL
                        </div>
                        <div className="text-2xl font-heading font-black text-black bg-[#B6FF3B] px-3 py-0.5 border-2 border-black inline-block">
                          £{offer.currentAmount}M
                        </div>
                        <div className="text-[10px] font-black uppercase text-black/70 mt-0.5">
                          STATUS: {offer.status}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {isPendingOrCountered && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setConfirmDealOffer(offer)}
                            className="flex-1 sm:flex-none px-3 py-2 bg-[#00C853] hover:bg-black text-white font-mono font-black text-xs uppercase border-2 border-black brutal-shadow-sm cursor-pointer"
                          >
                            ACCEPT DEAL
                          </button>

                          <button
                            onClick={() => handleOpenCounterModal(offer)}
                            className="flex-1 sm:flex-none px-3 py-2 bg-[#FFD600] hover:bg-black hover:text-white text-black font-mono font-black text-xs uppercase border-2 border-black brutal-shadow-sm cursor-pointer"
                          >
                            COUNTER
                          </button>

                          <button
                            onClick={() => rejectTransferOffer(offer.id)}
                            className="flex-1 sm:flex-none px-2.5 py-2 bg-[#FF1744] hover:bg-black text-white font-mono font-black text-xs uppercase border-2 border-black brutal-shadow-sm cursor-pointer"
                          >
                            REJECT
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY OUTGOING OFFERS (PRD Section 39) */}
      {activeTab === 'my_offers' && (
        <div className="space-y-4 font-mono">
          <div className="bg-white border-4 border-black brutal-shadow p-5">
            <h2 className="text-xl font-heading font-black uppercase text-black mb-1">
              MY OUTGOING OFFERS
            </h2>
            <p className="text-xs text-black/70 font-bold">
              Track status of all private offers submitted to Bottom 6 franchises.
            </p>
          </div>

          {myOutgoingOffers.length === 0 ? (
            <div className="bg-white border-4 border-black brutal-shadow p-12 text-center">
              <p className="text-sm font-bold text-black/70">You have no active outgoing offers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOutgoingOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border-4 border-black brutal-shadow p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-16 border-2 border-black bg-[#FFF8E7] flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={offer.playerPhoto}
                        alt={offer.playerName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div>
                      <h3 className="font-heading font-black text-lg text-black uppercase">
                        {offer.playerName}
                      </h3>
                      <div className="text-xs text-black/80 font-bold">
                        SELLER: <strong className="text-[#FF6D00]">{offer.sellerTeamName}</strong>
                      </div>
                      <div className="text-[10px] text-black/60 mt-0.5">
                        Created: {new Date(offer.createdAt).toLocaleDateString()} ·{' '}
                        {offer.history.length} round(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-black/60 font-black uppercase">
                        OFFER VALUE
                      </div>
                      <div className="text-2xl font-heading font-black text-black bg-[#FFF8E7] px-3 py-0.5 border-2 border-black inline-block">
                        £{offer.currentAmount}M
                      </div>
                      <div className="text-[10px] font-black uppercase text-black/70 mt-0.5">
                        STATUS: {offer.status}
                      </div>
                    </div>

                    {offer.status === 'COUNTERED' && (
                      <button
                        onClick={() => setConfirmDealOffer(offer)}
                        className="px-3 py-2 bg-[#00C853] hover:bg-black text-white font-mono font-black text-xs uppercase border-2 border-black brutal-shadow-sm cursor-pointer"
                      >
                        ACCEPT COUNTER (£{offer.currentAmount}M)
                      </button>
                    )}

                    {(offer.status === 'PENDING' || offer.status === 'COUNTERED') && (
                      <button
                        onClick={() => withdrawTransferOffer(offer.id)}
                        className="px-3 py-2 bg-black text-white hover:bg-red-600 font-mono font-black text-xs uppercase border-2 border-black cursor-pointer"
                      >
                        WITHDRAW
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BEST NEGOTIATOR AWARD (PRD Section 41) */}
      {activeTab === 'negotiator_award' && (
        <div className="space-y-5 font-mono">
          <div className="bg-[#FFD600] border-4 border-black brutal-shadow-lg p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-6 h-6 text-black" />
                <span className="font-heading font-black text-xl text-black uppercase">
                  BEST NEGOTIATOR AWARD TRACKER
                </span>
              </div>
              <p className="text-xs sm:text-sm text-black font-bold max-w-2xl">
                The Bottom 6 teams compete for the prestigious Best Negotiator Award. The team with the
                highest cash purse when the Transfer Market closes wins!
              </p>
            </div>
            <div className="bg-white border-3 border-black p-3 font-heading font-black text-center min-w-[140px]">
              <div className="text-[10px] text-black/70 uppercase">CURRENT LEADER</div>
              <div className="text-xl text-black uppercase">{bestNegotiators[0]?.teamName || '—'}</div>
            </div>
          </div>

          <div className="bg-white border-4 border-black brutal-shadow overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-black text-white font-black uppercase text-[11px]">
                  <th className="p-3 border-r border-white/20">RANK</th>
                  <th className="p-3 border-r border-white/20">BOTTOM 6 FRANCHISE</th>
                  <th className="p-3 border-r border-white/20 text-right">STARTING PURSE</th>
                  <th className="p-3 border-r border-white/20 text-right">CURRENT PURSE</th>
                  <th className="p-3 border-r border-white/20 text-center">PLAYERS TRADED</th>
                  <th className="p-3 text-center">AWARD STANDING</th>
                </tr>
              </thead>
              <tbody>
                {bestNegotiators.map((team, idx) => {
                  const isLeader = idx === 0;
                  return (
                    <tr
                      key={team.id}
                      className={`border-b-2 border-black/15 ${
                        isLeader ? 'bg-[#FFF8E7] font-black' : 'bg-white'
                      }`}
                    >
                      <td className="p-3 border-r border-black/10 text-center text-sm font-black">
                        {isLeader ? '👑 #1' : `#${idx + 1}`}
                      </td>
                      <td className="p-3 font-heading font-black text-base uppercase border-r border-black/10 flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 inline-block border border-black"
                          style={{ backgroundColor: team.color }}
                        />
                        <span>{team.teamName}</span>
                      </td>
                      <td className="p-3 text-right border-r border-black/10 text-black/70">
                        £{team.startingBalance}M
                      </td>
                      <td className="p-3 text-right border-r border-black/10 font-heading font-black text-lg text-black">
                        <span className="bg-[#B6FF3B] px-2 py-0.5 border border-black">
                          £{team.remainingBalance}M
                        </span>
                      </td>
                      <td className="p-3 text-center border-r border-black/10 font-bold">
                        {team.boughtPlayers.length} active players
                      </td>
                      <td className="p-3 text-center font-bold">
                        {isLeader ? (
                          <span className="bg-[#FFD600] px-2 py-1 border border-black font-black uppercase text-[10px]">
                            CURRENT TROPHY LEADER
                          </span>
                        ) : (
                          <span className="text-black/60 font-bold">
                            -£{(bestNegotiators[0].remainingBalance - team.remainingBalance).toFixed(1)}M behind
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT OFFER MODAL */}
      {selectedPlayerForOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl font-mono">
            <div className="flex items-start justify-between pb-3 border-b-2 border-black mb-4">
              <div>
                <span className="bg-[#B6FF3B] text-black font-mono font-black text-[10px] px-2 py-0.5 border border-black uppercase">
                  CONFIDENTIAL OFFER
                </span>
                <h3 className="text-2xl font-heading font-black text-black uppercase mt-1">
                  {selectedPlayerForOffer.name}
                </h3>
                <div className="text-xs text-black/70 font-bold">
                  SELLER: {selectedPlayerForOffer.soldToTeamName}
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayerForOffer(null)}
                className="p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FFF8E7] border-2 border-black p-3 text-xs">
                <div className="flex justify-between text-black/70 font-bold">
                  <span>YOUR AVAILABLE PURSE:</span>
                  <span className="font-black text-black">£{myTeam?.remainingBalance ?? 500}M</span>
                </div>
                <div className="flex justify-between text-black/70 font-bold mt-1">
                  <span>AUCTION PURCHASE PRICE:</span>
                  <span className="font-black text-black">
                    £{selectedPlayerForOffer.soldPrice || selectedPlayerForOffer.basePrice}M
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  ENTER MONETARY OFFER (£M):
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-heading font-black">£</span>
                  <input
                    type="number"
                    min="1"
                    max={myTeam?.remainingBalance ?? 500}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full text-2xl font-heading font-black py-2 px-3 border-3 border-black bg-[#FFF8E7] focus:outline-none focus:bg-white"
                  />
                  <span className="text-2xl font-heading font-black">M</span>
                </div>
              </div>

              {offerError && (
                <div className="p-2.5 bg-red-100 border-2 border-red-600 text-red-700 font-bold text-xs">
                  {offerError}
                </div>
              )}

              <div className="pt-3 border-t-2 border-black flex gap-3">
                <button
                  onClick={() => setSelectedPlayerForOffer(null)}
                  className="flex-1 py-2.5 border-2 border-black font-heading font-black text-xs uppercase bg-[#FFF8E7] hover:bg-black/10 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSubmitOffer}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#3D5AFE] hover:bg-black text-white font-heading font-black text-xs uppercase border-2 border-black brutal-shadow-sm cursor-pointer transition-colors"
                >
                  {isSubmitting ? 'TRANSMITTING...' : 'SEND PRIVATE OFFER'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: COUNTER OFFER MODAL */}
      {selectedOfferForCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl font-mono">
            <div className="flex items-start justify-between pb-3 border-b-2 border-black mb-4">
              <div>
                <span className="bg-[#FFD600] text-black font-mono font-black text-[10px] px-2 py-0.5 border border-black uppercase">
                  COUNTER-PROPOSAL
                </span>
                <h3 className="text-2xl font-heading font-black text-black uppercase mt-1">
                  {selectedOfferForCounter.playerName}
                </h3>
                <div className="text-xs text-black/70 font-bold">
                  BUYER: {selectedOfferForCounter.buyerTeamName}
                </div>
              </div>
              <button
                onClick={() => setSelectedOfferForCounter(null)}
                className="p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FFF8E7] border-2 border-black p-3 text-xs">
                <div className="flex justify-between font-bold">
                  <span>THEIR CURRENT OFFER:</span>
                  <span className="font-black text-black">£{selectedOfferForCounter.currentAmount}M</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  YOUR COUNTER AMOUNT (£M):
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-heading font-black">£</span>
                  <input
                    type="number"
                    min="1"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(Number(e.target.value))}
                    className="w-full text-2xl font-heading font-black py-2 px-3 border-3 border-black bg-[#FFF8E7] focus:outline-none focus:bg-white"
                  />
                  <span className="text-2xl font-heading font-black">M</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black flex gap-3">
                <button
                  onClick={() => setSelectedOfferForCounter(null)}
                  className="flex-1 py-2.5 border-2 border-black font-heading font-black text-xs uppercase bg-[#FFF8E7] hover:bg-black/10 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSubmitCounter}
                  className="flex-1 py-2.5 bg-[#FF6D00] hover:bg-black text-white font-heading font-black text-xs uppercase border-2 border-black brutal-shadow-sm cursor-pointer transition-colors"
                >
                  SUBMIT COUNTER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM DEAL MODAL (PRD Section 35) */}
      {confirmDealOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl font-mono">
            <div className="text-center pb-4 border-b-2 border-black mb-4">
              <span className="bg-[#B6FF3B] text-black font-mono font-black text-xs px-2.5 py-0.5 border border-black uppercase">
                PRD PROTOCOL CONFIRMATION
              </span>
              <h3 className="text-2xl font-heading font-black text-black uppercase mt-2">
                CONFIRM TRANSFER DEAL
              </h3>
            </div>

            <div className="space-y-4 text-center">
              <div className="p-4 bg-[#FFF8E7] border-2 border-black space-y-2">
                <div className="font-heading font-black text-xl uppercase text-black">
                  {confirmDealOffer.playerName}
                </div>

                <div className="flex items-center justify-center gap-3 text-xs font-black uppercase text-black">
                  <span className="bg-[#FF6D00] text-white px-2 py-0.5 border border-black">
                    {confirmDealOffer.sellerTeamName}
                  </span>
                  <span>➔</span>
                  <span className="bg-[#3D5AFE] text-white px-2 py-0.5 border border-black">
                    {confirmDealOffer.buyerTeamName}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-black/70 font-black uppercase">
                    AGREED TRANSFER FEE
                  </div>
                  <div className="text-3xl font-heading font-black text-black mt-0.5">
                    £{confirmDealOffer.currentAmount}M
                  </div>
                </div>
              </div>

              <p className="text-xs text-black/70 font-bold">
                Upon confirmation, £{confirmDealOffer.currentAmount}M will be atomically transferred,
                squads updated, and all competing offers closed.
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setConfirmDealOffer(null)}
                  className="flex-1 py-2.5 border-2 border-black font-heading font-black text-xs uppercase bg-[#FFF8E7] hover:bg-black/10 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmDeal}
                  className="flex-1 py-2.5 bg-[#00C853] hover:bg-black text-white font-heading font-black text-xs uppercase border-2 border-black brutal-shadow-sm cursor-pointer transition-colors"
                >
                  CONFIRM DEAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
