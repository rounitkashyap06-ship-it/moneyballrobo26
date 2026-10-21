import React, { useState } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext.tsx';
import { HeaderNav } from './components/HeaderNav.tsx';
import { IntroVideoModal } from './components/IntroVideoModal.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { PreAuctionView } from './components/PreAuctionView.tsx';
import { UserLiveAuctionView } from './components/UserLiveAuctionView.tsx';
import { AdminAuctionView } from './components/AdminAuctionView.tsx';
import { ViewerSimulationView } from './components/ViewerSimulationView.tsx';
import { PlayerSetsView } from './components/PlayerSetsView.tsx';
import { TeamsView } from './components/TeamsView.tsx';
import { MyTeamView } from './components/MyTeamView.tsx';
import { TransferMarketView } from './components/TransferMarketView.tsx';
import { TransactionsAuditView } from './components/TransactionsAuditView.tsx';
import { SoldPoppingModal } from './components/SoldPoppingModal.tsx';
import { UnsoldPoppingModal } from './components/UnsoldPoppingModal.tsx';
import { QuickAccountSwitcher } from './components/QuickAccountSwitcher.tsx';
import { BackgroundSpotlight } from './components/BackgroundSpotlight.tsx';
import { Shield, Eye, Tv } from 'lucide-react';

type NavTab = 'auction' | 'sets' | 'teams' | 'my_team' | 'transfer_market' | 'transactions';

const MainAuctionContent: React.FC = () => {
  const {
    state,
    currentUser,
    hasSeenIntro,
    markIntroSeen,
    replayIntro,
    soldPopup,
    dismissSoldPopup,
    unsoldPopup,
    dismissUnsoldPopup,
    loading,
  } = useAuction();

  const [currentTab, setCurrentTab] = useState<NavTab>('auction');
  const [adminViewMode, setAdminViewMode] = useState<'admin_desk' | 'user_simulation' | 'viewer_broadcast'>('admin_desk');
  const [isViewerScreen, setIsViewerScreen] = useState<boolean>(false);
  const [showQuickSwitch, setShowQuickSwitch] = useState<boolean>(false);

  // 1. First Visit: Intro Video
  if (!hasSeenIntro) {
    return <IntroVideoModal onComplete={markIntroSeen} />;
  }

  // 2. Loading State: Neo-Brutalist Blocky Preloader
  if (loading && !state) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center text-black font-mono text-sm relative">
        <BackgroundSpotlight />
        <div className="flex flex-col items-center gap-4 relative z-10 bg-white border-4 border-black brutal-shadow-lg p-8 text-center max-w-sm">
          <div className="w-12 h-12 bg-[#FFD600] border-3 border-black animate-spin flex items-center justify-center font-heading font-black text-xl">
            M
          </div>
          <div>
            <div className="font-heading font-black text-xl text-black uppercase">
              MONEYBALL '26
            </div>
            <div className="text-xs text-black/80 font-mono font-bold mt-1">
              LOADING AUCTION ENVIRONMENT...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Dedicated Projector / Big Screen Mode (PRD Section 4.3 & 15)
  if (isViewerScreen || adminViewMode === 'viewer_broadcast') {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex flex-col text-black relative">
        <BackgroundSpotlight />
        <div className="relative z-10 flex flex-col min-h-screen">
          <ViewerSimulationView
            onExitViewer={() => {
              setIsViewerScreen(false);
              setAdminViewMode('admin_desk');
            }}
          />
          {soldPopup && (
            <SoldPoppingModal
              notification={soldPopup}
              onDismiss={dismissSoldPopup}
            />
          )}
          {unsoldPopup && (
            <UnsoldPoppingModal
              notification={unsoldPopup}
              onDismiss={dismissUnsoldPopup}
            />
          )}
        </div>
      </div>
    );
  }

  // 4. Not Logged In: Login Screen (With option to launch Viewer Screen)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex flex-col relative text-black">
        <BackgroundSpotlight />
        <div className="relative z-10 flex flex-col min-h-screen">
          <HeaderNav
            activeTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab as NavTab)}
            onOpenQuickSwitch={() => setShowQuickSwitch(true)}
            onToggleViewer={() => setIsViewerScreen(true)}
            onReplayIntro={replayIntro}
            isViewerMode={false}
          />
          <LoginScreen
            onReplayIntro={replayIntro}
            onOpenViewer={() => setIsViewerScreen(true)}
          />
          <QuickAccountSwitcher
            isOpen={showQuickSwitch}
            onClose={() => setShowQuickSwitch(false)}
            onSelectViewer={() => setIsViewerScreen(true)}
            isViewerMode={false}
          />
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const auctionStatus = state?.status || 'not_started';

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col text-black relative font-mono">
      {/* Background Interactive Spotlight Grid */}
      <BackgroundSpotlight />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Header with PRD Navigation */}
        <HeaderNav
          activeTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab as NavTab)}
          onOpenQuickSwitch={() => setShowQuickSwitch(true)}
          onToggleViewer={() => setIsViewerScreen(true)}
          onReplayIntro={replayIntro}
          isViewerMode={false}
        />

        {/* Admin Mode Switcher Bar (when on Live Auction tab) */}
        {isAdmin && currentTab === 'auction' && (
          <div className="bg-[#FFD600] border-b-4 border-black px-4 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-black font-bold">
                <Shield className="w-4 h-4" />
                <span className="font-black uppercase tracking-wider">AUCTIONEER CONSOLE:</span>
                <span className="text-black/80">Master gavel, verbal bidding & set transitions</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-black uppercase font-black">DISPLAY MODE:</span>
                <div className="inline-flex gap-1">
                  <button
                    onClick={() => setAdminViewMode('admin_desk')}
                    className={`px-3 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      adminViewMode === 'admin_desk'
                        ? 'bg-black text-white brutal-shadow-sm'
                        : 'bg-white text-black hover:bg-[#FFF8E7]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>ADMIN DESK</span>
                  </button>

                  <button
                    onClick={() => setAdminViewMode('user_simulation')}
                    className={`px-3 py-1 font-mono text-xs font-black uppercase border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      adminViewMode === 'user_simulation'
                        ? 'bg-black text-white brutal-shadow-sm'
                        : 'bg-white text-black hover:bg-[#FFF8E7]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>PARTICIPANT VIEW</span>
                  </button>

                  <button
                    onClick={() => setAdminViewMode('viewer_broadcast')}
                    className="px-3 py-1 font-mono text-xs font-black uppercase border-2 border-black bg-white hover:bg-[#B6FF3B] text-black transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>PROJECTOR SCREEN</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Tab Router */}
        <main className="flex-1 pb-16">
          {currentTab === 'auction' && (
            auctionStatus === 'not_started' ? (
              <PreAuctionView onGoToAdmin={() => setAdminViewMode('admin_desk')} />
            ) : isAdmin && adminViewMode === 'admin_desk' ? (
              <AdminAuctionView />
            ) : (
              <UserLiveAuctionView isParticipantOnly={adminViewMode === 'user_simulation' || !isAdmin} />
            )
          )}

          {currentTab === 'sets' && <PlayerSetsView />}

          {currentTab === 'teams' && <TeamsView />}

          {currentTab === 'my_team' && <MyTeamView />}

          {currentTab === 'transfer_market' && <TransferMarketView />}

          {currentTab === 'transactions' && <TransactionsAuditView />}
        </main>

        {/* SOLD POPPING MODAL: Synchronized across all screens */}
        {soldPopup && (
          <SoldPoppingModal
            notification={soldPopup}
            onDismiss={dismissSoldPopup}
          />
        )}

        {/* UNSOLD POPPING MODAL: Synchronized across all screens */}
        {unsoldPopup && (
          <UnsoldPoppingModal
            notification={unsoldPopup}
            onDismiss={dismissUnsoldPopup}
          />
        )}

        {/* Fast Account Switcher */}
        <QuickAccountSwitcher
          isOpen={showQuickSwitch}
          onClose={() => setShowQuickSwitch(false)}
          onSelectViewer={() => setIsViewerScreen(true)}
          isViewerMode={isViewerScreen}
        />

        {/* Global Footer */}
        <footer className="w-full bg-white border-t-4 border-black py-6 text-xs text-black font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-black">
              <span className="font-heading text-sm">MONEYBALL '26</span>
              <span>///</span>
              <span className="bg-[#FFD600] px-1.5 py-0.5 border border-black">ROBOFIESTA</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-black/70 font-bold uppercase text-[10px]">
              <span>10 FRANCHISES</span>
              <span>·</span>
              <span>£500M EQUAL PURSES</span>
              <span>·</span>
              <span>200 PLAYER POOL</span>
              <span>·</span>
              <span>REAL-TIME VERBAL AUCTION</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuctionProvider>
      <MainAuctionContent />
    </AuctionProvider>
  );
}
