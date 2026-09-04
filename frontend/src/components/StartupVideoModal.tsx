'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, SkipForward, Sparkles } from 'lucide-react';

interface StartupVideoModalProps {
  portalName?: string;
  onComplete?: () => void;
}

const STORAGE_KEY = 'satark_v2_played';

export const StartupVideoModal: React.FC<StartupVideoModalProps> = ({
  portalName = 'SATARK AI Unified Platform',
  onComplete
}) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSkip = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}

    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('satark-startup-active');
    }

    setIsFadingOut(true);

    setTimeout(() => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch (e) {}
      }
      setVisible(false);
      setIsFadingOut(false);
      if (onComplete) onComplete();
    }, 250);
  }, [onComplete]);

  const handlePlay = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}
  }, []);

  useEffect(() => {
    setMounted(true);

    try {
      // Clear legacy storage lock if present
      localStorage.removeItem('satark_startup_video_played');

      // Do not run startup video on Admin Portal or Admin routes
      const isPortalAdmin = process.env.NEXT_PUBLIC_PORTAL_MODE === 'ADMIN';
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
      if (isPortalAdmin || isAdminRoute) {
        document.documentElement.classList.remove('satark-startup-active');
        setVisible(false);
        return;
      }

      const hasPlayed = sessionStorage.getItem(STORAGE_KEY);
      if (!hasPlayed) {
        setVisible(true);
      } else {
        document.documentElement.classList.remove('satark-startup-active');
      }
    } catch (e) {
      document.documentElement.classList.remove('satark-startup-active');
    }

    // Safety timeout: ensure page is never stuck if video is slow or network stalls
    const safetyTimer = setTimeout(() => {
      document.documentElement.classList.remove('satark-startup-active');
      setVideoLoaded(true);
    }, 3500);

    // Support replaying intro on-demand via custom event
    const handleReplay = () => {
      setIsFadingOut(false);
      setVisible(true);
      document.documentElement.classList.add('satark-startup-active');
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    };

    // Support Escape key to skip instantly
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('satark:replay-intro', handleReplay);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('satark:replay-intro', handleReplay);
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.classList.remove('satark-startup-active');
    };
  }, [handleSkip]);

  useEffect(() => {
    if (visible && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback to muted autoplay
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [visible]);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Startup Overview Video"
      aria-modal="true"
      className={`fixed inset-0 z-[9999] bg-black w-screen h-screen overflow-hidden flex items-center justify-center transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Subtle Loading State before first frame */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4 pointer-events-none z-10">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
            <img
              src="/logo.png"
              alt="SATARK AI"
              className="w-10 h-10 object-contain absolute"
            />
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 animate-pulse">
            LOADING OVERVIEW VIDEO...
          </span>
        </div>
      )}

      {/* Fullscreen Video */}
      <video
        ref={videoRef}
        src="/SAI.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        preload="metadata"
        onPlay={handlePlay}
        onCanPlay={() => setVideoLoaded(true)}
        onLoadedData={() => setVideoLoaded(true)}
        onEnded={handleSkip}
        className="w-full h-full object-contain bg-black"
      >
        <source src="/SAI.mp4" type="video/mp4" />
      </video>

      {/* Top Left Corner: Mute / Unmute Button */}
      <div className="absolute top-6 left-6 z-[10000] flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-400 font-semibold text-xs backdrop-blur-md hover:bg-slate-800 hover:border-cyan-500/60 hover:text-white transition-all shadow-xl shadow-black/50 cursor-pointer group"
          title={isMuted ? 'Click to unmute sound' : 'Click to mute sound'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Unmute Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Mute Audio</span>
            </>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-medium text-slate-300 backdrop-blur-md shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>SATARK AI Overview</span>
        </div>
      </div>

      {/* Top Right Corner: Skip Video Button */}
      <div className="absolute top-6 right-6 z-[10000] flex items-center gap-3">
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span>Skip Video</span>
          <SkipForward className="w-4 h-4 fill-slate-950" />
        </button>
      </div>

      {/* Bottom Overlay Info Banner */}
      <div className="absolute bottom-6 left-6 right-6 z-[10000] pointer-events-none flex justify-between items-center text-xs text-slate-400">
        <span className="font-mono text-cyan-400 bg-slate-950/85 px-3.5 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
          {portalName}
        </span>
        <span className="text-[11px] text-slate-300 bg-slate-950/85 px-3.5 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
          Press Esc or click Skip Video anytime
        </span>
      </div>
    </div>
  );
};
