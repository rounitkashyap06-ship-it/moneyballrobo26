import React from 'react';
import { X, Shield, UserCheck, Tv } from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';

interface QuickAccountSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectViewer?: () => void;
  isViewerMode?: boolean;
}

export const QuickAccountSwitcher: React.FC<QuickAccountSwitcherProps> = ({
  isOpen,
  onClose,
  onSelectViewer,
  isViewerMode = false,
}) => {
  const { state, currentUser, login } = useAuction();

  if (!isOpen) return null;

  const handleSwitch = async (username: string, pass: string) => {
    soundEffects.playClick();
    await login(username, pass);
    onClose();
  };

  const teams = state?.teams || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn font-mono">
      <div className="relative w-full max-w-md bg-white border-4 border-black p-6 sm:p-7 brutal-shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 bg-[#FF5CA8] hover:bg-black hover:text-white border-2 border-black text-black font-bold cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 pb-2 border-b-2 border-black">
          <div className="inline-block bg-[#FFD600] px-2 py-0.5 text-[10px] font-black uppercase border border-black mb-1">
            ACCOUNT QUICK SWITCHER
          </div>
          <h3 className="text-xl font-heading text-black uppercase">
            SWITCH ROLE / FRANCHISE
          </h3>
          <p className="text-xs text-black/70 font-bold">
            ACTIVE: <span className="bg-black text-[#FFD600] px-1">{currentUser?.username || 'Guest'}</span> ({currentUser?.role})
          </p>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {/* Admin option */}
          <button
            onClick={() => handleSwitch('admin', 'admin123')}
            className={`w-full p-2.5 border-2 border-black flex items-center justify-between text-left transition-all cursor-pointer brutal-shadow-sm ${
              currentUser?.role === 'admin' && !isViewerMode
                ? 'bg-[#FFD600] text-black font-bold'
                : 'bg-[#FFF8E7] text-black hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-[#FFD600] border border-black flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-heading font-black uppercase text-black">AUCTIONEER ADMIN</div>
                <div className="text-[10px] text-black/70 font-bold">Full Gavel, Sets & Market Control</div>
              </div>
            </div>
            {currentUser?.role === 'admin' && !isViewerMode && (
              <UserCheck className="w-4 h-4 text-black" />
            )}
          </button>

          {/* Projector Broadcast Option */}
          {onSelectViewer && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onSelectViewer();
                onClose();
              }}
              className={`w-full p-2.5 border-2 border-black flex items-center justify-between text-left transition-all cursor-pointer brutal-shadow-sm ${
                isViewerMode
                  ? 'bg-[#B6FF3B] text-black font-bold'
                  : 'bg-[#FFF8E7] text-black hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-[#B6FF3B] border border-black flex items-center justify-center font-bold">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-heading font-black uppercase text-black">PROJECTOR SCREEN MODE</div>
                  <div className="text-[10px] text-black/70 font-bold">Spectator View with Team Budgets</div>
                </div>
              </div>
              {isViewerMode && <UserCheck className="w-4 h-4 text-black" />}
            </button>
          )}

          {/* 10 Teams */}
          <div className="pt-2">
            <div className="text-[10px] font-black uppercase text-black/60 pb-1">
              10 PARTICIPATING FRANCHISES:
            </div>
            <div className="space-y-1.5">
              {teams.map((t) => {
                const isSelected = currentUser?.teamId === t.id && !isViewerMode;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSwitch(t.username, 'password123')}
                    className={`w-full p-2 border-2 border-black flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected ? 'bg-black text-white' : 'bg-[#FFFDF0] hover:bg-white text-black'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="w-6 h-6 border border-black flex items-center justify-center font-heading font-black text-xs text-white"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.teamName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-heading font-black uppercase truncate">
                          {t.teamName}
                        </div>
                        <div className="text-[9px] opacity-75">
                          Purse: £{t.remainingBalance}M · Squad: {t.boughtPlayers.length}/15
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[9px] font-black px-1 border border-black uppercase ${
                          t.qualificationStatus === 'TOP_4'
                            ? 'bg-[#3D5AFE] text-white'
                            : t.qualificationStatus === 'BOTTOM_6'
                            ? 'bg-[#FF6D00] text-white'
                            : 'bg-black/10 text-black'
                        }`}
                      >
                        {t.qualificationStatus}
                      </span>
                      {isSelected && <UserCheck className="w-3.5 h-3.5 text-[#B6FF3B]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
