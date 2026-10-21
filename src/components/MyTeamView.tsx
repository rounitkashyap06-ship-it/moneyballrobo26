import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import { FCCard } from './FCCard.tsx';
import type { Player, Team } from '../types/auction.ts';
import { Shield, User, Trophy, AlertTriangle, ArrowRight } from 'lucide-react';

export const MyTeamView: React.FC = () => {
  const { state, currentUser } = useAuction();

  // If user is a team, show their team. If admin or guest, let them choose which team to view.
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    currentUser?.teamId || state?.teams[0]?.id || 'team-titans'
  );

  const team = state?.teams.find((t) => t.id === selectedTeamId) || state?.teams[0];
  const allPlayers = state?.players || [];

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-mono">
        No team found.
      </div>
    );
  }

  // Get full player objects for bought players to have stats & position details
  const squadPlayers: Player[] = team.boughtPlayers.map((bp) => {
    const full = allPlayers.find((p) => p.id === bp.playerId);
    if (full) {
      return { ...full, soldPrice: bp.price };
    }
    return {
      id: bp.playerId,
      name: bp.playerName,
      photo: bp.playerPhoto,
      currentClub: bp.club,
      position: bp.position,
      nationality: 'International',
      basePrice: bp.price,
      status: 'sold',
      soldPrice: bp.price,
      stats: { pace: 80, shooting: 80, passing: 80, dribbling: 80, defending: 80, physical: 80, overall: 85 },
    };
  });

  // Categorize players into 4 PRD Squad Sections (PRD Section 9 & 22)
  const forwards = squadPlayers.filter((p) => {
    const pos = p.position.toUpperCase();
    return pos === 'ST' || pos === 'CF' || pos === 'LW' || pos === 'RW' || p.positionCategory === 'FORWARD';
  });

  const midfielders = squadPlayers.filter((p) => {
    const pos = p.position.toUpperCase();
    return (
      pos === 'CAM' ||
      pos === 'CM' ||
      pos === 'CDM' ||
      pos === 'LM' ||
      pos === 'RM' ||
      pos === 'MID' ||
      p.positionCategory === 'MIDFIELDER'
    );
  });

  const defenders = squadPlayers.filter((p) => {
    const pos = p.position.toUpperCase();
    return (
      pos === 'CB' ||
      pos === 'LB' ||
      pos === 'RB' ||
      pos === 'LWB' ||
      pos === 'RWB' ||
      pos === 'DEF' ||
      p.positionCategory === 'DEFENDER'
    );
  });

  const goalkeepers = squadPlayers.filter((p) => {
    const pos = p.position.toUpperCase();
    return pos === 'GK' || p.positionCategory === 'GOALKEEPER';
  });

  const hasGK = goalkeepers.length > 0;
  const isSquadValid = squadPlayers.length >= team.minSquadSize && squadPlayers.length <= team.maxSquadSize && hasGK;

  const renderPlayerRow = (player: Player) => (
    <div
      key={player.id}
      className="bg-white border-2 border-black p-3 brutal-shadow-sm flex items-center justify-between gap-3 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-14 overflow-hidden border border-black flex-shrink-0 bg-[#FFF8E7] flex items-center justify-center">
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
            }}
          />
        </div>

        <div className="font-mono">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-sm uppercase text-black">
              {player.name}
            </span>
            <span className="font-black text-[10px] bg-black text-white px-1.5 py-0.2 uppercase">
              {player.position}
            </span>
            <span className="font-black text-[10px] bg-[#FFD600] text-black px-1 border border-black">
              OVR {player.stats?.overall || 85}
            </span>
          </div>
          <div className="text-[11px] text-black/70 font-bold">
            {player.currentClub} · {player.nationality}
          </div>
        </div>
      </div>

      <div className="font-mono text-right">
        <div className="text-[9px] text-black/60 font-black uppercase">FEE PAID</div>
        <div className="text-base font-heading font-black text-black bg-[#B6FF3B] px-2 py-0.5 border border-black inline-block">
          £{player.soldPrice ?? player.basePrice}M
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Franchise Switcher (for Admin/Spectators or testing) */}
      {(!currentUser?.teamId || currentUser.role === 'admin') && (
        <div className="bg-white border-4 border-black brutal-shadow p-4 flex items-center gap-3 overflow-x-auto">
          <span className="font-mono text-xs font-black uppercase text-black/70 min-w-max">
            SELECT FRANCHISE:
          </span>
          <div className="flex items-center gap-2">
            {state?.teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`px-3 py-1 border-2 border-black font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                  selectedTeamId === t.id
                    ? 'bg-black text-white brutal-shadow-sm'
                    : 'bg-[#FFF8E7] text-black hover:bg-black/10'
                }`}
              >
                {t.teamName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRD Section 22: My Team Header */}
      <div className="bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-7">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-4 border-black">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 border-4 border-black brutal-shadow flex items-center justify-center font-heading font-black text-white text-3xl"
              style={{ backgroundColor: team.color }}
            >
              {team.teamName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#FFD600] text-black px-2 py-0.5 border-2 border-black font-mono font-black text-xs uppercase">
                  OFFICIAL SQUAD ROSTER
                </span>
                <span
                  className={`font-mono text-xs font-black px-2 py-0.5 border border-black uppercase ${
                    team.qualificationStatus === 'TOP_4'
                      ? 'bg-[#3D5AFE] text-white'
                      : team.qualificationStatus === 'BOTTOM_6'
                      ? 'bg-[#FF6D00] text-white'
                      : 'bg-black/10 text-black'
                  }`}
                >
                  {team.qualificationStatus}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-heading font-black text-black uppercase tracking-tight">
                {team.teamName}
              </h1>
              <p className="text-xs font-mono text-black/70 font-bold uppercase mt-0.5">
                {team.ownerName || 'Franchise Partner'} · MONEYBALL '26
              </p>
            </div>
          </div>

          {/* Core Metrics: Purse & Squad */}
          <div className="flex items-center gap-4 font-mono">
            <div className="bg-[#FFF8E7] border-3 border-black p-4 brutal-shadow text-center min-w-[130px]">
              <div className="text-[10px] text-black/70 font-black uppercase">REMAINING PURSE</div>
              <div className="text-3xl font-heading font-black text-black mt-1">
                £{team.remainingBalance}M
              </div>
            </div>

            <div className="bg-[#FFF8E7] border-3 border-black p-4 brutal-shadow text-center min-w-[130px]">
              <div className="text-[10px] text-black/70 font-black uppercase">SQUAD COUNT</div>
              <div className="text-3xl font-heading font-black text-black mt-1">
                {team.boughtPlayers.length} / {team.maxSquadSize}
              </div>
            </div>
          </div>
        </div>

        {/* Squad Constraint Validation Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full border border-black ${
                  squadPlayers.length >= team.minSquadSize ? 'bg-[#00C853]' : 'bg-[#FFD600]'
                }`}
              />
              <span>Min Limit: 13 ({squadPlayers.length >= 13 ? 'Satisfied' : `${13 - squadPlayers.length} more needed`})</span>
            </span>

            <span className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full border border-black ${
                  squadPlayers.length <= team.maxSquadSize ? 'bg-[#00C853]' : 'bg-red-600'
                }`}
              />
              <span>Max Capacity: 15 ({team.maxSquadSize - squadPlayers.length} slots left)</span>
            </span>

            <span className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full border border-black ${
                  hasGK ? 'bg-[#00C853]' : 'bg-red-600'
                }`}
              />
              <span>Goalkeeper Rule: {hasGK ? '1+ Active GK' : '⚠️ Missing Goalkeeper!'}</span>
            </span>
          </div>

          <div className="text-black/70 font-black">
            TOTAL INVESTMENT: £{(team.startingBalance - team.remainingBalance).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* PRD Section 22: Four Squad Category Sections */}
      <div className="space-y-6">
        {/* 1. FORWARDS */}
        <div className="bg-white border-4 border-black brutal-shadow p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FF1744] inline-block border border-black" />
              <h2 className="text-lg font-heading font-black text-black uppercase">
                FORWARDS ({forwards.length})
              </h2>
            </div>
            <span className="text-xs text-black/60 font-bold uppercase">ST · CF · LW · RW</span>
          </div>

          {forwards.length === 0 ? (
            <div className="p-4 bg-[#FFF8E7] border-2 border-black text-center font-mono text-xs text-black/60 font-bold">
              No forwards signed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {forwards.map(renderPlayerRow)}
            </div>
          )}
        </div>

        {/* 2. MIDFIELDERS */}
        <div className="bg-white border-4 border-black brutal-shadow p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#3D5AFE] inline-block border border-black" />
              <h2 className="text-lg font-heading font-black text-black uppercase">
                MIDFIELDERS ({midfielders.length})
              </h2>
            </div>
            <span className="text-xs text-black/60 font-bold uppercase">CAM · CM · CDM · LM · RM</span>
          </div>

          {midfielders.length === 0 ? (
            <div className="p-4 bg-[#FFF8E7] border-2 border-black text-center font-mono text-xs text-black/60 font-bold">
              No midfielders signed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {midfielders.map(renderPlayerRow)}
            </div>
          )}
        </div>

        {/* 3. DEFENDERS */}
        <div className="bg-white border-4 border-black brutal-shadow p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#00C853] inline-block border border-black" />
              <h2 className="text-lg font-heading font-black text-black uppercase">
                DEFENDERS ({defenders.length})
              </h2>
            </div>
            <span className="text-xs text-black/60 font-bold uppercase">CB · LB · RB · LWB · RWB</span>
          </div>

          {defenders.length === 0 ? (
            <div className="p-4 bg-[#FFF8E7] border-2 border-black text-center font-mono text-xs text-black/60 font-bold">
              No defenders signed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {defenders.map(renderPlayerRow)}
            </div>
          )}
        </div>

        {/* 4. GOALKEEPERS */}
        <div className="bg-white border-4 border-black brutal-shadow p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FFD600] inline-block border border-black" />
              <h2 className="text-lg font-heading font-black text-black uppercase">
                GOALKEEPERS ({goalkeepers.length})
              </h2>
            </div>
            <span className="text-xs text-black/60 font-bold uppercase">GK (MANDATORY ≥ 1)</span>
          </div>

          {goalkeepers.length === 0 ? (
            <div className="p-4 bg-[#FFF8E7] border-2 border-black text-center font-mono text-xs text-red-600 font-black">
              ⚠️ Warning: Squad requires at least 1 Goalkeeper.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalkeepers.map(renderPlayerRow)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
