import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import { FCCard } from './FCCard.tsx';
import { Search, Filter, Gavel, CheckCircle2, XCircle, ArrowRightLeft, Layers } from 'lucide-react';
import type { Player } from '../types/auction.ts';

export const PlayerSetsView: React.FC = () => {
  const { state, currentUser, setPlayer } = useAuction();
  const isAdmin = currentUser?.role === 'admin';

  const [selectedSetId, setSelectedSetId] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);

  const players = state?.players || [];
  const playerSets = state?.playerSets || [];

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (selectedSetId !== 'all' && p.setId !== selectedSetId) return false;
      if (selectedCategory !== 'all' && p.positionCategory !== selectedCategory) return false;
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchClub = p.currentClub.toLowerCase().includes(q);
        const matchPos = p.position.toLowerCase().includes(q);
        if (!matchName && !matchClub && !matchPos) return false;
      }
      return true;
    });
  }, [players, selectedSetId, selectedCategory, selectedStatus, searchQuery]);

  const handleBringToGavel = async (player: Player) => {
    if (!isAdmin) return;
    await setPlayer(player.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white border-4 border-black brutal-shadow-lg p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FFD600] text-black px-2 py-0.5 border-2 border-black font-mono font-black text-xs uppercase">
              200 PLAYERS POOL
            </span>
            <span className="font-mono text-xs text-black/70 font-bold uppercase">
              10 PREDEFINED SETS · 20 PLAYERS PER SET
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black uppercase tracking-tight">
            AUCTION SETS DIRECTORY
          </h1>
          <p className="text-xs sm:text-sm text-black/80 font-mono mt-1">
            Browse official player tiers, starting prices, attributes, and live auction ownership.
          </p>
        </div>

        {/* View Layout Toggle */}
        <div className="flex items-center gap-2 border-2 border-black p-1 bg-[#FFF8E7] font-mono text-xs font-black">
          <button
            onClick={() => setViewLayout('grid')}
            className={`px-3 py-1 cursor-pointer transition-all uppercase ${
              viewLayout === 'grid' ? 'bg-black text-white brutal-shadow-sm' : 'bg-transparent text-black'
            }`}
          >
            CARD GRID
          </button>
          <button
            onClick={() => setViewLayout('table')}
            className={`px-3 py-1 cursor-pointer transition-all uppercase ${
              viewLayout === 'table' ? 'bg-black text-white brutal-shadow-sm' : 'bg-transparent text-black'
            }`}
          >
            DATA TABLE
          </button>
        </div>
      </div>

      {/* Set Selector Pills */}
      <div className="bg-white border-4 border-black brutal-shadow p-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-1">
          <button
            onClick={() => setSelectedSetId('all')}
            className={`px-3 py-1.5 border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer ${
              selectedSetId === 'all'
                ? 'bg-black text-white brutal-shadow-sm'
                : 'bg-[#FFF8E7] text-black hover:bg-black/10'
            }`}
          >
            ALL SETS ({players.length})
          </button>

          {playerSets.map((s) => {
            const countInSet = players.filter((p) => p.setId === s.id).length;
            const isLive = state?.activeSetId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSetId(s.id)}
                className={`px-3 py-1.5 border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSetId === s.id
                    ? 'bg-[#3D5AFE] text-white brutal-shadow-sm'
                    : 'bg-[#FFF8E7] text-black hover:bg-black/10'
                }`}
              >
                <span>SET {s.id}: {s.name}</span>
                <span className="opacity-75 text-[10px]">({countInSet})</span>
                {isLive && (
                  <span className="w-2 h-2 rounded-full bg-[#B6FF3B] border border-black animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border-4 border-black brutal-shadow p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search player, club, position..."
            className="w-full pl-9 pr-3 py-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none focus:bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="font-black uppercase text-black/70">CAT:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 py-2 px-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none"
          >
            <option value="all">ALL CATEGORIES</option>
            <option value="FORWARD">FORWARDS (60)</option>
            <option value="MIDFIELDER">MIDFIELDERS (60)</option>
            <option value="DEFENDER">DEFENDERS (60)</option>
            <option value="GOALKEEPER">GOALKEEPERS (20)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="font-black uppercase text-black/70">STATUS:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 py-2 px-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none"
          >
            <option value="all">ALL STATUSES</option>
            <option value="upcoming">UPCOMING (AVAILABLE)</option>
            <option value="sold">SOLD</option>
            <option value="unsold">UNSOLD</option>
            <option value="transfer_available">TRANSFER AVAILABLE</option>
            <option value="transferred">TRANSFERRED</option>
          </select>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between bg-[#FFF8E7] border-2 border-black px-3 py-2 font-black">
          <span>MATCHING LOTS:</span>
          <span className="bg-[#B6FF3B] px-2 py-0.5 border border-black">{filteredPlayers.length}</span>
        </div>
      </div>

      {/* Content Area */}
      {viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredPlayers.map((player) => {
            const isCurrent = state?.currentPlayerId === player.id;
            return (
              <div
                key={player.id}
                onClick={() => setInspectPlayer(player)}
                className={`bg-white border-4 border-black brutal-shadow hover:-translate-y-1 transition-all p-3 flex flex-col justify-between cursor-pointer group ${
                  isCurrent ? 'ring-4 ring-[#3D5AFE]' : ''
                }`}
              >
                <div>
                  {/* Set Tag & Order */}
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold pb-2 border-b-2 border-black mb-2">
                    <span className="text-black/70 uppercase">
                      SET {player.setId || 1} · #{player.orderInSet || 1}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 border border-black uppercase font-black text-[9px] ${
                        player.status === 'sold' || player.status === 'transferred'
                          ? 'bg-[#B6FF3B] text-black'
                          : player.status === 'unsold'
                          ? 'bg-[#FF5CA8] text-black'
                          : 'bg-[#FFD600] text-black'
                      }`}
                    >
                      {player.status === 'upcoming' ? 'AVAILABLE' : player.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Centered EA FC Card Presentation */}
                  <div className="w-full flex items-center justify-center py-2">
                    <FCCard player={player} size="sm" showHover={false} />
                  </div>

                  {/* Player Name & Base Details */}
                  <div className="mt-2 text-center">
                    <h3 className="font-heading font-black text-sm uppercase text-black truncate group-hover:text-[#3D5AFE] transition-colors">
                      {player.name}
                    </h3>
                    <div className="text-[10px] font-mono text-black/70 font-bold truncate">
                      {player.position} · {player.currentClub}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Pricing & Action */}
                <div className="mt-3 pt-2.5 border-t-2 border-black flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-[9px] text-black/60 font-black">
                      {player.soldPrice ? 'SOLD PRICE' : 'BASE PRICE'}
                    </div>
                    <div className="font-black text-black">
                      £{player.soldPrice ?? player.basePrice}M
                    </div>
                  </div>

                  {isAdmin && player.status === 'upcoming' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBringToGavel(player);
                      }}
                      className="px-2 py-1 bg-black text-white hover:bg-[#3D5AFE] font-black text-[10px] uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors"
                      title="Bring to Gavel"
                    >
                      <Gavel className="w-3 h-3" />
                      <span>GAVEL</span>
                    </button>
                  )}

                  {player.soldToTeamName && (
                    <span className="text-[10px] font-black bg-[#FFF8E7] px-1.5 py-0.5 border border-black truncate max-w-[90px]">
                      {player.soldToTeamName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white border-4 border-black brutal-shadow overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white font-black uppercase text-[11px]">
                <th className="p-3 border-r border-white/20">SET</th>
                <th className="p-3 border-r border-white/20">ORDER</th>
                <th className="p-3 border-r border-white/20">PLAYER</th>
                <th className="p-3 border-r border-white/20">POS</th>
                <th className="p-3 border-r border-white/20">CAT</th>
                <th className="p-3 border-r border-white/20 text-center">OVR</th>
                <th className="p-3 border-r border-white/20">CLUB</th>
                <th className="p-3 border-r border-white/20 text-right">BASE PRICE</th>
                <th className="p-3 border-r border-white/20">STATUS</th>
                <th className="p-3 border-r border-white/20">OWNER</th>
                {isAdmin && <th className="p-3 text-center">ACTION</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, idx) => (
                <tr
                  key={player.id}
                  onClick={() => setInspectPlayer(player)}
                  className={`border-b-2 border-black/10 hover:bg-[#FFF8E7] cursor-pointer transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF0]'
                  }`}
                >
                  <td className="p-3 font-bold border-r border-black/10">SET {player.setId}</td>
                  <td className="p-3 border-r border-black/10 text-center">#{player.orderInSet}</td>
                  <td className="p-3 font-heading font-black text-sm uppercase border-r border-black/10">
                    {player.name}
                  </td>
                  <td className="p-3 font-black border-r border-black/10">{player.position}</td>
                  <td className="p-3 text-black/70 border-r border-black/10">{player.positionCategory}</td>
                  <td className="p-3 font-black text-center border-r border-black/10">
                    <span className="bg-[#FFD600] px-1.5 py-0.5 border border-black">
                      {player.stats?.overall || 85}
                    </span>
                  </td>
                  <td className="p-3 border-r border-black/10 truncate max-w-[130px]">
                    {player.currentClub}
                  </td>
                  <td className="p-3 font-black text-right border-r border-black/10">
                    £{player.basePrice}M
                  </td>
                  <td className="p-3 border-r border-black/10">
                    <span
                      className={`px-1.5 py-0.5 border border-black uppercase text-[10px] font-black ${
                        player.status === 'sold' || player.status === 'transferred'
                          ? 'bg-[#B6FF3B]'
                          : player.status === 'unsold'
                          ? 'bg-[#FF5CA8]'
                          : 'bg-[#FFD600]'
                      }`}
                    >
                      {player.status === 'upcoming' ? 'AVAILABLE' : player.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold border-r border-black/10">
                    {player.soldToTeamName || '—'}
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      {player.status === 'upcoming' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBringToGavel(player);
                          }}
                          className="px-2 py-1 bg-black text-white hover:bg-[#3D5AFE] font-black text-[10px] uppercase border border-black transition-colors"
                        >
                          BRING TO GAVEL
                        </button>
                      ) : (
                        <span className="text-black/40">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Player Inspect Modal */}
      {inspectPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fadeIn"
          onClick={() => setInspectPlayer(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b-2 border-black mb-4">
              <div>
                <span className="bg-[#FFD600] text-black font-mono font-black text-xs px-2 py-0.5 border border-black uppercase">
                  SET {inspectPlayer.setId}: {inspectPlayer.setName} · #{inspectPlayer.orderInSet}
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-black uppercase mt-1">
                  {inspectPlayer.name}
                </h2>
                <div className="text-xs font-mono text-black/70 font-bold">
                  {inspectPlayer.position} · {inspectPlayer.currentClub} · {inspectPlayer.nationality}
                </div>
              </div>

              <button
                onClick={() => setInspectPlayer(null)}
                className="p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black font-bold cursor-pointer text-xs"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
              <FCCard player={inspectPlayer} size="md" showHover={false} />

              <div className="flex-1 w-full space-y-3 font-mono text-xs">
                <div className="bg-[#FFF8E7] border-2 border-black p-3">
                  <div className="text-[10px] text-black/70 font-black uppercase">BASE PRICE</div>
                  <div className="text-2xl font-heading font-black text-black">
                    £{inspectPlayer.basePrice}M
                  </div>
                </div>

                <div className="bg-[#FFF8E7] border-2 border-black p-3">
                  <div className="text-[10px] text-black/70 font-black uppercase">STATUS</div>
                  <div className="text-sm font-heading font-black uppercase">
                    {inspectPlayer.status === 'upcoming' ? 'AVAILABLE' : inspectPlayer.status}
                    {inspectPlayer.soldToTeamName && ` · Owned by ${inspectPlayer.soldToTeamName}`}
                  </div>
                </div>

                {inspectPlayer.notes && (
                  <div className="bg-[#FFFDF0] border-2 border-black p-2.5 text-[11px] text-black/80 font-bold">
                    <span className="font-black text-black uppercase">NOTES: </span>
                    {inspectPlayer.notes}
                  </div>
                )}

                {isAdmin && inspectPlayer.status === 'upcoming' && (
                  <button
                    onClick={() => {
                      handleBringToGavel(inspectPlayer);
                      setInspectPlayer(null);
                    }}
                    className="w-full py-2.5 bg-[#3D5AFE] text-white hover:bg-black border-2 border-black font-heading font-black text-sm uppercase brutal-shadow-sm transition-colors cursor-pointer"
                  >
                    BRING TO AUCTION GAVEL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
