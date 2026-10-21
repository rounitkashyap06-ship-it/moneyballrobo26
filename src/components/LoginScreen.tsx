import React, { useState } from 'react';
import { Lock, User, ArrowRight, Video, AlertCircle, Tv, Shield } from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';
import { CyberButton } from './CyberButton.tsx';

interface LoginScreenProps {
  onReplayIntro?: () => void;
  onOpenViewer?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onReplayIntro, onOpenViewer }) => {
  const { login, state } = useAuction();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please provide both username and password.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    const res = await login(username, password);
    setSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your team login.');
    }
  };

  const handleFillCredentials = (u: string, p: string) => {
    soundEffects.playClick();
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  const quickTeams = [
    { name: 'Titans', user: 'titans', pass: 'password123', color: '#3D5AFE' },
    { name: 'Phoenix', user: 'phoenix', pass: 'password123', color: '#FF3D00' },
    { name: 'Warriors', user: 'warriors', pass: 'password123', color: '#00C853' },
    { name: 'Galacticos', user: 'galacticos', pass: 'password123', color: '#FFD600' },
    { name: 'Apex FC', user: 'apexfc', pass: 'password123', color: '#D500F9' },
    { name: 'Vanguard', user: 'vanguard', pass: 'password123', color: '#00E5FF' },
  ];

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 sm:p-6 relative">
      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white border-4 border-black brutal-shadow-lg p-6 sm:p-8">
          {/* Top Brand Crest */}
          <div className="text-center mb-6">
            <div className="inline-flex w-16 h-16 bg-[#FFD600] border-3 border-black brutal-shadow-sm items-center justify-center mb-3">
              <span className="font-heading font-black text-3xl text-black">M</span>
            </div>

            <div className="block">
              <span className="inline-block bg-black text-[#FFD600] px-3 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider mb-2 rotate-[-1deg]">
                MONEYBALL '26 AUCTION & TRANSFER PLATFORM
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tight text-black leading-none">
              ENTER THE ARENA
            </h1>
            <p className="text-xs text-black/70 mt-1 font-mono font-bold">
              10 Franchises · £500M Starting Purse · 200 Top-flight Players
            </p>
          </div>

          {/* Error Box */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#FF5CA8] border-2 border-black text-black text-xs flex items-center gap-2 font-mono font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs uppercase font-black text-black mb-1">
                Franchise ID / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. titans, phoenix, or admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold placeholder-black/50 focus:outline-none focus:bg-white focus:shadow-[3px_3px_0_#000]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-black text-black mb-1">
                Security Passkey
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FFF8E7] border-2 border-black text-xs text-black font-bold placeholder-black/50 focus:outline-none focus:bg-white focus:shadow-[3px_3px_0_#000]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#3D5AFE] hover:bg-black text-white font-heading font-black text-sm uppercase tracking-wider border-3 border-black brutal-shadow transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitting ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t-2 border-black font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-black/70">
                1-CLICK CREDENTIALS:
              </span>
              <button
                type="button"
                onClick={() => handleFillCredentials('admin', 'admin123')}
                className="text-[10px] font-black bg-[#FFD600] px-2 py-0.5 border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                AUCTIONEER ADMIN
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {quickTeams.map((team) => (
                <button
                  key={team.user}
                  type="button"
                  onClick={() => handleFillCredentials(team.user, team.pass)}
                  className="p-1.5 bg-[#FFFDF0] hover:bg-black hover:text-white border border-black text-[10px] font-bold text-left truncate transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span
                    className="w-2.5 h-2.5 inline-block border border-black flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="truncate uppercase font-black">{team.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Projector Mode Launch */}
          {onOpenViewer && (
            <div className="mt-4 pt-4 border-t-2 border-dashed border-black/30">
              <button
                type="button"
                onClick={onOpenViewer}
                className="w-full py-2.5 bg-[#B6FF3B] hover:bg-black hover:text-[#B6FF3B] text-black font-mono font-black text-xs uppercase tracking-wider border-2 border-black brutal-shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Tv className="w-4 h-4" />
                <span>LAUNCH BIG SCREEN PROJECTOR MODE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
