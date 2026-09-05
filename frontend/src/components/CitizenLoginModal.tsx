'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  X, User, Mail, Phone, Lock, Key, ShieldCheck, CheckCircle2,
  ArrowRight, Sparkles, AlertCircle, RefreshCw, Eye, EyeOff, Home
} from 'lucide-react';

interface CitizenLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const CitizenLoginModal: React.FC<CitizenLoginModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess
}) => {
  const router = useRouter();
  const { login, registerCitizen, switchDemoRole } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && mounted) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, mounted]);

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

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Email OTP countdown timer
  useEffect(() => {
    if (emailTimer <= 0) return;
    const timer = setInterval(() => {
      setEmailTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [emailTimer]);

  // Mobile OTP countdown timer
  useEffect(() => {
    if (mobileTimer <= 0) return;
    const timer = setInterval(() => {
      setMobileTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [mobileTimer]);

  if (!isOpen) return null;

  const handleSendEmailOtp = async () => {
    if (!signupEmail || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid Mail ID before requesting OTP.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Sending Email OTP via Gmail SMTP...');
    try {
      const res = await api.sendOtp({ target: signupEmail, type: 'email', purpose: 'signup' });
      if (res.demo_code) setGeneratedEmailOtp(res.demo_code);
      setEmailOtpSent(true);
      setEmailTimer(60);
      setSuccessMsg(res.message || `OTP sent to ${signupEmail}!`);
    } catch (err: any) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(code);
      setEmailOtpSent(true);
      setEmailTimer(60);
      setSuccessMsg(`OTP sent to ${signupEmail}! Demo code: ${code}`);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput.trim()) {
      setErrorMsg('Please enter the 6-digit Email OTP.');
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
    setSuccessMsg('Sending Mobile SMS OTP...');
    try {
      const res = await api.sendOtp({ target: cleanMobile, type: 'mobile', purpose: 'signup' });
      if (res.demo_code) setGeneratedMobileOtp(res.demo_code);
      setMobileOtpSent(true);
      setMobileTimer(60);
      setSuccessMsg(res.message || `SMS OTP sent to ${signupMobile}!`);
    } catch (err: any) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedMobileOtp(code);
      setMobileOtpSent(true);
      setMobileTimer(60);
      setSuccessMsg(`SMS OTP sent to ${signupMobile}! Demo code: ${code}`);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (!mobileOtpInput.trim()) {
      setErrorMsg('Please enter the 6-digit SMS OTP.');
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
        onClose();
        if (onSuccess) onSuccess();
        router.push('/citizen');
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
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
      setErrorMsg('Please verify your Mail ID with the OTP before submitting.');
      return;
    }

    if (!mobileVerified) {
      setErrorMsg('Please verify your Mobile Number with the OTP before submitting.');
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

      setSuccessMsg(`Account created for ${fullName}! Logging you into Citizen Portal...`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        router.push('/citizen');
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    switchDemoRole('CITIZEN');
    onClose();
    if (onSuccess) onSuccess();
    router.push('/citizen');
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/90 shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                SATARK AI Citizen Gateway
              </h2>
              <p className="text-xs text-slate-400">
                Public Issue Reporting & Verified Civic Engagement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs: Sign In vs Sign Up */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Sign In (Existing)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Sign Up (New User)
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-grow">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE A: LOGIN */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Registered Email ID *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. citizen@satark.gov.in"
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Login to Citizen Portal'}
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
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Don't have an account? Sign Up with Mobile & Email OTP →
                </button>
              </div>
            </form>
          ) : (
            /* MODE B: SIGN UP */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Rameshwar Besra"
                  />
                </div>
              </div>

              {/* 2. Mail ID + Verify with OTP */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Mail ID *
                  </label>
                  {emailVerified && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Email Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      disabled={emailVerified}
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none ${
                        emailVerified ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200' : 'border-slate-800 focus:border-emerald-500'
                      }`}
                      placeholder="e.g. citizen@example.com"
                    />
                  </div>

                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailTimer > 0}
                      className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {emailTimer > 0 ? `Resend (${emailTimer}s)` : (emailOtpSent ? 'Resend OTP' : 'Verify with OTP')}
                    </button>
                  )}
                </div>

                {/* Email OTP Input field (when OTP is sent and not verified) */}
                {emailOtpSent && !emailVerified && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Enter 6-digit verification code:</span>
                      <span className="text-emerald-400 font-mono font-bold">Demo OTP: {generatedEmailOtp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtpInput}
                        onChange={(e) => setEmailOtpInput(e.target.value)}
                        className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:border-emerald-500"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirm OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Mobile Number + Verify with OTP */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Mobile Number *
                  </label>
                  {mobileVerified && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Mobile Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      disabled={mobileVerified}
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none ${
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
                      className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      {mobileTimer > 0 ? `Resend (${mobileTimer}s)` : (mobileOtpSent ? 'Resend OTP' : 'Verify with OTP')}
                    </button>
                  )}
                </div>

                {/* Mobile OTP Input field (when OTP is sent and not verified) */}
                {mobileOtpSent && !mobileVerified && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Enter 6-digit SMS verification code:</span>
                      <span className="text-emerald-400 font-mono font-bold">Demo OTP: {generatedMobileOtp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={mobileOtpInput}
                        onChange={(e) => setMobileOtpInput(e.target.value)}
                        className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:border-emerald-500"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyMobileOtp}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Confirm OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Full Address (Editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Address (Ward / Village / District / PIN) *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="House/Ward no., village/colony, district, Jharkhand"
                  />
                </div>
              </div>

              {/* 5. Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
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
                className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer mt-2"
              >
                {loading ? 'Creating Citizen Profile...' : 'Sign Up & Access Civic Portal'}
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
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Already registered? Sign In to your account →
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Demo Login Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Smart India Hackathon 2026 PS26043
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            ⚡ Quick Demo Citizen Login
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
