'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, Sparkles } from 'lucide-react';

interface StartupVideoModalProps {
  portalName: string;
  onComplete?: () => void;
}

export const StartupVideoModal: React.FC<StartupVideoModalProps> = ({ portalName, onComplete }) => {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('satark_startup_video_played');
    }
    return true;
  });
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Sync check on mount
    if (typeof window !== 'undefined') {
      const hasPlayed = sessionStorage.getItem('satark_startup_video_played');
      if (hasPlayed) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    if (visible && videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [visible]);

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('satark_startup_video_played', 'true');
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setVisible(false);
    if (onComplete) onComplete();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black w-screen h-screen overflow-hidden flex items-center justify-center">
      {/* Fullscreen Video */}
      <video
        ref={videoRef}
        src="/SAI.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        onEnded={handleSkip}
        className="w-full h-full object-contain bg-black"
      />

      {/* Top Left Corner: Mute / Unmute Button */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-400 font-semibold text-xs backdrop-blur-md hover:bg-slate-800 hover:border-cyan-500/60 hover:text-white transition-all shadow-xl shadow-black/50 cursor-pointer group"
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
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer"
        >
          <span>Skip Video</span>
          <SkipForward className="w-4 h-4 fill-slate-950" />
        </button>
      </div>

      {/* Bottom Overlay Info Banner */}
      <div className="absolute bottom-6 left-6 right-6 z-50 pointer-events-none flex justify-between items-center text-xs text-slate-400">
        <span className="font-mono text-cyan-400 bg-slate-950/85 px-3.5 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
          Starting {portalName}...
        </span>
        <span className="text-[11px] text-slate-300 bg-slate-950/85 px-3.5 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
          Click Skip Video anytime to proceed
        </span>
      </div>
    </div>
  );
};
