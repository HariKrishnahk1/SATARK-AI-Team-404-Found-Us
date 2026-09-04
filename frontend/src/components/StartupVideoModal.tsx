'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Volume2, VolumeX, SkipForward, Sparkles, Play, Pause, X } from 'lucide-react';

interface StartupVideoModalProps {
  portalName?: string;
  onComplete?: () => void;
}

export const StartupVideoModal: React.FC<StartupVideoModalProps> = ({
  portalName,
  onComplete
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('0:00');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showCenterPlayHint, setShowCenterPlayHint] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const hasStartedRef = useRef(false);

  // Dynamically resolve portal name & type accurately
  const isPortalAdmin =
    process.env.NEXT_PUBLIC_PORTAL_MODE === 'ADMIN' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/hei') ||
        window.location.pathname.startsWith('/industry') ||
        window.location.pathname.startsWith('/student') ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/login/'));

  const portalStorageKey = isPortalAdmin
    ? 'satark_admin_startup_video_watched_once'
    : 'satark_civic_startup_video_watched_once';

  const currentPortalName =
    portalName ||
    (isPortalAdmin
      ? 'SATARK AI — Government Admin Command Centre'
      : 'SATARK AI — Citizen Civic Reporting Platform');

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem(portalStorageKey, 'true');
      sessionStorage.setItem(portalStorageKey, 'true');
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

      // If user is not logged in, direct them to their respective login page
      if (!user) {
        if (isPortalAdmin) {
          router.push('/login');
        } else {
          router.push('/citizen/login');
        }
      }
    }, 250);
  }, [onComplete, user, isPortalAdmin, router, portalStorageKey]);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        setShowCenterPlayHint(false);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowCenterPlayHint(true);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    try {
      // Check URL search params for on-demand forced replay (e.g. ?intro=1 or ?replay=1)
      const searchParams = new URLSearchParams(window.location.search);
      const forceIntro = searchParams.get('intro') === '1' || searchParams.get('replay') === '1';

      const hasPlayed =
        !forceIntro &&
        (localStorage.getItem(portalStorageKey) === 'true' || sessionStorage.getItem(portalStorageKey) === 'true');

      if (!hasPlayed) {
        setVisible(true);
        document.documentElement.classList.add('satark-startup-active');
        // Once startup video is shown, permanently save so reload or login NEVER triggers it again on this portal!
        try {
          localStorage.setItem(portalStorageKey, 'true');
          sessionStorage.setItem(portalStorageKey, 'true');
        } catch (e) {}
      } else {
        setVisible(false);
        document.documentElement.classList.remove('satark-startup-active');
      }
    } catch (e) {
      setVisible(false);
      document.documentElement.classList.remove('satark-startup-active');
    }

    // Safety timeout: ensure page is never stuck if video is slow or network stalls
    const safetyTimer = setTimeout(() => {
      document.documentElement.classList.remove('satark-startup-active');
      setVideoLoaded(true);
    }, 12000);

    // Support replaying intro on-demand via custom event
    const handleReplay = () => {
      setIsFadingOut(false);
      setVisible(true);
      setVideoLoaded(false);
      setProgress(0);
      setIsPlaying(true);
      setShowCenterPlayHint(false);
      document.documentElement.classList.add('satark-startup-active');
      if (videoRef.current) {
        const vid = videoRef.current;
        vid.currentTime = 0;
        vid.defaultMuted = true;
        vid.muted = isMutedRef.current;
        vid.play().catch(() => {
          vid.muted = true;
          vid.play().catch(() => {});
        });
      }
    };

    // User-friendly keyboard shortcuts: Esc (Skip), Space (Play/Pause), M (Mute/Unmute)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
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
  }, [handleSkip, togglePlayPause, toggleMute]);

  // Idempotent initial play trigger - runs once when modal becomes visible
  useEffect(() => {
    if (visible && videoRef.current && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const vid = videoRef.current;
      vid.defaultMuted = true;
      vid.muted = true;

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoLoaded(true);
            setIsPlaying(true);
          })
          .catch(() => {
            vid.muted = true;
            vid
              .play()
              .then(() => {
                setVideoLoaded(true);
                setIsPlaying(true);
              })
              .catch(() => setVideoLoaded(true));
          });
      }
    }
  }, [visible]);

  // Track video playback progress & timestamp smoothly
  const handleTimeUpdate = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 4.7;
      setProgress(Math.min(100, (cur / dur) * 100));
      const secs = Math.floor(cur);
      setCurrentTimeFormatted(`0:0${secs}`);
    }
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Startup Overview Video"
      aria-modal="true"
      className={`fixed inset-0 z-[9999] bg-black w-screen h-screen overflow-hidden flex items-center justify-center transition-opacity duration-300 select-none ${
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
            PREPARING OVERVIEW VIDEO...
          </span>
        </div>
      )}

      {/* Fullscreen Video with click-to-play/pause area */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={togglePlayPause}
        title={isPlaying ? 'Click to Pause (or press Space)' : 'Click to Play (or press Space)'}
      >
        <video
          ref={videoRef}
          src="/SAI.mp4"
          autoPlay
          muted={isMuted}
          playsInline
          preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
          onPlaying={() => {
            setVideoLoaded(true);
            setIsPlaying(true);
            setShowCenterPlayHint(false);
          }}
          onPause={() => {
            setIsPlaying(false);
            setShowCenterPlayHint(true);
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleSkip}
          onError={() => {
            console.warn('Video stream failed or stalled');
            setVideoLoaded(true);
          }}
          className="w-full h-full object-contain bg-black"
        />

        {/* Big Centered Play/Pause Indicator on Pause */}
        {showCenterPlayHint && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-fadeIn z-20 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-slate-900/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-2xl shadow-cyan-500/30 scale-110 transition-transform">
              <Play className="w-10 h-10 fill-cyan-400 translate-x-0.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 mt-3 font-mono bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
              Paused • Click anywhere or Press Space to resume
            </span>
          </div>
        )}
      </div>

      {/* Top Left Corner: Mute / Unmute & Play/Pause Controls */}
      <div className="absolute top-5 left-5 z-[10000] flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-300 font-semibold text-xs backdrop-blur-md hover:bg-slate-800 hover:border-cyan-500/60 hover:text-white transition-all shadow-xl shadow-black/50 cursor-pointer group"
          title={isMuted ? 'Unmute Audio (Press M)' : 'Mute Audio (Press M)'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Unmute Audio</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">M</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-emerald-300">Sound Active</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.2 rounded font-mono border border-emerald-500/30">M</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-medium cursor-pointer backdrop-blur-md"
          title={isPlaying ? 'Pause Video (Space)' : 'Play Video (Space)'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">Space</span>
        </button>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-medium text-slate-300 backdrop-blur-md shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Quick Overview</span>
        </div>
      </div>

      {/* Top Right Corner: Skip & Close Buttons */}
      <div className="absolute top-5 right-5 z-[10000] flex items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Skip Overview Video (Press Esc)"
        >
          <span>Skip Video</span>
          <SkipForward className="w-3.5 h-3.5 fill-slate-950" />
          <span className="hidden sm:inline text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono">Esc</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          title="Close (Esc)"
          aria-label="Close Overview Video"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Overlay: Progress Bar & Info Banner */}
      <div className="absolute bottom-5 left-5 right-5 z-[10000] flex flex-col gap-2 pointer-events-none">
        {/* Subtle Live Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/80 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-500 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Metadata & Controls Hint Bar */}
        <div className="flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-cyan-300 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
              {currentPortalName}
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-400 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
              {currentTimeFormatted} / 0:04
            </span>
          </div>
          <span className="text-[11px] text-slate-300 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
            Click video or Space to Pause • Esc to Skip
          </span>
        </div>
      </div>
    </div>
  );
};
