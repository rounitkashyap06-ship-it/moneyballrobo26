import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useAuction } from '../context/AuctionContext.tsx';
import { soundEffects } from '../utils/audio.ts';

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
    '/intro_video.mp4';

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
          // If browser blocks unmuted autoplay, mute and continue playing
          video.muted = true;
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

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

  const handleToggleMute = () => {
    soundEffects.playClick();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    toggleMute();
  };

  const handleSkip = () => {
    soundEffects.playClick();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 animate-fadeIn">
      {/* Main Video Frame */}
      <div className="relative w-full max-w-4xl bg-black border-4 border-black brutal-shadow-xl flex flex-col font-mono overflow-hidden">
        {/* Video Player Box */}
        <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            autoPlay
            className="w-full h-full object-contain bg-black cursor-pointer"
            onClick={togglePlay}
          />

          {/* Center Play Overlay when Paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
            >
              <div className="w-16 h-16 bg-[#FFD600] border-4 border-black brutal-shadow flex items-center justify-center">
                <Play className="w-8 h-8 fill-black text-black ml-1" />
              </div>
            </div>
          )}

          {/* Overlay Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 border-2 border-black p-2.5 brutal-shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1.5 bg-[#FFD600] hover:bg-black hover:text-white border-2 border-black text-black cursor-pointer font-bold"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1.5 bg-[#FFF8E7] hover:bg-black hover:text-white border-2 border-black text-black cursor-pointer font-bold flex items-center gap-1.5 px-2"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="text-[10px] font-black">{isMuted ? 'MUTED' : 'LIVE'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase text-black hidden md:inline-block">
                MONEYBALL '26 // RETRO ARENA INTRO
              </span>
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 bg-[#FFD600] hover:bg-black hover:text-white text-black font-mono font-black text-xs uppercase border-2 border-black flex items-center gap-1.5 cursor-pointer transition-colors brutal-shadow-sm"
                title="Skip intro"
              >
                <span>SKIP INTRO</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
