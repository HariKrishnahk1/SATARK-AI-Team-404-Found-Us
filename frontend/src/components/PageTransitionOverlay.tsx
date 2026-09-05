'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

const isLoginPath = (p: string | null) => {
  if (!p) return false;
  const path = p.split('?')[0].split('#')[0];
  return (
    path === '/login' ||
    path === '/login/' ||
    path === '/citizen/login' ||
    path === '/citizen/login/' ||
    path === '/'
  );
};

const getPortalGroup = (p: string | null) => {
  if (!p) return null;
  const path = p.split('?')[0].split('#')[0];
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/hei')) return 'hei';
  if (path.startsWith('/industry')) return 'industry';
  if (path.startsWith('/student')) return 'student';
  if (path.startsWith('/citizen')) return 'citizen';
  if (path.startsWith('/authority')) return 'authority';
  return null;
};

const shouldTriggerTransition = (prevPath: string | null, nextPath: string | null) => {
  if (!prevPath || !nextPath || prevPath === nextPath) return false;

  // Don't trigger if startup video is active on screen
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('satark-startup-active')) {
    return false;
  }

  const prevGroup = getPortalGroup(prevPath);
  const nextGroup = getPortalGroup(nextPath);

  // 1. Navigating from Login page to ANY Portal
  if (isLoginPath(prevPath) && nextGroup !== null) {
    return true;
  }

  // 2. Switching between different Portals (e.g. Citizen -> Admin, Admin -> HEI, etc.)
  if (prevGroup !== null && nextGroup !== null && prevGroup !== nextGroup) {
    return true;
  }

  return false;
};

const PageTransitionOverlayContent: React.FC = () => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activePortalLabel, setActivePortalLabel] = useState('SATARK AI PORTAL');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathRef = useRef<string | null>(null);

  // Helper to determine theme-appropriate portal status text
  const getPortalLabel = (path: string | null) => {
    if (!path) return 'SATARK AI • ROUTING SECURE CHANNEL...';
    if (path.startsWith('/admin')) return 'GOVT COMMAND CENTRE • SYNCHRONIZING INTEL';
    if (path.startsWith('/hei')) return 'UNIVERSITY R&D PORTAL • MATCHING LABS';
    if (path.startsWith('/industry')) return 'INDUSTRY & CSR HUB • ALLOCATING RESOURCES';
    if (path.startsWith('/student')) return 'STUDENT WORKSPACE • FABRICATING PROTOTYPE';
    if (path.startsWith('/citizen')) return 'CITIZEN CIVIC PORTAL • CONNECTING';
    if (path.startsWith('/authority')) return 'INSTITUTIONAL HUB • ROUTING STAKEHOLDERS';
    if (path.startsWith('/login')) return 'AUTHENTICATION GATEWAY • SECURING SESSION';
    return 'SATARK AI • KNOWLEDGE ENGINE SYNCHRONIZING';
  };

  // Trigger transition animation ONLY when navigating from Login -> Portal OR between Portals
  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = pathname;

    if (prevPath && shouldTriggerTransition(prevPath, pathname)) {
      setActivePortalLabel(getPortalLabel(pathname));
      setIsNavigating(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 450);
    }
  }, [pathname]);

  // Intercept internal link clicks for instant visual feedback ONLY if navigating from Login -> Portal or between Portals
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (target && target.href) {
        try {
          const url = new URL(target.href, window.location.origin);
          const currentPath = window.location.pathname;
          const targetPath = url.pathname;
          if (url.origin === window.location.origin && shouldTriggerTransition(currentPath, targetPath)) {
            setActivePortalLabel(getPortalLabel(targetPath));
            setIsNavigating(true);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('click', handleLinkClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleLinkClick, { capture: true });
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div
      className={`fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/75 backdrop-blur-md transition-all duration-300 pointer-events-none ${
        isNavigating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      {/* Centered Cyberpunk Tactical Radar Overlay Box */}
      <div className="relative flex flex-col items-center justify-center px-8 py-7 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.3)] backdrop-blur-2xl max-w-sm w-full mx-4 text-center">
        {/* Corner Bracket HUD Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-sm" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-sm" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-sm" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80 rounded-br-sm" />

        {/* Ambient Pulsing Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-indigo-500/10 blur-xl rounded-2xl pointer-events-none animate-pulse" />

        {/* Centered Radar Scanner Core */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-4 shrink-0">
          {/* Outer Spin Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-emerald-400 border-b-indigo-500 animate-spin duration-700" />
          
          {/* Middle Counter-Rotating Dashed Reticle */}
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/50 animate-reverse-spin" />

          {/* Inner Glowing Center Pulse */}
          <div className="w-10 h-10 rounded-full bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center z-10 animate-cyber-glow">
            <img src="/logo.png" alt="SATARK Logo" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>

          {/* Scanning Beam Sweep */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/20 via-transparent to-transparent animate-spin duration-1000 pointer-events-none" />
        </div>

        {/* Dynamic Theme & Portal Status Text */}
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>{activePortalLabel}</span>
          </div>

          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>SIH 2026 PS26043 • AI Routing Engine</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const PageTransitionOverlay: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <PageTransitionOverlayContent />
    </Suspense>
  );
};

export const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-enter flex-grow flex flex-col min-h-full">
      {children}
    </div>
  );
};
