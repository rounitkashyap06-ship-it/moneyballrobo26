import React, { useState } from 'react';
import {
  LogOut,
  Shield,
  RefreshCw,
  Tv,
  UserCheck,
  Radio,
  ArrowRightLeft,
  Users,
  Layers,
  FileText,
  Gavel,
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';
import { AudioIndicator } from './AudioIndicator.tsx';

interface HeaderNavProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenQuickSwitch?: () => void;
  onToggleViewer?: () => void;
  isViewerMode?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab = 'auction',
  onSelectTab,
  onOpenQuickSwitch,
  onToggleViewer,
  isViewerMode = false,
}) => {
  const { state, currentUser, logout, refreshState, wsConnected } = useAuction();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userTeam = state?.teams.find((t) => t.id === currentUser?.teamId);

  const handleManualRefresh = async () => {
    soundEffects.playClick();
    setIsRefreshing(true);
    await refreshState();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const globalState = state?.globalState || 'AUCTION_LIVE';

  const getGlobalStateBadge = () => {
    switch (globalState) {
      case 'AUCTION_LIVE':
        return (
          <div className="bg-[#B6FF3B] text-black px-2.5 py-0.5 border-2 border-black brutal-shadow-sm font-mono text-[10px] font-black tracking-wider flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 bg-black inline-block animate-ping rounded-full" />
            <span>AUCTION LIVE</span>
          </div>
        );
      case 'TRANSFER_MARKET_LIVE':
        return (
          <div className="bg-[#00E5FF] text-black px-2.5 py-0.5 border-2 border-black brutal-shadow-sm font-mono text-[10px] font-black tracking-wider flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 bg-black inline-block animate-pulse rounded-full" />
            <span>TRANSFER MARKET OPEN</span>
          </div>
        );
      case 'AUCTION_CLOSED':
        return (
          <div className="bg-[#FFD600] text-black px-2.5 py-0.5 border-2 border-black brutal-shadow-sm font-mono text-[10px] font-black uppercase">
            AUCTION CLOSED
          </div>
        );
      case 'TRANSFER_MARKET_CLOSED':
        return (
          <div className="bg-[#FF5CA8] text-black px-2.5 py-0.5 border-2 border-black brutal-shadow-sm font-mono text-[10px] font-black uppercase">
            MARKET CLOSED
          </div>
        );
      default:
        return (
          <div className="bg-white text-black px-2.5 py-0.5 border-2 border-black brutal-shadow-sm font-mono text-[10px] font-black uppercase">
            EVENT SETUP
          </div>
        );
    }
  };

  const navItems = [
    { id: 'auction', label: 'LIVE AUCTION', icon: Gavel },
    { id: 'sets', label: 'PLAYER SETS (200)', icon: Layers },
    { id: 'teams', label: 'TEAMS & PURSE', icon: Users },
    { id: 'my_team', label: 'MY TEAM', icon: Shield },
    {
      id: 'transfer_market',
      label: 'TRANSFER MARKET',
      icon: ArrowRightLeft,
      badge: globalState === 'TRANSFER_MARKET_LIVE' ? 'LIVE' : undefined,
    },
    { id: 'transactions', label: 'TRANSACTIONS', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF8E7] border-b-4 border-black">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FFD600] border-2 border-black brutal-shadow-sm flex items-center justify-center flex-shrink-0">
            <span className="font-heading font-black text-lg text-black">M</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg sm:text-xl text-black tracking-tight uppercase">
                MONEYBALL '26
              </span>
              <span className="bg-[#3D5AFE] text-white font-mono text-[9px] font-black px-1.5 py-0.2 border border-black uppercase hidden sm:inline-block">
                OFFICIAL PLATFORM
              </span>
            </div>
            <p className="text-[10px] font-mono text-black/70 font-bold tracking-tight hidden md:block">
              AUCTION & POST-LEAGUE TRANSFER MARKET
            </p>
          </div>
        </div>

        {/* Center Live Status Badges */}
        <div className="hidden lg:flex items-center gap-2">
          {getGlobalStateBadge()}
        </div>

        {/* Right Controls & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AudioIndicator />

          {/* Viewer Projector Screen Button */}
          {onToggleViewer && (
            <button
              onClick={onToggleViewer}
              className="bg-[#B6FF3B] hover:bg-black hover:text-[#B6FF3B] text-black px-2.5 py-1.5 border-2 border-black brutal-shadow-sm font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              title="Projector / Big Screen Mode"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PROJECTOR</span>
            </button>
          )}

          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            className="p-1.5 bg-white hover:bg-[#FFF8E7] border-2 border-black brutal-shadow-sm text-black cursor-pointer transition-all"
            title="Refresh State"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* User Account / Switcher */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenQuickSwitch}
                className="bg-white hover:bg-[#FFF8E7] text-black border-2 border-black px-2.5 py-1 brutal-shadow-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                {currentUser.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-black" />
                ) : (
                  <div
                    className="w-3.5 h-3.5 border border-black"
                    style={{ backgroundColor: userTeam?.color || '#3D5AFE' }}
                  />
                )}
                <div className="text-left font-mono">
                  <div className="text-[10px] font-black uppercase leading-tight truncate max-w-[100px]">
                    {currentUser.role === 'admin' ? 'AUCTIONEER' : userTeam?.teamName}
                  </div>
                  {userTeam && (
                    <div className="text-[9px] text-[#00C853] font-black leading-tight">
                      £{userTeam.remainingBalance}M
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black brutal-shadow-sm text-black cursor-pointer transition-all"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenQuickSwitch}
              className="bg-[#FFD600] text-black border-2 border-black px-3 py-1 brutal-shadow-sm font-mono font-black text-xs uppercase cursor-pointer hover:bg-black hover:text-white transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Sub-Bar (PRD Section 46 & 47) */}
      <nav className="bg-white border-t-2 border-black px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 min-w-max py-1 font-mono text-xs font-black">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab?.(item.id)}
                className={`px-3 sm:px-4 py-2 border-b-[3px] transition-all cursor-pointer flex items-center gap-1.5 uppercase ${
                  isActive
                    ? 'border-black text-black bg-[#FFF8E7]'
                    : 'border-transparent text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-[#00E5FF] text-black px-1.5 py-0.2 text-[9px] border border-black uppercase font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
