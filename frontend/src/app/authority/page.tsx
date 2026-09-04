'use client';

/**
 * SATARK AI — Institutional Authority Platform
 * Dedicated portal website for the 4 Official Stakeholder Roles:
 * 1. Government Command Centre (`/admin`)
 * 2. University & HEI Innovation Hub (`/hei`)
 * 3. Student Prototype Fabrication Workspace (`/student`)
 * 4. Industry & CSR Partnership Hub (`/industry`)
 */

import React from 'react';
import Link from 'next/link';
import { Shield, Landmark, GraduationCap, HeartHandshake, ArrowRight, Sparkles, Lock, UserCheck, CheckCircle2 } from 'lucide-react';

export default function AuthorityPlatformPage() {
  const portals = [
    {
      id: 'govt',
      name: '1. Government Command Centre',
      roleLabel: 'Super Admin / Department Head / Officer',
      href: '/admin',
      icon: Shield,
      color: 'emerald',
      bgGlow: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/40',
      description: 'Department routing, priority score override, SLA monitoring, and statewide grievance validation for Jharkhand.',
      badge: 'State Govt Authority'
    },
    {
      id: 'hei',
      name: '2. University & HEI Innovation Hub',
      roleLabel: 'Dean of R&D / HEI Coordinator',
      href: '/hei',
      icon: Landmark,
      color: 'purple',
      bgGlow: 'from-purple-500/20 to-indigo-500/10',
      border: 'border-purple-500/40',
      description: 'Institutional matching for BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad. Lab capabilities and faculty allocation.',
      badge: 'R&D & HEI Network'
    },
    {
      id: 'industry',
      name: '3. Industry & CSR Partner Portal',
      roleLabel: 'Tata Steel / Coal India CSR Partner',
      href: '/industry',
      icon: HeartHandshake,
      color: 'amber',
      bgGlow: 'from-amber-500/20 to-orange-500/10',
      border: 'border-amber-500/40',
      description: 'CSR funding allocation, tech mentorship, pilot site field trial support, and community impact measurement.',
      badge: 'CSR & Industry Partner'
    },
    {
      id: 'student',
      name: '4. Student Prototype & Project Portal',
      roleLabel: 'Student Innovator Team Lead',
      href: '/student',
      icon: GraduationCap,
      color: 'cyan',
      bgGlow: 'from-cyan-500/20 to-blue-500/10',
      border: 'border-cyan-500/40',
      description: 'Multidisciplinary student team project workspace, milestone progress tracking, budget proposal submission, and prototyping.',
      badge: 'Student Innovators'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-cyan-600/15 via-purple-600/15 to-emerald-600/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="SATARK AI Emblem" className="w-20 h-20 object-contain drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SATARK AI Institutional Command Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Institutional & Government <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Authority Portal</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Select your official stakeholder workspace below to access the Government Command Centre, University R&D Hub, Student Fabrication Workspace, or Industry CSR Portal.
          </p>
        </div>

        {/* 4 Authority Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className={`p-6 sm:p-8 rounded-3xl bg-slate-900/80 border ${portal.border} shadow-2xl hover:border-slate-600 transition-all flex flex-col justify-between group backdrop-blur-xl relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${portal.bgGlow} blur-3xl rounded-full pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                      {portal.badge}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {portal.name}
                  </h2>
                  <p className="text-xs text-cyan-400 font-medium mt-1">
                    Role Scope: {portal.roleLabel}
                  </p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Authorized Access Only
                  </span>
                  <Link
                    href={portal.href}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-xs text-slate-400 border-t border-slate-900 pt-8">
          <span>Official System for Higher & Technical Education Department, Govt of Jharkhand</span>
          <span className="mx-2">•</span>
          <Link href="/login" className="text-cyan-400 hover:underline font-semibold">
            Institutional Login Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}
