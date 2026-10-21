import React, { useState } from 'react';
import { Search, Filter, Award, ChevronLeft, X } from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import type { Player } from '../types/auction.ts';
import { FCCard } from './FCCard.tsx';

interface UpcomingLotsSubpageProps {
  onBackToLive?: () => void;
}

export const UpcomingLotsSubpage: React.FC<UpcomingLotsSubpageProps> = ({ onBackToLive }) => {
  const { state } = useAuction();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'basePrice-desc' | 'basePrice-asc' | 'overall-desc'>('overall-desc');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const upcomingPlayers = state?.players.filter((p) => p.status === 'upcoming') || [];

  const filteredPlayers = upcomingPlayers
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.currentClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nationality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPos = selectedPos === 'ALL' || p.position === selectedPos;
      return matchSearch && matchPos;
    })
    .sort((a, b) => {
      if (sortBy === 'basePrice-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'basePrice-asc') return a.basePrice - b.basePrice;
      return b.stats.overall - a.stats.overall;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Subpage Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-4 border-black brutal-shadow-lg p-5 sm:p-6">
        <div className="flex items-center gap-4">
          {onBackToLive && (
            <button
              onClick={onBackToLive}
              className="p-2 bg-[#FFD600] hover:bg-black hover:text-white border-2 border-black brutal-shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer font-bold"
              title="Return to Live Arena"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="inline-block bg-[#FF5CA8] text-black border-2 border-black px-2.5 py-0.5 font-mono text-[11px] font-black uppercase mb-1.5 rotate-[-1deg]">
              SCOUTING LEDGER
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading text-black uppercase tracking-tight leading-none">
              UPCOMING PLAYER LOTS
            </h1>
            <p className="text-xs text-black/80 font-mono font-bold mt-1">
              Scout superstar talents, review radar attributes, and prepare bidding budgets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono bg-[#B6FF3B] border-3 border-black p-3 brutal-shadow-sm">
            <div className="text-3xl font-heading text-black leading-none">
              {upcomingPlayers.length}
            </div>
            <div className="text-[10px] text-black uppercase tracking-wider font-black mt-1">
              LOTS IN QUEUE
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 border-4 border-black brutal-shadow">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH PLAYER, CLUB, OR NATION..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFF8E7] border-2 border-black text-xs text-black placeholder-black/50 focus:outline-none focus:bg-white focus:shadow-[3px_3px_0_#000] font-mono font-bold"
          />
        </div>

        {/* Position Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'FWD', 'MID', 'DEF', 'GK'].map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPos(pos)}
              className={`px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer ${
                selectedPos === pos
                  ? 'bg-[#FFD600] text-black brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                  : 'bg-[#FFF8E7] text-black hover:bg-white'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-black hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full md:w-auto px-3 py-2 bg-[#FFF8E7] border-2 border-black text-xs text-black font-mono font-bold focus:outline-none focus:bg-white"
          >
            <option value="overall-desc">HIGHEST OVERALL (OVR)</option>
            <option value="basePrice-desc">HIGHEST BASE PRICE</option>
            <option value="basePrice-asc">LOWEST BASE PRICE</option>
          </select>
        </div>
      </div>

      {/* Player Cards Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="bg-white border-4 border-black brutal-shadow-lg p-16 text-center text-black font-mono">
          <Award className="w-12 h-12 text-black mx-auto mb-3" />
          <h3 className="text-xl font-heading text-black uppercase mb-1">NO MATCHING PLAYERS</h3>
          <p className="text-xs text-black/70 font-bold">Try adjusting your search terms or position filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="bg-white border-4 border-black brutal-shadow hover:-translate-y-1 hover:shadow-[8px_8px_0_#000] transition-all p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Authentic EA FC Card Presentation */}
                <div className="w-full flex items-center justify-center py-2 mb-2">
                  <FCCard player={player} size="sm" showHover={false} />
                </div>

                {/* Name & Nationality */}
                <div className="mb-3 font-mono">
                  <div className="text-[10px] text-black/70 uppercase font-black">
                    {player.nationality}
                  </div>
                  <h3 className="text-lg font-heading text-black truncate uppercase group-hover:text-[#3D5AFE] transition-colors">
                    {player.name}
                  </h3>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono mb-3 bg-[#FFF8E7] p-2 border-2 border-black font-bold">
                  <div>PAC: <strong>{player.stats.pace}</strong></div>
                  <div>SHO: <strong>{player.stats.shooting}</strong></div>
                  <div>PAS: <strong>{player.stats.passing}</strong></div>
                  <div>DRI: <strong>{player.stats.dribbling}</strong></div>
                  <div>DEF: <strong>{player.stats.defending}</strong></div>
                  <div>PHY: <strong>{player.stats.physical}</strong></div>
                </div>
              </div>

              {/* Base Price Card */}
              <div className="pt-2.5 border-t-2 border-black flex items-center justify-between font-mono">
                <span className="text-[10px] text-black uppercase font-black">
                  BASE PRICE
                </span>
                <span className="text-base font-black text-black bg-[#FFD600] px-2 py-0.5 border border-black">
                  ${player.basePrice}M
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black text-black font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <img
                src={selectedPlayer.photo}
                alt={selectedPlayer.name}
                className="w-20 h-24 object-contain bg-transparent border-3 border-black brutal-shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <div className="font-mono">
                <span className="text-[10px] bg-black text-white px-2 py-0.5 font-black uppercase">
                  {selectedPlayer.position} · {selectedPlayer.nationality}
                </span>
                <h3 className="text-2xl font-heading text-black uppercase mt-1">
                  {selectedPlayer.name}
                </h3>
                <p className="text-xs text-black font-bold">{selectedPlayer.currentClub}</p>
                <div className="text-lg font-black text-black bg-[#FFD600] px-2 py-0.5 border border-black inline-block mt-2">
                  BASE: ${selectedPlayer.basePrice}M
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-[#FFF8E7] p-3 border-2 border-black mb-4 font-bold">
              <div>PAC: <strong>{selectedPlayer.stats.pace}</strong></div>
              <div>SHO: <strong>{selectedPlayer.stats.shooting}</strong></div>
              <div>PAS: <strong>{selectedPlayer.stats.passing}</strong></div>
              <div>DRI: <strong>{selectedPlayer.stats.dribbling}</strong></div>
              <div>DEF: <strong>{selectedPlayer.stats.defending}</strong></div>
              <div>PHY: <strong>{selectedPlayer.stats.physical}</strong></div>
            </div>

            <div className="text-xs font-mono font-bold text-black flex items-center justify-between border-t-2 border-black pt-3">
              <span>OVERALL: <strong className="bg-[#B6FF3B] px-1.5 py-0.2 border border-black">{selectedPlayer.stats.overall}</strong></span>
              <span>MIN INCREMENT: <strong>+£2.5M</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
