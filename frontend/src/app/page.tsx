'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield, MapPin, Landmark, HeartHandshake, Sparkles, ArrowRight,
  CheckCircle, Users, Layers, Lock
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-600/20 via-cyan-600/20 to-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart India Hackathon 2026 • Problem Statement ID: SIH26043 / PS26043</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          From Societal Challenges to{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Collaborative Solutions.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          <strong className="text-emerald-400">SATARK AI</strong> (System for Automated Tracking, AI-assisted Routing & Knowledge-driven Action) bridges Citizens, Government Authorities, Higher Education Institutions, and Industry CSR Partners across Jharkhand.
        </p>

        <div className="mt-4 text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
          Tagline: "Report • Predict • Connect • Resolve"
        </div>

        {/* Action Buttons for Two Portals */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/citizen"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            1. Enter Civic & Community Portal
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:border-cyan-400/50 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            2. Institutional Portal Gateway
          </Link>
        </div>

        {/* Impact Counters */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-900">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">2,53,500+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Estimated Beneficiaries</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">₹53.0 Lakhs</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">CSR Funding Mobilized (INR)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">24 HEIs</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Universities & Research Labs</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">14 Patents</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Patents & Startups Created</div>
          </div>
        </div>
      </section>

      {/* Two Distinct Portal Portals Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Two Distinct Digital Portals</h2>
            <p className="text-sm text-slate-400 mt-2">Public Citizen Reporting is separated from Authenticated Institutional Operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PORTAL 1: CIVIC PORTAL CARD */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between group shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 font-bold">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="inline-block text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 mb-2">
                  Portal 1 • Public Access
                </div>
                <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  Civic & Community Portal
                </h3>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  A dedicated portal for public citizens and community members to submit societal challenges across 12 domains, upload photos/videos, enter location details, and track resolution timelines in real-time.
                </p>

                <ul className="mt-6 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>No institutional login required for reporting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Instant AI Engine analysis (0-100 priority score)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Interactive Jharkhand GIS map & status tracking</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/citizen"
                className="mt-8 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                Launch Civic Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* PORTAL 2: INSTITUTIONAL GATEWAY CARD */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex flex-col justify-between group shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6 font-bold">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="inline-block text-[10px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20 mb-2">
                  Portal 2 • Authenticated Access
                </div>
                <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                  Institutional Portal Gateway
                </h3>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  A multi-role authentication gateway for Government Admins, University Coordinators, and Industry CSR Partners to validate reports, route projects, submit R&D proposals, and pledge funding.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <Shield className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-200 block">Govt Admin</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <Landmark className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-200 block">Universities</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <HeartHandshake className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-slate-200 block">Industry CSR</span>
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="mt-8 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                Enter Institutional Gateway <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
