'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield, MapPin, Landmark, HeartHandshake, Cpu, Sparkles, ArrowRight,
  TrendingUp, CheckCircle, Award, Users, Layers, Zap
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-600/20 via-cyan-600/20 to-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="SATARK AI Emblem" className="w-28 h-28 object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]" />
        </div>
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
          <strong className="text-emerald-400">SATARK AI</strong> (System for Automated Tracking, AI-assisted Routing & Knowledge-driven Action) bridges Citizens, Government Authorities, Higher Education Institutions, and Industry CSR Partners across India.
        </p>

        <div className="mt-4 text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
          Tagline: "Report • Predict • Connect • Resolve"
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/citizen"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Submit Societal Challenge
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:border-cyan-400/50 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            Launch Command Centre
          </Link>
        </div>

        {/* Impact Counters */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-900">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">2,45,000+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Estimated Beneficiaries</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">₹48.5 Lakhs</div>
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

      {/* Four Stakeholder Portals Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Four Core Stakeholder Ecosystems</h2>
            <p className="text-sm text-slate-400 mt-2">All four portals communicate seamlessly through one central backend and database.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Citizen Portal Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 font-bold">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">A. Citizen & Community</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Report challenges across 12 societal domains with photos, geolocation, and track resolution status in real-time.
                </p>
              </div>
              <Link href="/citizen" className="mt-6 text-xs font-bold text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
                Open Citizen Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Admin Command Centre Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 font-bold">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">B. Govt Command Centre</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Validate reports, override AI, review pgvector duplicate checks, route to departments, and assign HEIs.
                </p>
              </div>
              <Link href="/admin" className="mt-6 text-xs font-bold text-cyan-400 flex items-center gap-1 hover:gap-2 transition-all">
                Open Command Centre <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* University Portal Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 font-bold">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">C. University & HEI Hub</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Form multidisciplinary student-faculty teams, submit solution proposals, build prototypes, and run pilot trials.
                </p>
              </div>
              <Link href="/hei" className="mt-6 text-xs font-bold text-purple-400 flex items-center gap-1 hover:gap-2 transition-all">
                Open HEI Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Industry / CSR Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 font-bold">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">D. Industry & CSR Partner</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Browse university solution proposals, pledge CSR funding in INR, offer technical mentorship, and sponsor deployment.
                </p>
              </div>
              <Link href="/industry" className="mt-6 text-xs font-bold text-amber-400 flex items-center gap-1 hover:gap-2 transition-all">
                Open Industry Hub <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core AI Engine Modules */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
            <Cpu className="w-4 h-4" /> AI Engine Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Five Intelligent Core AI Modules</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Powered by LangChain + OpenAI GPT-4o with deterministic rule-based fallbacks for offline reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-emerald-400 font-mono font-bold text-xs mb-2">MODULE 1</div>
            <h3 className="text-base font-bold text-white">Problem Classification</h3>
            <p className="text-xs text-slate-400 mt-2">Classifies issues across 12 domains (Water, Roads, Health, Agriculture, Sanitation, Disaster, etc.).</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-cyan-400 font-mono font-bold text-xs mb-2">MODULE 2</div>
            <h3 className="text-base font-bold text-white">Priority Prediction (0-100)</h3>
            <p className="text-xs text-slate-400 mt-2">Evaluates severity, urgency, population impact, and safety risk to produce score & reasoning.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-purple-400 font-mono font-bold text-xs mb-2">MODULE 3</div>
            <h3 className="text-base font-bold text-white">Duplicate Detection (pgvector)</h3>
            <p className="text-xs text-slate-400 mt-2">Uses semantic embedding similarity and GIS distance bounds to flag potential duplicate challenges.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-amber-400 font-mono font-bold text-xs mb-2">MODULE 4</div>
            <h3 className="text-base font-bold text-white">HEI Recommendation Engine</h3>
            <p className="text-xs text-slate-400 mt-2">Matches validated problems to universities based on academic disciplines, lab facilities, and faculty leads.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 md:col-span-2">
            <div className="text-blue-400 font-mono font-bold text-xs mb-2">MODULE 5</div>
            <h3 className="text-base font-bold text-white">Solution Direction Generator</h3>
            <p className="text-xs text-slate-400 mt-2">Generates 3-4 actionable solution approaches (e.g. solar de-fluoridation, computer vision pavement audit, telemedicine kiosk).</p>
          </div>
        </div>
      </section>
    </div>
  );
}
