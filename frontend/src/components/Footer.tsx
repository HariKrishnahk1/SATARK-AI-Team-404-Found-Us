'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ExternalLink, Heart, Play } from 'lucide-react';

export const Footer = () => {
  const pathname = usePathname();
  const isCitizenMode =
    pathname?.startsWith('/citizen') ||
    pathname === '/' ||
    (!pathname?.includes('/admin') &&
      !pathname?.includes('/hei') &&
      !pathname?.includes('/industry') &&
      !pathname?.includes('/student') &&
      pathname !== '/login');

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
            <img src="/logo.png" alt="SATARK AI Logo" className="w-7 h-7 object-contain" />
            <span>SATARK AI</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            System for Automated Tracking, AI-assisted Routing & Knowledge-driven Action.
            A digital ecosystem connecting citizens, higher education institutions, government, and industry partners across India.
          </p>
          <div className="text-[11px] text-cyan-400 font-mono">
            Smart India Hackathon 2026 • PS26043
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('satark:replay-intro'));
              }
            }}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-cyan-400 hover:text-white hover:bg-slate-800 hover:border-cyan-500/40 transition-all text-[11px] font-semibold cursor-pointer"
            title="Watch the SATARK AI overview video again"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Replay Overview Video</span>
          </button>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">{isCitizenMode ? 'Citizen Portal' : 'Stakeholder Portals'}</h4>
          {isCitizenMode ? (
            <ul className="space-y-2">
              <li><Link href="/citizen" className="hover:text-cyan-400 transition-colors">Report Societal Challenge</Link></li>
              <li><Link href="/citizen" className="hover:text-cyan-400 transition-colors">Live Submitted Feed</Link></li>
              <li><Link href="/citizen" className="hover:text-cyan-400 transition-colors">15-Stage Status Tracking</Link></li>
            </ul>
          ) : (
            <ul className="space-y-2">
              <li><Link href="/citizen" className="hover:text-cyan-400 transition-colors">Citizen & Community Portal</Link></li>
              <li><Link href="/admin" className="hover:text-cyan-400 transition-colors">Government Command Centre</Link></li>
              <li><Link href="/hei" className="hover:text-cyan-400 transition-colors">University & HEI Portal</Link></li>
              <li><Link href="/industry" className="hover:text-cyan-400 transition-colors">Industry & CSR Partner Portal</Link></li>
              <li><Link href="/student" className="hover:text-cyan-400 transition-colors">Student Portal</Link></li>
            </ul>
          )}
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">AI Engine Capabilities</h4>
          <ul className="space-y-2 text-slate-400">
            <li>• Module 1: Semantic Classification</li>
            <li>• Module 2: 0-100 Priority Prediction</li>
            <li>• Module 3: pgvector Duplicate Detection</li>
            <li>• Module 4: HEI & Discipline Matching</li>
            <li>• Module 5: Solution Direction Recommender</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Organization & Team</h4>
          <div className="space-y-2">
            <p><strong className="text-slate-300">Department:</strong> Higher & Technical Education</p>
            <p><strong className="text-slate-300">Scope:</strong> Pan-India Platform</p>
            <p><strong className="text-slate-300">Team:</strong> 404 FOUND US</p>
            <p className="text-emerald-400 font-mono text-[11px] mt-2">
              Tagline: "Report • Predict • Connect • Resolve"
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-slate-400 text-[11px]">
        <p>© 2026 SATARK AI Platform. SIH 2026 Prototype. Built for Pan-India Societal Innovation.</p>
        <p className="mt-2 md:mt-0 flex items-center gap-1">
          Designed with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Team 404 FOUND US
        </p>
      </div>
    </footer>
  );
};
