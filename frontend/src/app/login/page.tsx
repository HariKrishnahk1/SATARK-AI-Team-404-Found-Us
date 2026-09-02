'use client';

/**
 * SATARK AI — Institutional Login Gateway
 * Dedicated login portal for official stakeholders:
 * 1. Government Command Centre (`/admin`)
 * 2. University & HEI Innovation Hub (`/hei`)
 * 3. Industry & CSR Partnership Hub (`/industry`)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Shield, Landmark, HeartHandshake, MapPin, Lock, ArrowRight, CheckCircle2, User, Key, Sparkles } from 'lucide-react';
import { StartupVideoModal } from '../../components/StartupVideoModal';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'GOVT' | 'HEI' | 'INDUSTRY'>('GOVT');
  const [email, setEmail] = useState('admin@satark.gov.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (tab: 'GOVT' | 'HEI' | 'INDUSTRY') => {
    setActiveTab(tab);
    setError('');
    if (tab === 'GOVT') {
      setEmail('admin@satark.gov.in');
    } else if (tab === 'HEI') {
      setEmail('hei@bitmesra.ac.in');
    } else if (tab === 'INDUSTRY') {
      setEmail('csr@tatasteel.com');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      if (activeTab === 'GOVT') {
        router.push('/admin');
      } else if (activeTab === 'HEI') {
        router.push('/hei');
      } else if (activeTab === 'INDUSTRY') {
        router.push('/industry');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (roleKey: any, redirectPath: string) => {
    switchDemoRole(roleKey);
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <StartupVideoModal portalName="Institutional Authority Portal" />
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="SATARK AI Emblem" className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SATARK AI Institutional Authentication Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Institutional <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Login Portal</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Public citizen reporting is available on the Civic Portal without login. Institutional governance, R&D proposals, and CSR funding require authenticated access below.
          </p>
        </div>

        {/* Civic Portal Link Banner */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-block text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mb-1">
                Public Access • No Institutional Login Required
              </div>
              <h2 className="text-lg font-bold text-white">Civic & Community Portal</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Looking to submit a public societal issue or track resolution? Visit the dedicated Civic Portal.
              </p>
            </div>
          </div>
          <Link
            href="/citizen"
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            Enter Civic Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Institutional Logins Container */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Tab Selector */}
          <div className="md:col-span-5 p-6 bg-slate-950/60 border-r border-slate-800/80 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Institutional Roles
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleTabChange('GOVT')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    activeTab === 'GOVT'
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === 'GOVT' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${activeTab === 'GOVT' ? 'text-white' : 'text-slate-300'}`}>
                      1. Government Command Centre
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      For State Admins, Department Heads & Officers.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabChange('HEI')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    activeTab === 'HEI'
                      ? 'bg-slate-900 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === 'HEI' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${activeTab === 'HEI' ? 'text-white' : 'text-slate-300'}`}>
                      2. University & HEI Innovation Hub
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      For HEI Coordinators, Faculty Mentors & Student Teams.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleTabChange('INDUSTRY')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    activeTab === 'INDUSTRY'
                      ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${activeTab === 'INDUSTRY' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${activeTab === 'INDUSTRY' ? 'text-white' : 'text-slate-300'}`}>
                      3. Industry & CSR Partnership Hub
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      For CSR Foundations, Industry Partners & Mentors.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>JWT Authentication & Role-Based Access Control (RBAC)</span>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/60">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {activeTab === 'GOVT' && <Shield className="w-5 h-5 text-cyan-400" />}
                    {activeTab === 'HEI' && <Landmark className="w-5 h-5 text-purple-400" />}
                    {activeTab === 'INDUSTRY' && <HeartHandshake className="w-5 h-5 text-amber-400" />}
                    {activeTab === 'GOVT' && 'Government Command Centre Login'}
                    {activeTab === 'HEI' && 'University & HEI Portal Login'}
                    {activeTab === 'INDUSTRY' && 'Industry & CSR Partner Login'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your official credentials to access your stakeholder workspace.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Registered Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. admin@satark.gov.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl ${
                    activeTab === 'GOVT'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 shadow-cyan-500/20'
                      : activeTab === 'HEI'
                      ? 'bg-gradient-to-r from-purple-400 to-pink-500 hover:brightness-110 shadow-purple-500/20'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 shadow-amber-500/20'
                  }`}
                >
                  {loading ? 'Authenticating...' : `Login to ${activeTab === 'GOVT' ? 'Command Centre' : activeTab === 'HEI' ? 'HEI Portal' : 'CSR Portal'}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Demo Options */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Demo Auto-Login Options
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTab === 'GOVT' && (
                  <>
                    <button
                      onClick={() => handleQuickDemoSelect('SUPER_ADMIN', '/admin')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors border border-slate-700"
                    >
                      ⚡ Super Admin (`admin@satark.gov.in`)
                    </button>
                    <button
                      onClick={() => handleQuickDemoSelect('DEPARTMENT_HEAD', '/admin')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors border border-slate-700"
                    >
                      ⚡ Dept Head (`depthead@satark.gov.in`)
                    </button>
                  </>
                )}
                {activeTab === 'HEI' && (
                  <>
                    <button
                      onClick={() => handleQuickDemoSelect('HEI_COORDINATOR', '/hei')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition-colors border border-slate-700"
                    >
                      ⚡ HEI Dean (`hei@bitmesra.ac.in`)
                    </button>
                    <button
                      onClick={() => handleQuickDemoSelect('STUDENT_TEAM', '/hei')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition-colors border border-slate-700"
                    >
                      ⚡ Student Innovator (`student@bitmesra.ac.in`)
                    </button>
                  </>
                )}
                {activeTab === 'INDUSTRY' && (
                  <>
                    <button
                      onClick={() => handleQuickDemoSelect('INDUSTRY_PARTNER', '/industry')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-medium transition-colors border border-slate-700"
                    >
                      ⚡ Tata Steel CSR (`csr@tatasteel.com`)
                    </button>
                    <button
                      onClick={() => handleQuickDemoSelect('CSR_PARTNER', '/industry')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-medium transition-colors border border-slate-700"
                    >
                      ⚡ Coal India CSR (`csr@coalindia.in`)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
