import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import type { Team, QualificationStatus } from '../types/auction.ts';
import { Shield, Trophy, Users, Award, CheckCircle, ExternalLink } from 'lucide-react';

interface TeamsViewProps {
  onSelectTeam?: (teamId: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({ onSelectTeam }) => {
  const { state, currentUser, setQualification } = useAuction();
  const isAdmin = currentUser?.role === 'admin';

  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const teams = state?.teams || [];

  const handleQualificationChange = async (teamId: string, status: QualificationStatus) => {
    if (!isAdmin) return;
    await setQualification(teamId, status);
  };

  const totalSpentAllTeams = teams.reduce(
    (acc, t) => acc + (t.startingBalance - t.remainingBalance),
    0
  );

  const totalPlayersBought = teams.reduce((acc, t) => acc + t.boughtPlayers.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-4 border-black brutal-shadow-lg p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#B6FF3B] text-black px-2 py-0.5 border-2 border-black font-mono font-black text-xs uppercase">
              10 FRANCHISES
            </span>
            <span className="font-mono text-xs text-black/70 font-bold uppercase">
              £500M PURSE PER FRANCHISE · 15 SQUAD MAX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black uppercase tracking-tight">
            TEAMS & PURSE TRACKER
          </h1>
          <p className="text-xs sm:text-sm text-black/80 font-mono mt-1">
            Real-time balance monitoring, squad limits, and league qualification statuses.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-[#FFF8E7] border-2 border-black p-3 text-center">
            <div className="text-[10px] text-black/70 font-black">TOTAL SPENT</div>
            <div className="text-lg font-heading font-black text-black">£{totalSpentAllTeams.toFixed(1)}M</div>
          </div>
          <div className="bg-[#FFF8E7] border-2 border-black p-3 text-center">
            <div className="text-[10px] text-black/70 font-black">PLAYERS SIGNED</div>
            <div className="text-lg font-heading font-black text-black">{totalPlayersBought}/150</div>
          </div>
        </div>
      </div>

      {/* PRD Section 19: Global Purse Tracker Table */}
      <div className="bg-white border-4 border-black brutal-shadow overflow-x-auto">
        <div className="p-4 bg-black text-white font-heading font-black text-sm uppercase flex items-center justify-between">
          <span>GLOBAL PURSE TRACKER TABLE (PRD SPECIFICATION)</span>
          <span className="font-mono text-xs text-[#FFD600]">EQUAL £500M ALLOCATION</span>
        </div>
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#FFF8E7] border-b-2 border-black text-black font-black uppercase text-[11px]">
              <th className="p-3 border-r-2 border-black">#</th>
              <th className="p-3 border-r-2 border-black">FRANCHISE</th>
              <th className="p-3 border-r-2 border-black text-right">STARTING</th>
              <th className="p-3 border-r-2 border-black text-right">SPENT</th>
              <th className="p-3 border-r-2 border-black text-right">REMAINING PURSE</th>
              <th className="p-3 border-r-2 border-black text-center">SQUAD SIZE</th>
              <th className="p-3 border-r-2 border-black text-center">QUALIFICATION</th>
              {isAdmin && <th className="p-3 text-center">ADMIN ASSIGNMENT</th>}
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => {
              const spent = Number((team.startingBalance - team.remainingBalance).toFixed(1));
              const squadCount = team.boughtPlayers.length;
              const isFull = squadCount >= team.maxSquadSize;

              return (
                <tr
                  key={team.id}
                  onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                  className={`border-b-2 border-black/15 hover:bg-[#FFF8E7] cursor-pointer transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF0]'
                  }`}
                >
                  <td className="p-3 font-bold border-r-2 border-black/10">{idx + 1}</td>
                  <td className="p-3 font-heading font-black text-sm uppercase border-r-2 border-black/10 flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 inline-block border border-black"
                      style={{ backgroundColor: team.color }}
                    />
                    <span>{team.teamName}</span>
                  </td>
                  <td className="p-3 text-right border-r-2 border-black/10 text-black/70">
                    £{team.startingBalance}M
                  </td>
                  <td className="p-3 text-right border-r-2 border-black/10 font-bold text-red-600">
                    £{spent}M
                  </td>
                  <td className="p-3 text-right border-r-2 border-black/10 font-black text-sm">
                    <span className="bg-[#B6FF3B] px-2 py-0.5 border border-black text-black">
                      £{team.remainingBalance}M
                    </span>
                  </td>
                  <td className="p-3 text-center border-r-2 border-black/10 font-bold">
                    <span
                      className={`px-2 py-0.5 border border-black font-black ${
                        isFull
                          ? 'bg-[#FF5CA8] text-black'
                          : squadCount >= team.minSquadSize
                          ? 'bg-[#B6FF3B] text-black'
                          : 'bg-[#FFD600] text-black'
                      }`}
                    >
                      {squadCount} / {team.maxSquadSize}
                    </span>
                  </td>
                  <td className="p-3 text-center border-r-2 border-black/10 font-black">
                    <span
                      className={`px-2 py-0.5 border border-black uppercase text-[10px] ${
                        team.qualificationStatus === 'TOP_4'
                          ? 'bg-[#3D5AFE] text-white'
                          : team.qualificationStatus === 'BOTTOM_6'
                          ? 'bg-[#FF6D00] text-white'
                          : 'bg-black/10 text-black'
                      }`}
                    >
                      {team.qualificationStatus}
                    </span>
                  </td>
                  {isAdmin && (
                    <td
                      className="p-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={team.qualificationStatus}
                        onChange={(e) =>
                          handleQualificationChange(
                            team.id,
                            e.target.value as QualificationStatus
                          )
                        }
                        className="py-1 px-2 border-2 border-black bg-white font-bold text-[10px] uppercase cursor-pointer"
                      >
                        <option value="UNASSIGNED">UNASSIGNED</option>
                        <option value="TOP_4">TOP 4 (BUYERS)</option>
                        <option value="BOTTOM_6">BOTTOM 6 (SELLERS)</option>
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 10 Franchise Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const spent = Number((team.startingBalance - team.remainingBalance).toFixed(1));
          const isExpanded = expandedTeamId === team.id;

          return (
            <div
              key={team.id}
              className="bg-white border-4 border-black brutal-shadow flex flex-col justify-between p-5 space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b-2 border-black">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 border-2 border-black brutal-shadow-sm flex items-center justify-center font-heading font-black text-white text-lg"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.teamName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-lg text-black uppercase">
                        {team.teamName}
                      </h3>
                      <div className="font-mono text-[10px] text-black/70 font-bold uppercase">
                        {team.ownerName || 'Franchise Partner'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-black px-2 py-0.5 border border-black uppercase ${
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

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 my-4 font-mono text-xs">
                  <div className="bg-[#FFF8E7] border-2 border-black p-2.5">
                    <div className="text-[10px] text-black/60 font-black">REMAINING PURSE</div>
                    <div className="text-xl font-heading font-black text-black mt-0.5">
                      £{team.remainingBalance}M
                    </div>
                  </div>
                  <div className="bg-[#FFF8E7] border-2 border-black p-2.5">
                    <div className="text-[10px] text-black/60 font-black">SQUAD COUNT</div>
                    <div className="text-xl font-heading font-black text-black mt-0.5">
                      {team.boughtPlayers.length} / {team.maxSquadSize}
                    </div>
                  </div>
                </div>

                {/* Squad Roster Preview */}
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-black/70 pb-1">
                    <span>ACQUIRED STARS ({team.boughtPlayers.length})</span>
                    <span>PRICE</span>
                  </div>

                  {team.boughtPlayers.length === 0 ? (
                    <div className="p-3 bg-[#FFFDF0] border-2 border-black text-center text-[11px] text-black/60 font-bold">
                      No players signed yet.
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {team.boughtPlayers.map((player) => (
                        <div
                          key={player.playerId}
                          className="flex items-center justify-between p-2 bg-[#FFFDF0] border border-black/30 hover:border-black transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-black text-[10px] bg-black text-white px-1">
                              {player.position}
                            </span>
                            <span className="font-heading font-black text-xs uppercase truncate">
                              {player.playerName}
                            </span>
                          </div>
                          <span className="font-black text-xs text-black bg-[#FFD600] px-1.5 py-0.2 border border-black flex-shrink-0">
                            £{player.price}M
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t-2 border-black flex items-center justify-between font-mono text-[10px] font-black text-black/70">
                <span>TOTAL SPENT: £{spent}M</span>
                <span>MAX: 15 PLAYERS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
