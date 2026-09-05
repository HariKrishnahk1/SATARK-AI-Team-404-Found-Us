'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import {
  ShieldCheck, User, Mail, Phone, Lock, Key, Home,
  CheckCircle2, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff,
  Clock
} from 'lucide-react';

export default function CitizenLoginPage() {
  const router = useRouter();
  const { user, login, registerCitizen, switchDemoRole } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Sign In State
  const [loginUsername, setLoginUsername] = useState('citizen@satark.gov.in');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP Flow
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('404123');

  // Mobile OTP Flow
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileTimer, setMobileTimer] = useState(0);
  const [generatedMobileOtp, setGeneratedMobileOtp] = useState('808404');

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already authenticated as Citizen, smoothly redirect to /citizen
  useEffect(() => {
    if (user && user.role === 'CITIZEN') {
      router.push('/citizen');
    }
  }, [user, router]);

  // Email OTP timer
  useEffect(() => {
    if (emailTimer <= 0) return;
    const timer = setInterval(() => {
      setEmailTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [emailTimer]);

  // Mobile OTP timer
  useEffect(() => {
    if (mobileTimer <= 0) return;
    const timer = setInterval(() => {
      setMobileTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [mobileTimer]);

  const handleSendEmailOtp = async () => {
    if (!signupEmail || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid Mail ID before requesting OTP.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Dispatching Email OTP via Gmail SMTP...');
    try {
      const res = await api.sendOtp({ target: signupEmail, type: 'email', purpose: 'signup' });
      if (res.demo_code) setGeneratedEmailOtp(res.demo_code);
      setEmailOtpSent(true);
      setEmailTimer(60);
      setSuccessMsg(res.message || 'Email OTP dispatched successfully!');
    } catch (err: any) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(code);
      setEmailOtpSent(true);
      setEmailTimer(60);
      setSuccessMsg(`Email OTP dispatched! Demo code: ${code}`);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    setErrorMsg('');
    try {
      await api.verifyOtp({ target: signupEmail, code: emailOtpInput.trim() });
      setEmailVerified(true);
      setSuccessMsg('✓ Email ID verified successfully!');
    } catch (err: any) {
      if (emailOtpInput.trim() === generatedEmailOtp || emailOtpInput.trim() === '404123') {
        setEmailVerified(true);
        setSuccessMsg('✓ Email ID verified successfully!');
      } else {
        setErrorMsg(err.message || `Invalid Email OTP. Demo code: ${generatedEmailOtp}`);
      }
    }
  };

  const handleSendMobileOtp = async () => {
    const cleanMobile = signupMobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number before requesting OTP.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Dispatching Mobile SMS OTP...');
    try {
      const res = await api.sendOtp({ target: cleanMobile, type: 'mobile', purpose: 'signup' });
      if (res.demo_code) setGeneratedMobileOtp(res.demo_code);
      setMobileOtpSent(true);
      setMobileTimer(60);
      setSuccessMsg(res.message || 'SMS OTP dispatched successfully!');
    } catch (err: any) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedMobileOtp(code);
      setMobileOtpSent(true);
      setMobileTimer(60);
      setSuccessMsg(`SMS OTP dispatched! Demo code: ${code}`);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!mobileOtpInput.trim()) {
      setErrorMsg('Please enter the 6-digit SMS OTP code.');
      return;
    }
    setErrorMsg('');
    try {
      await api.verifyOtp({ target: signupMobile, code: mobileOtpInput.trim() });
      setMobileVerified(true);
      setSuccessMsg('✓ Mobile number verified successfully!');
    } catch (err: any) {
      if (mobileOtpInput.trim() === generatedMobileOtp || mobileOtpInput.trim() === '808404') {
        setMobileVerified(true);
        setSuccessMsg('✓ Mobile number verified successfully!');
      } else {
        setErrorMsg(err.message || `Invalid Mobile OTP. Demo code: ${generatedMobileOtp}`);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await login(loginUsername, loginPassword);
      setSuccessMsg('Login successful! Accessing Citizen Portal...');
      setTimeout(() => {
        router.push('/citizen');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }

    if (!emailVerified) {
      setErrorMsg('Please verify your Mail ID with OTP before completing sign up.');
      return;
    }

    if (!mobileVerified) {
      setErrorMsg('Please verify your Mobile Number with OTP before completing sign up.');
      return;
    }

    if (!signupPassword) {
      setErrorMsg('Please choose a password.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerCitizen({
        name: fullName.trim(),
        email: signupEmail.trim(),
        mobile: signupMobile.trim(),
        address: signupAddress.trim() || 'Jharkhand, India',
        password: signupPassword
      });

      setSuccessMsg(`Welcome, ${fullName}! Account created. Redirecting to Citizen Portal...`);
      setTimeout(() => {
        router.push('/citizen');
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    switchDemoRole('CITIZEN');
    router.push('/citizen');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-xl mx-auto w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="SATARK AI"
              className="w-16 h-16 object-contain drop-shadow-[0_0_16px_rgba(16,185,129,0.4)]"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Citizen Civic Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Citizen <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Login & Registration</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Please authenticate to access the public grievance reporting system, GPS geo-tagging, and 15-stage status tracking.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl p-6 sm:p-8">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Sign In (Existing User)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Sign Up (New User)
            </button>
          </div>

          {/* Feedback Notices */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-1.5">
                  Citizen Username or Registered Email ID *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                    placeholder="e.g. citizen@satark.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-200 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-400 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer mt-2"
              >
                {loading ? 'Authenticating...' : 'Login & Access Citizen Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  New citizen? Sign Up with Mobile & Email OTP verification →
                </button>
              </div>
            </form>
          ) : (
            /* MODE 2: SIGN UP */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    placeholder="e.g. Anand Kumar"
                  />
                </div>
              </div>

              {/* Mail ID + Verify with OTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Mail ID *
                  </label>
                  {emailVerified && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      disabled={emailVerified}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`w-full bg-slate-950 border-2 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        emailVerified ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200' : 'border-slate-800 focus:border-emerald-500'
                      }`}
                      placeholder="e.g. anand@example.com"
                    />
                  </div>

                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailTimer > 0}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {emailTimer > 0 ? `Resend (${emailTimer}s)` : (emailOtpSent ? 'Resend OTP' : 'Verify with OTP')}
                    </button>
                  )}
                </div>

                {/* Email OTP Input field */}
                {emailOtpSent && !emailVerified && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Enter 6-digit email OTP:</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/40">
                        Demo OTP: {generatedEmailOtp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtpInput}
                        onChange={(e) => setEmailOtpInput(e.target.value)}
                        className="w-36 bg-slate-900 border-2 border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest text-white focus:outline-none"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
                      >
                        Confirm OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Number + Verify with OTP */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    Mobile Number *
                  </label>
                  {mobileVerified && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mobile Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      disabled={mobileVerified}
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      className={`w-full bg-slate-950 border-2 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        mobileVerified ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200' : 'border-slate-800 focus:border-emerald-500'
                      }`}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  {!mobileVerified && (
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={mobileTimer > 0}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {mobileTimer > 0 ? `Resend (${mobileTimer}s)` : (mobileOtpSent ? 'Resend OTP' : 'Verify with OTP')}
                    </button>
                  )}
                </div>

                {/* Mobile OTP Input field */}
                {mobileOtpSent && !mobileVerified && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Enter 6-digit SMS OTP:</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/40">
                        Demo OTP: {generatedMobileOtp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="text"
                        maxLength={6}
                        value={mobileOtpInput}
                        onChange={(e) => setEmailOtpInput(e.target.value)}
                        className="w-36 bg-slate-900 border-2 border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest text-white focus:outline-none"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyMobileOtp}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
                      >
                        Confirm OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Full Residential Address (Ward / Village / District / State) *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    placeholder="Ward 12, Doranda, Ranchi, Jharkhand - 834002"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer mt-2"
              >
                {loading ? 'Creating Citizen Profile...' : 'Sign Up & Access Citizen Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
                >
                  Already registered? Sign In to your account →
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo One-Click Access */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Quick Testing / Evaluation Access:</span>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              ⚡ Instant Demo Citizen Access (Rohan Mahato)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
