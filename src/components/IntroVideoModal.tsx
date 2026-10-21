import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';
import { CyberButton } from './CyberButton.tsx';

interface IntroVideoModalProps {
  onComplete: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({ onComplete }) => {
  const { state, isMuted, toggleMute } = useAuction();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const videoUrl =
    state?.config.introVideoUrl ||
    'https://assets.mixkit.co/videos/preview/mixkit-football-player-running-on-field-under-the-rain-41584-large.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      onComplete();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete, isMuted]);

  const togglePlay = () => {
    soundEffects.playClick();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSkip = () => {
    soundEffects.playClick();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 animate-fadeIn">
      {/* Main Video Frame */}
      <div className="relative w-full max-w-4xl bg-white border-4 border-black brutal-shadow-xl flex flex-col font-mono">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#FFF8E7] border-b-4 border-black">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#FF5CA8] border border-black inline-block animate-pulse"></span>
            <div className="text-xs uppercase tracking-widest text-black font-black">
              ROBOFIESTA '26 /// MONEYBALL INTRO
            </div>
          </div>

          {/* Skip Button */}
          <CyberButton
            title="SKIP INTRO"
            onClick={handleSkip}
            rightIcon={<ChevronRight className="w-4 h-4" />}
            size="sm"
            variant="primary"
          />
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            className="w-full h-full object-cover filter contrast-115"
            onClick={togglePlay}
          />

          {/* Overlay Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 border-2 border-black p-2.5 brutal-shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1.5 bg-[#FFD600] hover:bg-black hover:text-white border-2 border-black text-black cursor-pointer font-bold"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  toggleMute();
                }}
                className="p-1.5 bg-[#FFF8E7] hover:bg-black hover:text-white border-2 border-black text-black cursor-pointer font-bold"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-xs font-black uppercase text-black">
              FOOTBALL AUCTION SIMULATION
            </div>
          </div>
        </div>

        {/* Brutalist Progress Bar */}
        <div className="w-full h-2.5 bg-[#FFF8E7] border-t-2 border-black">
          <div
            className="h-full bg-[#FFD600] border-r-2 border-black transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
