'use client';

/**
 * SATARK AI — Institutional Authority Platform Authentication Gateway
 * Dedicated login & registration portal for the 4 Official Stakeholders:
 * 1. Government Command Centre (`/admin`)
 * 2. University & HEI Innovation Hub (`/hei`)
 * 3. Industry & CSR Partnership Hub (`/industry`)
 * 4. Student Innovators Workspace (`/student`)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, Landmark, HeartHandshake, GraduationCap, ArrowRight,
  CheckCircle2, User, Key, Sparkles, UserPlus, Phone, Home, UserCheck, Play,
  AlertCircle, Mail, MapPin
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'GOVT' | 'HEI' | 'INDUSTRY' | 'STUDENT'>('GOVT');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Existing User Sign In State
  const [email, setEmail] = useState('admin@satark.gov.in');
  const [password, setPassword] = useState('password123');

  // New Official User Registration State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [departmentOrInstitute, setDepartmentOrInstitute] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (tab: 'GOVT' | 'HEI' | 'INDUSTRY' | 'STUDENT') => {
    setActiveTab(tab);
    setError('');
    setSuccessMessage('');
    if (tab === 'GOVT') {
      setEmail('admin@satark.gov.in');
    } else if (tab === 'HEI') {
      setEmail('hei@bitmesra.ac.in');
    } else if (tab === 'INDUSTRY') {
      setEmail('csr@tatasteel.com');
    } else if (tab === 'STUDENT') {
      setEmail('student@bitmesra.ac.in');
    }
  };

  const getTargetRoute = (tab: string) => {
    if (tab === 'GOVT') return '/admin';
    if (tab === 'HEI') return '/hei';
    if (tab === 'INDUSTRY') return '/industry';
    return '/student';
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
      setError(err.message || 'Login failed. Please check your credentials.');
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

    if (!fullName || !regEmail || !mobileNumber || !regPassword) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('satark_startup_video_played');
        sessionStorage.removeItem('satark_portal_video_watched');
      }

      setSuccessMessage(`Official registration submitted for ${fullName}! Accessing ${activeTab} Portal...`);
      setTimeout(() => {
        router.push(getTargetRoute(activeTab));
      }, 700);
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

  const handleReplayStartupVideo = () => {
    window.dispatchEvent(new CustomEvent('satark:replay-intro'));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Top Video Announcement Banner */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                SATARK AI Platform Overview Video
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono font-medium">4s Intro</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Automated grievance triage, GIS routing, and multi-institutional problem solving.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReplayStartupVideo}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Watch Startup Video</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="SATARK AI Emblem"
              className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Stakeholder Authentication Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            SATARK AI <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Authority Portals Gateway</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Access Government Command Centre, University R&D Hub, Industry CSR Portal, or Student Innovators Workspace.
          </p>
        </div>

        {/* 4-Portals Container */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: 4 Portal Role Selector Tabs */}
          <div className="md:col-span-5 p-5 sm:p-6 bg-slate-950/70 border-r border-slate-800/80 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Select Your Official Portal
              </h3>

              <div className="space-y-2.5">
                {/* 1. Government Command Centre */}
                <button
                  type="button"
                  onClick={() => handleTabChange('GOVT')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'GOVT'
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'GOVT' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'GOVT' ? 'text-white' : 'text-slate-300'}`}>
                      1. Government Command Centre
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      State Admins, Department Heads & Field Officers.
                    </p>
                  </div>
                </button>

                {/* 2. University & HEI Innovation Hub */}
                <button
                  type="button"
                  onClick={() => handleTabChange('HEI')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'HEI'
                      ? 'bg-slate-900 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'HEI' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'HEI' ? 'text-white' : 'text-slate-300'}`}>
                      2. University & HEI Innovation Hub
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      HEI Deans, Faculty Mentors & Research Leads.
                    </p>
                  </div>
                </button>

                {/* 3. Industry & CSR Partnership Hub */}
                <button
                  type="button"
                  onClick={() => handleTabChange('INDUSTRY')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'INDUSTRY'
                      ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'INDUSTRY' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'INDUSTRY' ? 'text-white' : 'text-slate-300'}`}>
                      3. Industry & CSR Partnership Hub
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      CSR Foundations, Mentors & Impact Funders.
                    </p>
                  </div>
                </button>

                {/* 4. Student Innovators Portal */}
                <button
                  type="button"
                  onClick={() => handleTabChange('STUDENT')}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    activeTab === 'STUDENT'
                      ? 'bg-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${activeTab === 'STUDENT' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${activeTab === 'STUDENT' ? 'text-white' : 'text-slate-300'}`}>
                      4. Student Innovators Workspace
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Student Teams building prototypes & solutions.
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {activeTab === 'GOVT' && <Shield className="w-5 h-5 text-cyan-400" />}
                    {activeTab === 'HEI' && <Landmark className="w-5 h-5 text-purple-400" />}
                    {activeTab === 'INDUSTRY' && <HeartHandshake className="w-5 h-5 text-amber-400" />}
                    {activeTab === 'STUDENT' && <GraduationCap className="w-5 h-5 text-blue-400" />}
                    {activeTab === 'GOVT' && 'Government Command Centre'}
                    {activeTab === 'HEI' && 'University & HEI Portal'}
                    {activeTab === 'INDUSTRY' && 'Industry & CSR Partner Hub'}
                    {activeTab === 'STUDENT' && 'Student Innovators Portal'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRegisterMode ? 'Official Account Registration' : 'Existing Official Sign In'}
                  </p>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setError('');
                      setSuccessMessage('');
                    }}
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
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isRegisterMode
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Register
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Mode A: Existing User Sign In Form */}
              {!isRegisterMode ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Official Username / Email ID *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        placeholder="Official email id..."
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
                        : 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:brightness-110 shadow-blue-500/20'
                    }`}
                  >
                    {loading ? 'Authenticating...' : `Login to ${
                      activeTab === 'GOVT'
                        ? 'Command Centre'
                        : activeTab === 'HEI'
                        ? 'HEI Portal'
                        : activeTab === 'INDUSTRY'
                        ? 'CSR Portal'
                        : 'Student Portal'
                    }`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Mode B: New User Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Full Name */}
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        placeholder="e.g. Dr. Rajesh Sharma"
                      />
                    </div>
                  </div>

                  {/* Mail ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Official Mail ID *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        placeholder="e.g. name@satark.gov.in / name@institution.ac.in"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  {/* Institution / Department */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Department / Institution / Company Name
                    </label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={departmentOrInstitute}
                        onChange={(e) => setDepartmentOrInstitute(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        placeholder="e.g. Water Resources Dept / BIT Mesra / Tata Steel Foundation"
                      />
                    </div>
                  </div>

                  {/* Password and Confirm Password */}
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 cursor-pointer mt-2"
                  >
                    {loading ? 'Submitting Registration...' : 'Register Official Account & Access Portal'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Quick Demo One-Click Access Bar */}
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
                      onClick={() => handleQuickDemoSelect('FACULTY_MENTOR', '/hei')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      ⚡ Faculty Mentor (`faculty@bitmesra.ac.in`)
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
                {activeTab === 'STUDENT' && (
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('STUDENT_TEAM', '/student')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer"
                  >
                    ⚡ Student Team (`student@bitmesra.ac.in`)
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
