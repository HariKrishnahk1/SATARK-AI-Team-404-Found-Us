'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Role } from '../lib/types';
import { Shield, MapPin, Building2, Landmark, HeartHandshake, User, ChevronDown, GraduationCap, LogIn } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, switchDemoRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const isPortalAdmin = process.env.NEXT_PUBLIC_PORTAL_MODE === 'ADMIN';
  const isCitizenMode = !isPortalAdmin && (pathname === '/citizen' || pathname === '/');

  const authorityNavItems = [
    { href: isPortalAdmin ? '/' : '/admin', label: 'Govt Command Centre', icon: Shield },
    { href: '/hei', label: 'University Portal', icon: Landmark },
    { href: '/industry', label: 'Industry & CSR Partner Portal', icon: HeartHandshake },
    { href: '/student', label: 'Student Portal', icon: GraduationCap }
  ];

  const roles: { role: Role; label: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Government Super Admin' },
    { role: 'CITIZEN', label: 'Citizen / Community' },
    { role: 'HEI_COORDINATOR', label: 'University Coordinator (BIT Mesra)' },
    { role: 'STUDENT_TEAM', label: 'Student Innovator Team (BIT Mesra)' },
    { role: 'INDUSTRY_PARTNER', label: 'Industry Partner (Tata Steel CSR)' },
    { role: 'DEPARTMENT_HEAD', label: 'Department Head (Water Resources)' },
    { role: 'OFFICER', label: 'Field Officer (Roads)' }
  ];

  return (
    <nav className="bg-slate-950/90 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={isCitizenMode ? "/citizen" : (isPortalAdmin ? "/" : "/authority")} className="flex items-center gap-3 group">
          <div className="relative group-hover:scale-105 transition-transform shrink-0">
            <img src="/logo.png" alt="SATARK AI Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                SATARK AI
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                {isCitizenMode ? 'Citizen Portal' : (isPortalAdmin ? 'Admin Command Centre' : 'Authority Portal')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {isCitizenMode ? 'Public Issue Reporting & Status Tracking' : 'Government • University • Industry Command Hub'}
            </p>
          </div>
        </Link>

        {/* Center Section: Authority Mode Links */}
        {isCitizenMode ? null : (
          <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {authorityNavItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3">
          {isCitizenMode ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-300 shadow-md shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-emerald-400">Public Portal</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-300 font-medium">No Institutional Login Required</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/citizen"
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-emerald-400 hover:text-white hover:border-emerald-500/50 transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Citizen Site</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-cyan-500/50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <div className="text-left hidden sm:block">
                    <span className="block text-[10px] text-slate-400 leading-tight">Stakeholder Role</span>
                    <span className="font-bold text-cyan-300 leading-tight block">{user?.role || 'SUPER_ADMIN'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Stakeholder Login
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
      </div>
    </nav>
  );
};
