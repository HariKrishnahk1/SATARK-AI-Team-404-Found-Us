'use client';

/**
 * SATARK AI — Unified Multi-Portal Authentication Gateway
 * Dedicated login & registration portal for all official stakeholders:
 * 1. Government Command Centre (`/admin`)
 * 2. University & HEI Innovation Hub (`/hei` / `/student`)
 * 3. Industry & CSR Partnership Hub (`/industry`)
 * 4. Citizen Civic Reporting Portal (`/citizen`)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Shield, Landmark, HeartHandshake, MapPin, Lock, ArrowRight, CheckCircle2, User, Key, Sparkles, UserPlus, Phone, Home, UserCheck, Users } from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'GOVT' | 'HEI' | 'INDUSTRY' | 'CITIZEN'>('GOVT');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Existing User Sign In State
  const [email, setEmail] = useState('admin@satark.gov.in');
  const [password, setPassword] = useState('password123');

  // New User Registration State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (tab: 'GOVT' | 'HEI' | 'INDUSTRY' | 'CITIZEN') => {
    setActiveTab(tab);
    setError('');
    setSuccessMessage('');
    if (tab === 'GOVT') {
      setEmail('admin@satark.gov.in');
    } else if (tab === 'HEI') {
      setEmail('hei@bitmesra.ac.in');
    } else if (tab === 'INDUSTRY') {
      setEmail('csr@tatasteel.com');
    } else if (tab === 'CITIZEN') {
      setEmail('citizen@satark.gov.in');
    }
  };

  const getTargetRoute = (tab: string) => {
    if (tab === 'GOVT') return '/admin';
    if (tab === 'HEI') return '/hei';
    if (tab === 'INDUSTRY') return '/industry';
    return '/citizen';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('satark_startup_video_played');
        sessionStorage.removeItem('satark_portal_video_watched');
      }
      await login(email, password);
      router.push(getTargetRoute(activeTab));
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (regPassword !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    if (!fullName || !regEmail || !mobileNumber || !fullAddress || !regPassword) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('satark_startup_video_played');
        sessionStorage.removeItem('satark_portal_video_watched');
      }
      setSuccessMessage(`Account registered for ${fullName}! Accessing ${activeTab} Portal...`);
      setTimeout(() => {
        router.push(getTargetRoute(activeTab));
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (roleKey: any, redirectPath: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('satark_startup_video_played');
      sessionStorage.removeItem('satark_portal_video_watched');
    }
    switchDemoRole(roleKey);
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
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
            <span>SATARK AI Multi-Portal Authentication Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            SATARK AI <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Login & Registration Portal</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Access your official portal workspace or register a new user account for Government Command Centre, Universities, CSR Partners, or Citizen Reporting.
          </p>
        </div>

        {/* Institutional Logins Container */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: 4 Portal Selector Tabs */}
          <div className="md:col-span-5 p-6 bg-slate-950/60 border-r border-slate-800/80 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Select Your Portal Role
              </h3>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('GOVT')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'GOVT'
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'GOVT' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'GOVT' ? 'text-white' : 'text-slate-300'}`}>
                      1. Government Command Centre
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      For State Admins, Department Heads & Field Officers.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('HEI')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'HEI'
                      ? 'bg-slate-900 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'HEI' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'HEI' ? 'text-white' : 'text-slate-300'}`}>
                      2. University & HEI Innovation Hub
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      For HEI Deans, Faculty Mentors & Student Teams.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('INDUSTRY')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'INDUSTRY'
                      ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'INDUSTRY' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'INDUSTRY' ? 'text-white' : 'text-slate-300'}`}>
                      3. Industry & CSR Partnership Hub
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      For CSR Foundations, Industry Mentors & Funders.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('CITIZEN')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'CITIZEN'
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${activeTab === 'CITIZEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'CITIZEN' ? 'text-white' : 'text-slate-300'}`}>
                      4. Citizen Civic Reporting Portal
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      For Citizens reporting challenges & tracking progress.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>JWT Authentication & Role-Based Access Control</span>
            </div>
          </div>

          {/* Right Column: Form Panel (Sign In vs New User Register) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/60">
            <div>
              {/* Header Title & Existing / New User Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeTab === 'GOVT' && <Shield className="w-5 h-5 text-cyan-400" />}
                    {activeTab === 'HEI' && <Landmark className="w-5 h-5 text-purple-400" />}
                    {activeTab === 'INDUSTRY' && <HeartHandshake className="w-5 h-5 text-amber-400" />}
                    {activeTab === 'CITIZEN' && <Users className="w-5 h-5 text-emerald-400" />}
                    {activeTab === 'GOVT' && 'Government Command Centre'}
                    {activeTab === 'HEI' && 'University & HEI Portal'}
                    {activeTab === 'INDUSTRY' && 'Industry & CSR Partner Hub'}
                    {activeTab === 'CITIZEN' && 'Citizen Civic Reporting Portal'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRegisterMode ? 'New User Account Registration' : 'Existing User Portal Sign In'}
                  </p>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMessage(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      !isRegisterMode
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 inline mr-1" /> Existing User
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMessage(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isRegisterMode
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 inline mr-1" /> New User
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {successMessage}
                </div>
              )}

              {/* Mode A: Existing User Sign In Form */}
              {!isRegisterMode ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Username / Email ID *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        placeholder="Username or official email id..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password *
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
                    className={`w-full py-3 rounded-xl font-bold text-xs text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                      activeTab === 'GOVT'
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 shadow-cyan-500/20'
                        : activeTab === 'HEI'
                        ? 'bg-gradient-to-r from-purple-400 to-pink-500 hover:brightness-110 shadow-purple-500/20'
                        : activeTab === 'INDUSTRY'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 shadow-amber-500/20'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 shadow-emerald-500/20'
                    }`}
                  >
                    {loading ? 'Authenticating...' : `Login to ${activeTab === 'GOVT' ? 'Command Centre' : activeTab === 'HEI' ? 'HEI Portal' : activeTab === 'INDUSTRY' ? 'CSR Portal' : 'Citizen Portal'}`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Mode B: New User Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. Rajesh Sharma"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Mail ID *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. rajesh@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Full Address *
                      </label>
                      <div className="relative">
                        <Home className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullAddress}
                          onChange={(e) => setFullAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          placeholder="Street, area, city, pin..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer"
                  >
                    {loading ? 'Registering Account...' : 'Register Account & Access Portal'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Quick Demo Auto-Login Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Demo One-Click Access
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTab === 'GOVT' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('SUPER_ADMIN', '/admin')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      ⚡ State Admin (`admin@satark.gov.in`)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('DEPARTMENT_HEAD', '/admin')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      ⚡ Dept Head (`depthead@satark.gov.in`)
                    </button>
                  </>
                )}
                {activeTab === 'HEI' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('HEI_COORDINATOR', '/hei')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      ⚡ HEI Dean (`hei@bitmesra.ac.in`)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('STUDENT_TEAM', '/student')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      ⚡ Student Team (`student@bitmesra.ac.in`)
                    </button>
                  </>
                )}
                {activeTab === 'INDUSTRY' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('INDUSTRY_PARTNER', '/industry')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      ⚡ Tata Steel CSR (`csr@tatasteel.com`)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('CSR_PARTNER', '/industry')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      ⚡ Coal India CSR (`csr@coalindia.in`)
                    </button>
                  </>
                )}
                {activeTab === 'CITIZEN' && (
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('CITIZEN', '/citizen')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                  >
                    ⚡ Citizen User (`citizen@satark.gov.in`)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
