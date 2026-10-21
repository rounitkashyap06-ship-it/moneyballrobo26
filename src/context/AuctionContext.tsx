import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type {
  AuctionState,
  AuthUser,
  SoldNotification,
  UnsoldNotification,
  AuctionConfig,
  GlobalEventState,
  QualificationStatus,
  CallStage,
} from '../types/auction.ts';
import { soundEffects } from '../utils/audio.ts';
import confetti from 'canvas-confetti';

interface AuctionContextType {
  state: AuctionState | null;
  currentUser: AuthUser | null;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  soldPopup: SoldNotification | null;
  unsoldPopup: UnsoldNotification | null;
  isMuted: boolean;
  hasSeenIntro: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  markIntroSeen: () => void;
  replayIntro: () => void;
  toggleMute: () => void;
  dismissSoldPopup: () => void;
  dismissUnsoldPopup: () => void;
  refreshState: () => Promise<void>;
  // Global & Auction Controls
  startAuction: () => Promise<boolean>;
  pauseAuction: () => Promise<boolean>;
  setGlobalState: (globalState: GlobalEventState) => Promise<boolean>;
  setQualification: (teamId: string, qualificationStatus: QualificationStatus) => Promise<boolean>;
  recordBid: (amount: number, teamId: string) => Promise<{ success: boolean; error?: string }>;
  setCallStage: (callStage: CallStage) => Promise<boolean>;
  setActiveSet: (setId: number) => Promise<boolean>;
  setPlayer: (playerId: string) => Promise<boolean>;
  nextPlayer: () => Promise<boolean>;
  prevPlayer: () => Promise<boolean>;
  sellPlayer: (playerId: string, teamId: string, soldPrice: number) => Promise<{ success: boolean; error?: string }>;
  markUnsold: (playerId: string) => Promise<{ success: boolean; error?: string }>;
  editSale: (playerId: string, newTeamId: string, newSoldPrice: number) => Promise<{ success: boolean; error?: string }>;
  resetAuction: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateConfig: (config: Partial<AuctionConfig>) => Promise<boolean>;
  // Transfer Market Controls
  sendTransferOffer: (playerId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  counterTransferOffer: (offerId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  acceptTransferOffer: (offerId: string) => Promise<{ success: boolean; error?: string }>;
  rejectTransferOffer: (offerId: string) => Promise<{ success: boolean; error?: string }>;
  withdrawTransferOffer: (offerId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuctionContext = createContext<AuctionContextType | null>(null);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuctionState | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('moneyball_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(() => {
    return localStorage.getItem('moneyball_intro_seen') === 'true';
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [soldPopup, setSoldPopup] = useState<SoldNotification | null>(null);
  const [unsoldPopup, setUnsoldPopup] = useState<UnsoldNotification | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const dismissSoldPopup = useCallback(() => {
    setSoldPopup(null);
  }, []);

  const dismissUnsoldPopup = useCallback(() => {
    setUnsoldPopup(null);
  }, []);

  // Trigger unsold notification
  const triggerUnsold = useCallback((notif: UnsoldNotification) => {
    setUnsoldPopup(notif);
  }, []);

  // Fetch current state via REST
  const refreshState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Failed to fetch state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger celebration explosion
  const triggerCelebration = useCallback((notif: SoldNotification) => {
    setSoldPopup(notif);
    soundEffects.playSoldCelebration();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFD600', '#3D5AFE', '#00C853', '#FFFFFF'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#FFD600', '#3D5AFE'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#00C853', '#FF3D00'],
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  }, []);

  // Native WebSocket real-time connection
  useEffect(() => {
    refreshState();

    let isUnmounted = false;

    function connectWs() {
      if (isUnmounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isUnmounted) return;
          setWsConnected(true);
          setError(null);
        };

        socket.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'INIT_STATE' || msg.type === 'STATE_UPDATE' || msg.type === 'state_update') {
              setState(msg.payload);
              setLoading(false);
            } else if (msg.type === 'BID_UPDATE') {
              setState((prev) => (prev ? { ...prev, liveBidding: msg.payload } : prev));
              soundEffects.playBidSound();
            } else if (msg.type === 'CALL_STAGE_UPDATE') {
              setState((prev) =>
                prev
                  ? {
                      ...prev,
                      liveBidding: { ...prev.liveBidding, callStage: msg.payload.callStage },
                    }
                  : prev
              );
              soundEffects.playGavelWarning();
            } else if (msg.type === 'player_sold') {
              triggerCelebration(msg.payload);
            } else if (msg.type === 'player_unsold') {
              triggerUnsold(msg.payload.notification || {
                id: `unsold-${Date.now()}`,
                playerId: msg.payload.player?.id || '',
                playerName: msg.payload.player?.name || 'Player',
                playerPhoto: msg.payload.player?.photo || '',
                club: msg.payload.player?.currentClub || '',
                position: msg.payload.player?.position || 'FWD',
                basePrice: msg.payload.player?.basePrice || 60,
                timestamp: new Date().toISOString(),
              });
            } else if (msg.type === 'AUCTION_RESET') {
              refreshState();
            }
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
          }
        };

        socket.onclose = () => {
          if (isUnmounted) return;
          setWsConnected(false);
          // Auto reconnect after 2 seconds
          reconnectTimeoutRef.current = window.setTimeout(connectWs, 2000);
        };

        socket.onerror = () => {
          if (isUnmounted) return;
          setWsConnected(false);
        };
      } catch {
        if (!isUnmounted) {
          reconnectTimeoutRef.current = window.setTimeout(connectWs, 3000);
        }
      }
    }

    connectWs();

    // Secondary fallback: Server-Sent Events (SSE)
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('state_update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setState(data);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing SSE state update:', err);
      }
    });

    eventSource.addEventListener('player_sold', (e: MessageEvent) => {
      try {
        const notif: SoldNotification = JSON.parse(e.data);
        triggerCelebration(notif);
      } catch (err) {
        console.error('Error parsing player_sold event:', err);
      }
    });

    eventSource.addEventListener('player_unsold', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.notification) {
          triggerUnsold(data.notification);
        }
      } catch (err) {
        console.error('Error parsing player_unsold event:', err);
      }
    });

    // Background sync fallback to keep all clients (projector, admin, franchises) 100% in sync
    const syncInterval = window.setInterval(() => {
      refreshState();
    }, 2500);

    return () => {
      isUnmounted = true;
      if (syncInterval) clearInterval(syncInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
      eventSource.close();
    };
  }, [refreshState, triggerCelebration]);

  // Sync user back into localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('moneyball_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('moneyball_user');
    }
  }, [currentUser]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setCurrentUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during login' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const markIntroSeen = () => {
    setHasSeenIntro(true);
    localStorage.setItem('moneyball_intro_seen', 'true');
  };

  const replayIntro = () => {
    setHasSeenIntro(false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
  };

  // ADMIN API ACTIONS
  const startAuction = async () => {
    return await setGlobalState('AUCTION_LIVE');
  };

  const pauseAuction = async () => {
    return await setGlobalState('AUCTION_CLOSED');
  };

  const setGlobalState = async (globalState: GlobalEventState) => {
    try {
      const res = await fetch('/api/admin/set-global-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ globalState }),
      });
      if (res.ok) {
        await refreshState();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const setQualification = async (teamId: string, qualificationStatus: QualificationStatus) => {
    try {
      const res = await fetch('/api/admin/set-qualification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, qualificationStatus }),
      });
      if (res.ok) {
        await refreshState();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const recordBid = async (amount: number, teamId: string) => {
    try {
      const res = await fetch('/api/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, teamId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Bid rejected' };
      }
      if (data.liveBidding) {
        setState((prev) => (prev ? { ...prev, liveBidding: data.liveBidding } : prev));
        soundEffects.playBidSound();
      }
      refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error placing bid' };
    }
  };

  const setCallStage = async (callStage: CallStage) => {
    try {
      setState((prev) =>
        prev
          ? {
              ...prev,
              liveBidding: { ...prev.liveBidding, callStage },
            }
          : prev
      );
      const res = await fetch('/api/admin/call-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callStage }),
      });
      refreshState();
      return res.ok;
    } catch {
      return false;
    }
  };

  const setActiveSet = async (setId: number) => {
    try {
      const res = await fetch('/api/admin/set-active-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId }),
      });
      refreshState();
      return res.ok;
    } catch {
      return false;
    }
  };

  const setPlayer = async (playerId: string) => {
    try {
      const res = await fetch('/api/admin/set-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      refreshState();
      return res.ok;
    } catch {
      return false;
    }
  };

  const nextPlayer = async () => {
    try {
      const res = await fetch('/api/admin/next-player', { method: 'POST' });
      refreshState();
      return res.ok;
    } catch {
      return false;
    }
  };

  const prevPlayer = async () => {
    try {
      const res = await fetch('/api/admin/prev-player', { method: 'POST' });
      refreshState();
      return res.ok;
    } catch {
      return false;
    }
  };

  const sellPlayer = async (playerId: string, teamId: string, soldPrice: number) => {
    try {
      const res = await fetch('/api/admin/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, soldPrice }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Could not sell player' };
      }
      refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const markUnsold = async (playerId: string) => {
    try {
      const res = await fetch('/api/admin/unsold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Could not mark unsold' };
      }
      if (data.notification) {
        triggerUnsold(data.notification);
      }
      refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const editSale = async (playerId: string, newTeamId: string, newSoldPrice: number) => {
    try {
      const res = await fetch('/api/admin/edit-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, newTeamId, newSoldPrice }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update transaction' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const resetAuction = async (password: string) => {
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Reset failed' };
      }
      await refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const updateConfig = async (config: Partial<AuctionConfig>) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // TRANSFER MARKET API ACTIONS
  const sendTransferOffer = async (playerId: string, amount: number) => {
    if (!currentUser?.teamId) {
      return { success: false, error: 'Must be logged in as a team' };
    }
    try {
      const res = await fetch('/api/transfer/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, buyerTeamId: currentUser.teamId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Offer submission failed' };
      }
      await refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error sending offer' };
    }
  };

  const counterTransferOffer = async (offerId: string, amount: number) => {
    if (!currentUser?.teamId) {
      return { success: false, error: 'Must be logged in as a team' };
    }
    try {
      const res = await fetch('/api/transfer/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, sellerTeamId: currentUser.teamId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Counter offer failed' };
      }
      await refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error sending counter offer' };
    }
  };

  const acceptTransferOffer = async (offerId: string) => {
    const teamId = currentUser?.teamId || 'admin';
    try {
      const res = await fetch('/api/transfer/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, teamId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Accept transfer failed' };
      }
      soundEffects.playSoldCelebration();
      await refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error confirming transfer' };
    }
  };

  const rejectTransferOffer = async (offerId: string) => {
    const teamId = currentUser?.teamId || 'admin';
    try {
      const res = await fetch('/api/transfer/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, teamId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Reject transfer failed' };
      }
      await refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error rejecting transfer' };
    }
  };

  const withdrawTransferOffer = async (offerId: string) => {
    if (!currentUser?.teamId) {
      return { success: false, error: 'Must be logged in as a buyer' };
    }
    try {
      const res = await fetch('/api/transfer/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, buyerTeamId: currentUser.teamId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Withdraw failed' };
      }
      await refreshState();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error withdrawing offer' };
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        state,
        currentUser,
        loading,
        error,
        wsConnected,
        soldPopup,
        unsoldPopup,
        isMuted,
        hasSeenIntro,
        login,
        logout,
        markIntroSeen,
        replayIntro,
        toggleMute,
        dismissSoldPopup,
        dismissUnsoldPopup,
        refreshState,
        startAuction,
        pauseAuction,
        setGlobalState,
        setQualification,
        recordBid,
        setCallStage,
        setActiveSet,
        setPlayer,
        nextPlayer,
        prevPlayer,
        sellPlayer,
        markUnsold,
        editSale,
        resetAuction,
        updateConfig,
        sendTransferOffer,
        counterTransferOffer,
        acceptTransferOffer,
        rejectTransferOffer,
        withdrawTransferOffer,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
