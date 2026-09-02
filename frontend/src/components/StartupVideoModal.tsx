'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SkipForward, Sparkles } from 'lucide-react';

interface StartupVideoModalProps {
  portalName: string;
  onComplete?: () => void;
}

export const StartupVideoModal: React.FC<StartupVideoModalProps> = ({ portalName, onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  const handleSkip = () => {
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
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 transition-all">
      {/* Video Container */}
      <div className="relative w-full max-w-5xl h-[80vh] mx-auto rounded-3xl overflow-hidden border border-slate-800 bg-black shadow-2xl shadow-emerald-500/10">
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
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-cyan-400 font-semibold text-xs backdrop-blur-md hover:bg-slate-800 hover:border-cyan-500/60 hover:text-white transition-all shadow-lg shadow-black/40 group cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Mute</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono font-medium text-slate-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>SATARK AI Overview Video</span>
          </div>
        </div>

        {/* Top Right Corner: Skip Video Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Skip Video</span>
            <SkipForward className="w-4 h-4 fill-slate-950" />
          </button>
        </div>

        {/* Bottom Overlay Label */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-between items-center text-xs text-slate-400 px-2">
          <span className="font-mono text-cyan-400 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800 backdrop-blur-md">
            Starting {portalName}...
          </span>
          <span className="text-[11px] text-slate-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800 backdrop-blur-md">
            Click Skip Video to enter immediately
          </span>
        </div>
      </div>
    </div>
  );
};
