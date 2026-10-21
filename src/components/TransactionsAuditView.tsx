import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext.tsx';
import type { TransactionRecord } from '../types/auction.ts';
import { Download, Search, Filter, Shield, Edit3, ArrowRight } from 'lucide-react';

export const TransactionsAuditView: React.FC = () => {
  const { state, currentUser, editSale } = useAuction();
  const isAdmin = currentUser?.role === 'admin';

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingSale, setEditingSale] = useState<{
    playerId: string;
    playerName: string;
    currentTeamId: string;
    currentPrice: number;
  } | null>(null);

  const [editPrice, setEditPrice] = useState<number>(50);
  const [editTeamId, setEditTeamId] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  const transactions = state?.transactions || [];
  const teams = state?.teams || [];
  const soldPlayers = state?.players.filter((p) => p.status === 'sold' || p.status === 'transferred') || [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.transactionType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPlayer = tx.playerName.toLowerCase().includes(q);
        const matchBuyer = tx.buyerTeamName.toLowerCase().includes(q);
        const matchSeller = tx.sellerTeamName?.toLowerCase().includes(q);
        if (!matchPlayer && !matchBuyer && !matchSeller) return false;
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  const handleOpenEdit = (p: typeof soldPlayers[0]) => {
    if (!isAdmin || !p.soldToTeamId) return;
    setEditingSale({
      playerId: p.id,
      playerName: p.name,
      currentTeamId: p.soldToTeamId,
      currentPrice: p.soldPrice || p.basePrice,
    });
    setEditTeamId(p.soldToTeamId);
    setEditPrice(p.soldPrice || p.basePrice);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingSale) return;
    setEditError(null);

    const res = await editSale(editingSale.playerId, editTeamId, editPrice);
    if (res.success) {
      setEditingSale(null);
    } else {
      setEditError(res.error || 'Correction failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-4 border-black brutal-shadow-lg p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#B6FF3B] text-black px-2 py-0.5 border-2 border-black font-black text-xs uppercase">
              AUDIT LOG & RECORDS
            </span>
            <span className="text-xs text-black/70 font-bold uppercase">
              PRD SECTION 43 & 44 COMPLIANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black uppercase tracking-tight">
            TRANSACTION HISTORY & AUDIT
          </h1>
          <p className="text-xs sm:text-sm text-black/80 font-bold mt-1">
            Immutable log of auction hammer purchases, transfer market contracts, and administrative adjustments.
          </p>
        </div>

        {/* CSV Export Button */}
        <a
          href="/api/export-csv"
          download="moneyball-transactions.csv"
          className="px-4 py-2.5 bg-[#FFD600] hover:bg-black hover:text-white text-black font-black text-xs uppercase border-3 border-black brutal-shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV AUDIT</span>
        </a>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-4 border-black brutal-shadow p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search player or team..."
            className="w-full pl-9 pr-3 py-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black uppercase text-black/70">TYPE:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 py-2 px-2 bg-[#FFF8E7] border-2 border-black font-bold focus:outline-none"
          >
            <option value="all">ALL TRANSACTION TYPES</option>
            <option value="AUCTION">AUCTION PURCHASES</option>
            <option value="TRANSFER">TRANSFERS</option>
            <option value="ADMIN_CORRECTION">ADMIN CORRECTIONS</option>
          </select>
        </div>

        <div className="flex items-center justify-between bg-[#FFF8E7] border-2 border-black px-3 py-2 font-black">
          <span>TOTAL LOGGED:</span>
          <span className="bg-[#B6FF3B] px-2 py-0.5 border border-black">
            {filteredTransactions.length} ENTRIES
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border-4 border-black brutal-shadow overflow-x-auto font-mono">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black text-white font-black uppercase text-[11px]">
              <th className="p-3 border-r border-white/20">TIMESTAMP</th>
              <th className="p-3 border-r border-white/20">TYPE</th>
              <th className="p-3 border-r border-white/20">PLAYER</th>
              <th className="p-3 border-r border-white/20">FROM</th>
              <th className="p-3 border-r border-white/20">TO (BUYER)</th>
              <th className="p-3 border-r border-white/20 text-right">AMOUNT</th>
              <th className="p-3">PROTOCOL NOTES</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-black/60 font-bold">
                  No transaction records recorded yet.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => (
                <tr
                  key={tx.id}
                  className={`border-b-2 border-black/10 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FFFDF0]'}`}
                >
                  <td className="p-3 border-r border-black/10 text-black/70 whitespace-nowrap">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-3 border-r border-black/10">
                    <span
                      className={`px-2 py-0.5 border border-black uppercase text-[10px] font-black ${
                        tx.transactionType === 'AUCTION'
                          ? 'bg-[#B6FF3B] text-black'
                          : tx.transactionType === 'TRANSFER'
                          ? 'bg-[#00E5FF] text-black'
                          : 'bg-[#FFD600] text-black'
                      }`}
                    >
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="p-3 font-heading font-black text-sm uppercase border-r border-black/10">
                    {tx.playerName}
                  </td>
                  <td className="p-3 border-r border-black/10 font-bold text-black/70">
                    {tx.sellerTeamName || 'Auction Pool'}
                  </td>
                  <td className="p-3 border-r border-black/10 font-heading font-black uppercase">
                    {tx.buyerTeamName}
                  </td>
                  <td className="p-3 border-r border-black/10 text-right font-heading font-black text-sm text-black">
                    £{tx.amount}M
                  </td>
                  <td className="p-3 text-[11px] text-black/80 font-bold truncate max-w-xs">
                    {tx.notes || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PRD Section 44: Admin Corrections Panel */}
      {isAdmin && soldPlayers.length > 0 && (
        <div className="bg-white border-4 border-black brutal-shadow p-5 font-mono space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-black" />
              <h2 className="text-lg font-heading font-black uppercase text-black">
                ADMIN CORRECTIONS CONSOLE (PRD SECTION 44)
              </h2>
            </div>
            <span className="text-xs text-black/70 font-bold">
              Fix accidental gavel sales or adjust amounts with atomic purse rebalancing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {soldPlayers.slice(0, 9).map((p) => (
              <div
                key={p.id}
                className="p-3 bg-[#FFF8E7] border-2 border-black flex items-center justify-between"
              >
                <div>
                  <div className="font-heading font-black uppercase text-xs">{p.name}</div>
                  <div className="text-[10px] text-black/70">
                    £{p.soldPrice}M · {p.soldToTeamName}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(p)}
                  className="px-2.5 py-1 bg-black text-white hover:bg-[#3D5AFE] font-black text-[10px] uppercase border border-black flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>CORRECT</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Correction Modal */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fadeIn font-mono">
          <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b-2 border-black">
              <div>
                <span className="bg-[#FFD600] px-2 py-0.5 border border-black font-black text-[10px] uppercase">
                  ADMIN TRANSACTION CORRECTION
                </span>
                <h3 className="text-2xl font-heading font-black uppercase text-black mt-1">
                  {editingSale.playerName}
                </h3>
              </div>
              <button
                onClick={() => setEditingSale(null)}
                className="p-1 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-black uppercase mb-1">REASSIGN BUYING FRANCHISE:</label>
                <select
                  value={editTeamId}
                  onChange={(e) => setEditTeamId(e.target.value)}
                  className="w-full p-2.5 bg-[#FFF8E7] border-2 border-black font-bold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName} (Purse: £{t.remainingBalance}M)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black uppercase mb-1">CORRECTED FINAL PRICE (£M):</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-heading font-black">£</span>
                  <input
                    type="number"
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full text-2xl font-heading font-black py-2 px-3 border-3 border-black bg-[#FFF8E7] focus:outline-none"
                  />
                  <span className="text-2xl font-heading font-black">M</span>
                </div>
              </div>

              {editError && (
                <div className="p-2 bg-red-100 border-2 border-red-600 text-red-700 font-bold">
                  {editError}
                </div>
              )}

              <p className="text-[11px] text-black/70 font-bold">
                Saving will atomically refund previous franchise, deduct new franchise, adjust squad counts, and log this change in the audit trail.
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setEditingSale(null)}
                  className="flex-1 py-2.5 border-2 border-black font-heading font-black uppercase bg-[#FFF8E7] hover:bg-black/10 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 bg-[#00C853] hover:bg-black text-white font-heading font-black uppercase border-2 border-black brutal-shadow-sm cursor-pointer transition-colors"
                >
                  APPLY CORRECTION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
