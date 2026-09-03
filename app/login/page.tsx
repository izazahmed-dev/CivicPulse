'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Shield, User, ArrowRight, CheckCircle, Zap, Activity, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'phone' | 'otp' | 'name' | 'done';

export default function LoginPage() {
  const { user, sendOtp, verifyOtp, setUserName } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/community');
    }
  }, [user, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      triggerShake();
      return;
    }
    setLoading(true);
    const masked = await sendOtp(cleaned);
    setMaskedPhone(masked);
    setLoading(false);
    setStep('otp');
    setCountdown(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 300);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === 6) {
      handleOtpVerify(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      // Focus the last input to show completion
      otpRefs.current[5]?.focus();
      handleOtpVerify(pasted);
    }
  };

  const handleOtpVerify = (code: string) => {
    setError('');
    const valid = verifyOtp(code);
    if (valid) {
      setStep('name');
    } else {
      setError('Invalid verification code');
      triggerShake();
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setOtp(['', '', '', '', '', '']);
    setError('');
    const cleaned = phone.replace(/\D/g, '');
    await sendOtp(cleaned);
    setResending(false);
    setCountdown(30);
    otpRefs.current[0]?.focus();
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Enter at least 2 characters');
      triggerShake();
      return;
    }
    setUserName(name.trim());
    setStep('done');
    setTimeout(() => router.push('/community'), 2000);
  };

  const stepVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  const shakeVariants = {
    shake: {
      x: [0, -12, 12, -10, 10, -6, 6, 0],
      transition: { duration: 0.5 },
    },
    idle: { x: 0 },
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Animated background ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] rounded-full bg-blue-500/[0.03] blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite 1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-teal-500/[0.03] blur-3xl" style={{ animation: 'pulse 5s ease-in-out infinite 2s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating water drops */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-emerald-500/[0.06]"
            initial={{ y: '110vh', x: `${15 + i * 18}vw`, rotate: 0 }}
            animate={{
              y: '-10vh',
              rotate: 360,
              transition: {
                duration: 14 + i * 4,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 2.5,
              },
            }}
          >
            <Zap size={18 + i * 10} />
          </motion.div>
        ))}
      </div>

      {/* ── Top bar ── */}
      <Link
        href="/"
        className="absolute top-6 left-6 text-white/30 hover:text-white/70 flex items-center gap-2 z-50 text-sm transition-colors"
      >
        <Activity size={18} /> CivicPulse
      </Link>

      {/* ── Main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(16,185,129,0.06)]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">CivicPulse</h1>
              <p className="text-[11px] text-white/30 tracking-widest font-mono">SECURE LOGIN</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {['phone', 'otp', 'name'].map((s, i) => (
              <React.Fragment key={s}>
                <motion.div
                  animate={{
                    scale: step === s ? 1.1 : 1,
                    backgroundColor:
                      step === s
                        ? '#10b981'
                        : ['phone', 'otp', 'name'].indexOf(step) > i || step === 'done'
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(255,255,255,0.05)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    color:
                      step === s
                        ? '#050505'
                        : ['phone', 'otp', 'name'].indexOf(step) > i || step === 'done'
                        ? '#10b981'
                        : 'rgba(255,255,255,0.25)',
                    boxShadow: step === s ? '0 0 20px rgba(16,185,129,0.3)' : 'none',
                  }}
                >
                  {['phone', 'otp', 'name'].indexOf(step) > i || step === 'done' ? (
                    <CheckCircle size={16} />
                  ) : (
                    i + 1
                  )}
                </motion.div>
                {i < 2 && (
                  <motion.div
                    className="flex-1 h-[2px] rounded-full"
                    animate={{
                      backgroundColor:
                        ['phone', 'otp', 'name'].indexOf(step) > i || step === 'done'
                          ? 'rgba(16,185,129,0.3)'
                          : 'rgba(255,255,255,0.04)',
                    }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Phone ── */}
            {step === 'phone' && (
              <motion.div
                key="phone"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">Enter your phone number</h2>
                  <p className="text-sm text-white/40">We&apos;ll send you a one-time verification code</p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <motion.div variants={shakeVariants} animate={shake ? 'shake' : 'idle'} className="relative">
                    <div className="absolute left-0 top-0 h-full flex items-center pl-4">
                      <span className="text-white/40 text-sm font-medium flex items-center gap-1.5 border-r border-white/10 pr-3">
                        <span className="text-lg">🇮🇳</span> +91
                      </span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        setError('');
                      }}
                      placeholder="98765 43210"
                      className="w-full bg-white/[0.04] text-white pl-24 pr-4 py-4 rounded-2xl border border-white/[0.08] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none text-lg font-mono tracking-widest transition-all"
                      autoFocus
                      inputMode="numeric"
                    />
                  </motion.div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-rose-400 text-sm flex items-center gap-1.5"
                    >
                      <Shield size={14} /> {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || phone.replace(/\D/g, '').length !== 10}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-2xl text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/30"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Get Verification Code <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] text-white/20">PROTECTED BY CIVICPULSE</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <p className="text-[11px] text-white/20 mt-4 text-center leading-relaxed">
                  By continuing, you agree to CivicPulse&apos;s Terms of Service.
                  <br />
                  Your number is used only for verification.
                </p>
              </motion.div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">Verify your identity</h2>
                  <p className="text-sm text-white/40">
                    6-digit code sent to{' '}
                    <span className="text-emerald-400 font-mono">+91 {maskedPhone}</span>
                  </p>
                </div>

                {/* OTP Boxes */}
                <motion.div
                  variants={shakeVariants}
                  animate={shake ? 'shake' : 'idle'}
                  className="flex gap-3 justify-center mb-6"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      animate={{
                        borderColor: digit
                          ? 'rgba(16,185,129,0.5)'
                          : error
                          ? 'rgba(244,63,94,0.5)'
                          : 'rgba(255,255,255,0.08)',
                        scale: digit ? 1.05 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none bg-white/[0.04] transition-shadow ${
                        digit
                          ? 'text-emerald-400 shadow-lg shadow-emerald-500/10'
                          : 'text-white focus:shadow-lg focus:shadow-emerald-500/10'
                      }`}
                      style={{
                        caretColor: '#10b981',
                      }}
                    />
                  ))}
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-rose-400 text-sm text-center mb-4 flex items-center justify-center gap-1.5"
                    >
                      <Shield size={14} /> {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Countdown / Resend */}
                <div className="text-center mt-4">
                  {countdown > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth="3"
                          />
                          <motion.circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={100.53}
                            animate={{ strokeDashoffset: 100.53 * (1 - countdown / 30) }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/50">
                          {countdown}
                        </span>
                      </div>
                      <p className="text-xs text-white/25">Resend available in {countdown}s</p>
                    </div>
                  ) : (
                    <motion.button
                      onClick={handleResend}
                      disabled={resending}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-emerald-400 text-sm font-medium hover:bg-white/[0.08] transition-all disabled:opacity-50"
                    >
                      <motion.div animate={resending ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, repeat: resending ? Infinity : 0, ease: 'linear' }}>
                        <RefreshCw size={14} />
                      </motion.div>
                      {resending ? 'Sending...' : 'Resend Code'}
                    </motion.button>
                  )}
                </div>


              </motion.div>
            )}

            {/* ── Step 3: Name ── */}
            {step === 'name' && (
              <motion.div
                key="name"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-400/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5"
                  >
                    <User className="text-emerald-400" size={28} />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white mb-1 text-center">Welcome, Guardian!</h2>
                  <p className="text-sm text-white/40 text-center">What should we call you?</p>
                </div>

                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <motion.div variants={shakeVariants} animate={shake ? 'shake' : 'idle'}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      placeholder="Your full name"
                      className="w-full bg-white/[0.04] text-white px-5 py-4 rounded-2xl border border-white/[0.08] focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none text-lg transition-all"
                      autoFocus
                    />
                  </motion.div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-sm">
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={name.trim().length < 2}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-2xl text-base transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
                  >
                    Join Community <ArrowRight size={18} />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Step 4: Done ── */}
            {step === 'done' && (
              <motion.div
                key="done"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle className="text-white" size={40} />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">You&apos;re In!</h2>
                <p className="text-white/40">Redirecting to Community...</p>
                <div className="mt-4 w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/[0.06] rounded-full blur-3xl" />
      </motion.div>
    </main>
  );
}
