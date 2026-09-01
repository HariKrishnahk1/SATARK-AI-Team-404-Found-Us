'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Role } from '../lib/types';
import { Shield, MapPin, Landmark, HeartHandshake, User, ChevronDown, Activity, LogIn, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, switchDemoRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const isCitizenPortal = pathname.startsWith('/citizen');

  const institutionalNavItems = [
    { href: '/admin', label: 'Govt Command Centre', icon: Shield },
    { href: '/hei', label: 'University Portal', icon: Landmark },
    { href: '/industry', label: 'Industry & CSR Hub', icon: HeartHandshake }
  ];

  const roles: { role: Role; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Government Super Admin' },
    { role: 'CITIZEN', label: 'Citizen / Community' },
    { role: 'HEI_COORDINATOR', label: 'University Coordinator (BIT Mesra)' },
    { role: 'INDUSTRY_PARTNER', label: 'Industry Partner (Tata Steel CSR)' },
    { role: 'DEPARTMENT_HEAD', label: 'Department Head (Water Resources)' },
    { role: 'OFFICER', label: 'Field Officer (Roads)' }
  ];

  return (
    <nav className="bg-slate-950/95 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md">
      {/* Top Government Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 text-slate-300 text-xs py-1 px-4 flex justify-between items-center border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-400">Government of Jharkhand</span>
          <span>•</span>
          <span>Department of Higher & Technical Education</span>
          <span>•</span>
          <span className="text-cyan-400 font-mono">SIH 2026 PS26043</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <Activity className="w-3 h-3 animate-pulse" />
            AI Engine: Online (GPT-4o)
          </span>
          <span>•</span>
          <span className="text-slate-400 font-mono">Team 404 FOUND US</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-cyan-400 text-lg">
              S
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                SATARK AI
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                isCitizenPortal
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {isCitizenPortal ? 'Civic Portal' : 'Institutional Portal'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {isCitizenPortal ? 'Public Citizen Societal Reporting' : 'Government • University • Industry Hub'}
            </p>
          </div>
        </Link>

        {/* Dynamic Navigation according to Portal Context */}
        {isCitizenPortal ? (
          /* CIVIC PORTAL NAVIGATION */
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Public Citizen Portal</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Institutional Login</span>
            </Link>
          </div>
        ) : (
          /* INSTITUTIONAL PORTAL NAVIGATION */
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              {institutionalNavItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Link
              href="/citizen"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              Civic Portal
            </Link>

            {/* Role Selector */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 hover:border-cyan-500/50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <div className="text-left hidden sm:block">
                  <span className="block text-[10px] text-slate-400 leading-tight">Current Role</span>
                  <span className="font-bold text-cyan-300 leading-tight block">{user?.role || 'SUPER_ADMIN'}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Demo Role
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchDemoRole(r.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between ${
                        user?.role === r.role ? 'text-cyan-400 font-bold bg-slate-800/40' : 'text-slate-300'
                      }`}
                    >
                      <span>{r.label}</span>
                      {user?.role === r.role && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
