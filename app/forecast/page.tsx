'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import {
    ArrowLeft, AlertTriangle, TrendingUp, MapPin, Clock, Waves,
    ThermometerSun, Users, BarChart3, RefreshCw, BrainCircuit,
    Newspaper, Search, Shield, Zap, Radio, ChevronDown,
    Activity, Gauge, Satellite, FileText
} from 'lucide-react';

/* ═══════════════════════════════ TYPES ═══════════════════════════════ */

interface IntelAnalysis {
    cityAnalyzed: string;
    overallRisk: 'low' | 'moderate' | 'high' | 'critical';
    supplyPrediction: 'normal' | 'reduced' | 'intermittent' | 'severe_shortage';
    confidenceScore: number;
    summary: string;
    riskFactors: { factor: string; severity: string; source: string }[];
    positiveSignals: { signal: string; source: string }[];
    damStatus: { level: string; trend: string; details: string };
    advisoryMessage: string;
    sourcesUsed: { title: string; snippet: string; relevance: string }[];
}

interface DayForecast {
    day: string;
    date: string;
    prediction: 'full_supply' | 'low_pressure' | 'intermittent' | 'dry_taps';
    probability: number;
    reason: string;
}

interface AreaForecast {
    area: string;
    riskScore: number;
    prediction: 'full_supply' | 'low_pressure' | 'intermittent' | 'dry_taps';
    probability: number;
    complaintCount: number;
    recentReports: number;
    schedule: string;
    forecast5Day: DayForecast[];
}

/* ═══════════════════════════════ CONFIG ═══════════════════════════════ */

const STATUS = {
    full_supply:     { label: 'Full Supply',  emoji: '💧', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'from-emerald-600 to-emerald-400' },
    low_pressure:    { label: 'Low Pressure', emoji: '🔽', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   bar: 'from-amber-600 to-amber-400'   },
    intermittent:    { label: 'Intermittent',  emoji: '⚡', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  bar: 'from-orange-600 to-orange-400'  },
    dry_taps:        { label: 'Dry Taps',     emoji: '🛑', color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    bar: 'from-rose-600 to-rose-400'      },
} as const;

const RISK = {
    low:      { label: 'Low Risk',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', emoji: '✅' },
    moderate: { label: 'Moderate',  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   emoji: '⚠️' },
    high:     { label: 'High Risk', color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  emoji: '🔶' },
    critical: { label: 'Critical',  color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    emoji: '🛑' },
} as const;

const SUPPLY = {
    normal:           { label: 'Normal Supply',    emoji: '💧', color: 'text-emerald-400' },
    reduced:          { label: 'Reduced Supply',   emoji: '🔽', color: 'text-amber-400'   },
    intermittent:     { label: 'Intermittent',     emoji: '⚡', color: 'text-orange-400'  },
    severe_shortage:  { label: 'Severe Shortage',  emoji: '🛑', color: 'text-rose-400'    },
} as const;

const CITIES = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur'];

/* ═══════════════════════════════ COMPONENT ═══════════════════════════════ */

export default function ForecastPage() {
    // Live view
    const [forecasts, setForecasts] = useState<AreaForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedArea, setExpandedArea] = useState<string | null>(null);

    // AI view
    const [mode, setMode] = useState<'live' | 'ai'>('live');
    const [city, setCity] = useState('Chennai');
    const [intel, setIntel] = useState<IntelAnalysis | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scannedAt, setScannedAt] = useState<string | null>(null);

    /* ─── Data fetching ─── */
    const loadForecasts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/forecast');
            const data = await res.json();
            if (Array.isArray(data)) setForecasts(data);
        } catch (err) {
            console.error('Forecast load failed:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadForecasts(); }, [loadForecasts]);

    const runIntelScan = async () => {
        if (!city.trim()) return;
        setScanning(true);
        setScanError(null);
        setIntel(null);
        try {
            const res = await fetch(`/api/water-intel?city=${encodeURIComponent(city.trim())}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Scan failed');
            if (json.success && json.analysis) {
                setIntel(json.analysis);
                setScannedAt(json.scrapedAt);
            } else {
                throw new Error('Invalid API response');
            }
        } catch (err: any) {
            setScanError(err.message || 'Intelligence scan failed. Try again.');
        } finally {
            setScanning(false);
        }
    };

    /* ─── Derived stats ─── */
    const critical = forecasts.filter(f => f.prediction === 'dry_taps').length;
    const warning  = forecasts.filter(f => f.prediction === 'intermittent' || f.prediction === 'low_pressure').length;
    const safe     = forecasts.filter(f => f.prediction === 'full_supply').length;

    return (
        <PageTransition>
            <main className="min-h-screen bg-[#050505] text-white">
                {/* ════════════ HEADER ════════════ */}
                <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.06]">
                    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/#cta-section" className="text-white/30 hover:text-white transition-colors">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <ThermometerSun className="w-5 h-5 text-cyan-400" />
                                    <h1 className="text-lg font-bold">Civic Forecast</h1>
                                </div>
                                <p className="text-xs text-white/30 hidden sm:block">
                                    AI-powered civic supply predictions
                                </p>
                            </div>
                        </div>

                        {/* Mode toggle */}
                        <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 relative">
                            <div
                                className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
                                    mode === 'ai'
                                        ? 'translate-x-[calc(100%+4px)] bg-violet-500/10 border border-violet-500/20'
                                        : 'translate-x-0 bg-white/10 border border-white/10'
                                }`}
                            />
                            <button
                                onClick={() => setMode('live')}
                                className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 z-10 w-32 justify-center ${
                                    mode === 'live' ? 'text-white' : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                <Activity size={14} /> Live Data
                            </button>
                            <button
                                onClick={() => setMode('ai')}
                                className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 z-10 w-32 justify-center ${
                                    mode === 'ai' ? 'text-violet-400' : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                <BrainCircuit size={14} className={mode === 'ai' ? 'animate-pulse' : ''} />
                                AI Intel
                            </button>
                        </div>

                        <button
                            onClick={mode === 'live' ? loadForecasts : runIntelScan}
                            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all text-xs text-white/50"
                        >
                            <RefreshCw size={14} className={loading || scanning ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
                    <AnimatePresence mode="wait">
                        {mode === 'live' ? (
                            /* ════════════ LIVE VIEW ════════════ */
                            <motion.div key="live" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                {loading ? (
                                    <div className="flex items-center justify-center py-32">
                                        <div className="text-center">
                                            <Gauge className="w-12 h-12 text-cyan-400/40 mx-auto mb-4 animate-pulse" />
                                            <p className="text-white/30 text-sm">Analyzing area data…</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* ── Summary strip ── */}
                                        <div className="grid grid-cols-3 gap-3 mb-8">
                                            {[
                                                { n: critical, label: 'Critical', color: 'rose',    icon: AlertTriangle, desc: 'Dry taps expected' },
                                                { n: warning,  label: 'Warning',  color: 'amber',   icon: Waves,         desc: 'Possible disruptions' },
                                                { n: safe,     label: 'Safe',     color: 'emerald', icon: TrendingUp,    desc: 'Full supply expected' },
                                            ].map((s, i) => (
                                                <motion.div
                                                    key={s.label}
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.08 }}
                                                    className={`rounded-2xl border p-4 bg-gradient-to-br from-${s.color}-500/10 to-transparent border-${s.color}-500/20`}
                                                >
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/20 flex items-center justify-center`}>
                                                            <s.icon className={`w-4 h-4 text-${s.color}-400`} />
                                                        </div>
                                                        <p className={`text-2xl font-black text-${s.color}-400`}>{s.n}</p>
                                                    </div>
                                                    <p className="text-[10px] uppercase tracking-wider text-white/25">{s.desc}</p>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* ── Area cards ── */}
                                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-4">
                                            Area-wise Forecast
                                        </h2>
                                        <div className="space-y-3 mb-8">
                                            {forecasts.map((f, i) => {
                                                const cfg = STATUS[f.prediction];
                                                const isOpen = expandedArea === f.area;
                                                return (
                                                    <motion.div
                                                        key={f.area}
                                                        initial={{ opacity: 0, y: 12 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.04 }}
                                                    >
                                                        <button
                                                            onClick={() => setExpandedArea(isOpen ? null : f.area)}
                                                            className={`w-full text-left rounded-2xl border p-5 transition-all ${
                                                                isOpen
                                                                    ? `${cfg.bg} ${cfg.border}`
                                                                    : 'bg-white/[0.015] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03]'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <span className="text-xl">{cfg.emoji}</span>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-semibold text-white/80 truncate">{f.area}</p>
                                                                        <p className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right hidden sm:block">
                                                                        <p className="text-xs text-white/25">{f.recentReports} reports today</p>
                                                                        <p className="text-xs text-white/20">{f.complaintCount} this week</p>
                                                                    </div>
                                                                    {/* Risk gauge */}
                                                                    <div className="w-12 h-12 relative">
                                                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                                                            <circle
                                                                                cx="18" cy="18" r="15.5" fill="none"
                                                                                strokeWidth="3" strokeLinecap="round"
                                                                                stroke={f.riskScore >= 75 ? '#f43f5e' : f.riskScore >= 50 ? '#f97316' : f.riskScore >= 25 ? '#f59e0b' : '#10b981'}
                                                                                strokeDasharray={`${f.riskScore} ${100 - f.riskScore}`}
                                                                            />
                                                                        </svg>
                                                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/60">{f.riskScore}</span>
                                                                    </div>
                                                                    <ChevronDown size={16} className={`text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                                </div>
                                                            </div>
                                                        </button>

                                                        {/* Expanded 5-day forecast */}
                                                        <AnimatePresence>
                                                            {isOpen && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="pt-3 pb-1 px-2">
                                                                        <div className="flex items-center gap-2 mb-4 text-xs text-white/30">
                                                                            <BarChart3 size={14} className="text-cyan-400" />
                                                                            <span className="font-bold uppercase tracking-wider">5-Day Outlook</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-5 gap-2">
                                                                            {f.forecast5Day.map((d, j) => {
                                                                                const dc = STATUS[d.prediction];
                                                                                return (
                                                                                    <motion.div
                                                                                        key={d.day}
                                                                                        initial={{ opacity: 0, y: 8 }}
                                                                                        animate={{ opacity: 1, y: 0 }}
                                                                                        transition={{ delay: j * 0.06 }}
                                                                                        className={`text-center p-3 rounded-xl border ${j === 0 ? `${dc.bg} ${dc.border}` : 'bg-white/[0.015] border-white/[0.04]'}`}
                                                                                    >
                                                                                        <p className="text-[10px] text-white/30 font-semibold mb-0.5">{d.day.slice(0, 3)}</p>
                                                                                        <p className="text-[9px] text-white/15 mb-2">{d.date}</p>
                                                                                        <span className="text-xl block mb-1">{dc.emoji}</span>
                                                                                        <p className={`text-[9px] font-bold ${dc.color}`}>{dc.label}</p>
                                                                                        <p className="text-[8px] text-white/15 mt-1 leading-tight">{d.reason}</p>
                                                                                    </motion.div>
                                                                                );
                                                                            })}
                                                                        </div>

                                                                        {/* Advisory for high-risk areas */}
                                                                        {f.riskScore > 50 && (
                                                                            <div className="mt-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-start gap-2">
                                                                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                                                                <p className="text-[11px] text-white/40">
                                                                                    High disruption risk — consider filling storage tanks tonight.
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* ── How it works ── */}
                                        <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-6">
                                            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/20 mb-4">How it works</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { icon: Users, title: 'Community Reports', desc: 'Citizen complaints are aggregated in real-time to detect emerging patterns.' },
                                                    { icon: Clock, title: 'Municipal Schedules', desc: 'Planned maintenance, pump servicing, and cleaning schedules are factored in.' },
                                                    { icon: TrendingUp, title: 'AI Prediction', desc: 'Our model combines all signals to forecast disruptions up to 5 days ahead.' },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                                            <item.icon className="w-4 h-4 text-cyan-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-white/60 mb-0.5">{item.title}</p>
                                                            <p className="text-xs text-white/25 leading-relaxed">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            /* ════════════ AI INTELLIGENCE VIEW ════════════ */
                            <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                {/* Header */}
                                <div className="mb-6">
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                        <Satellite className="text-violet-400" />
                                        Civic Intelligence Scanner
                                    </h2>
                                    <p className="text-white/35 text-sm mt-1 max-w-2xl">
                                        Scrapes live news from Google News, dam bulletins, and government updates — then uses Gemini AI to predict supply outlook for your city.
                                    </p>
                                </div>

                                {/* City selector */}
                                <div className="mb-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                                    <label className="text-[10px] text-white/25 uppercase tracking-wider font-bold mb-3 block">Select Your City</label>
                                    <div className="flex gap-3 mb-3">
                                        <div className="flex-1 relative">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={e => setCity(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && runIntelScan()}
                                                placeholder="Enter city name…"
                                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={runIntelScan}
                                            disabled={scanning || !city.trim()}
                                            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-violet-600 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 flex items-center gap-2"
                                        >
                                            <Radio size={16} className={scanning ? 'animate-pulse' : ''} />
                                            {scanning ? 'Scanning…' : 'Scan Intel'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {CITIES.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setCity(c)}
                                                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                                                    city === c
                                                        ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                                                        : 'bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/60'
                                                }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Scanning state ── */}
                                {scanning && (
                                    <div className="w-full border border-violet-500/10 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent p-12 flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <Satellite className="w-12 h-12 text-violet-500/40" />
                                            <motion.div
                                                className="absolute inset-0 rounded-full border-2 border-violet-400/30"
                                                animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            />
                                        </div>
                                        <p className="text-violet-400/80 font-mono tracking-widest text-sm uppercase mb-2">Scanning News Sources…</p>
                                        <p className="text-white/20 text-xs text-center max-w-sm">
                                            Fetching from Google News RSS, government bulletins, and analyzing with Gemini AI…
                                        </p>
                                        <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-violet-600 to-indigo-400"
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 12, ease: 'easeInOut' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── Error state ── */}
                                {scanError && !scanning && (
                                    <div className="w-full p-8 border border-dashed border-rose-500/20 rounded-2xl bg-rose-500/5 flex flex-col items-center text-center">
                                        <AlertTriangle className="w-10 h-10 text-rose-400/50 mb-3" />
                                        <h3 className="text-white font-bold mb-1">Intelligence Scan Failed</h3>
                                        <p className="text-white/40 text-sm max-w-md">{scanError}</p>
                                        <button
                                            onClick={runIntelScan}
                                            className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                                        >
                                            Retry Scan
                                        </button>
                                    </div>
                                )}

                                {/* ── Results ── */}
                                {intel && !scanning && (
                                    <div className="space-y-4">
                                        {/* Outlook banner */}
                                        {(() => {
                                            const r = RISK[intel.overallRisk] || RISK.moderate;
                                            const s = SUPPLY[intel.supplyPrediction] || SUPPLY.normal;
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`rounded-2xl border ${r.border} ${r.bg} p-6 relative overflow-hidden`}
                                                >
                                                    <div className="absolute top-3 right-3 text-5xl opacity-[0.06]">🛰️</div>
                                                    <div className="relative z-10">
                                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                            <div>
                                                                <p className="text-[10px] text-white/25 uppercase tracking-wider font-bold mb-1">Civic Supply Outlook — {intel.cityAnalyzed}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-3xl">{s.emoji}</span>
                                                                    <span className={`text-2xl font-black ${s.color}`}>{s.label}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${r.bg} ${r.border} border`}>
                                                                    <span>{r.emoji}</span>
                                                                    <span className={`font-bold text-sm ${r.color}`}>{r.label}</span>
                                                                </div>
                                                                <p className="text-[10px] text-white/20 mt-1">Confidence: {Math.round(intel.confidenceScore * 100)}%</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-white/55 leading-relaxed mb-4">{intel.summary}</p>
                                                        <div className="p-3 rounded-xl bg-black/20 border border-white/[0.05] flex items-start gap-3">
                                                            <Zap size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                                            <p className="text-sm text-white/65 font-medium">{intel.advisoryMessage}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}

                                        {/* Dam + Risks grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Dam status */}
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                                                <h3 className="text-[10px] text-white/25 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                                                    <Waves size={14} className="text-cyan-400" /> Dam / Reservoir
                                                </h3>
                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-white/35">Level</span>
                                                        <span className="text-white/75 font-semibold">{intel.damStatus.level}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-white/35">Trend</span>
                                                        <span className={`font-semibold capitalize ${
                                                            intel.damStatus.trend === 'rising' ? 'text-emerald-400' :
                                                            intel.damStatus.trend === 'falling' ? 'text-rose-400' :
                                                            'text-white/50'
                                                        }`}>{intel.damStatus.trend}</span>
                                                    </div>
                                                    {intel.damStatus.details && (
                                                        <p className="text-[11px] text-white/25 pt-2 border-t border-white/[0.04]">{intel.damStatus.details}</p>
                                                    )}
                                                </div>
                                            </motion.div>

                                            {/* Risk factors */}
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                                                <h3 className="text-[10px] text-white/25 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                                                    <Shield size={14} className="text-orange-400" /> Risk Analysis
                                                </h3>
                                                {intel.riskFactors.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {intel.riskFactors.slice(0, 4).map((rf, i) => (
                                                            <div key={i} className="flex items-start gap-2">
                                                                <span className={`text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                                                    rf.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                                                    rf.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                                    'bg-white/[0.06] text-white/35'
                                                                }`}>{rf.severity}</span>
                                                                <p className="text-xs text-white/45 leading-relaxed">{rf.factor}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-white/20">No significant risk factors detected.</p>
                                                )}
                                                {intel.positiveSignals.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                                                        <p className="text-[9px] text-emerald-400/50 uppercase tracking-wider font-bold mb-1.5">Positive Signals</p>
                                                        {intel.positiveSignals.slice(0, 2).map((ps, i) => (
                                                            <p key={i} className="text-xs text-emerald-400/40 mb-0.5">✓ {ps.signal}</p>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        </div>

                                        {/* Sources */}
                                        {intel.sourcesUsed?.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                                                <h3 className="text-[10px] text-white/25 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                                                    <FileText size={14} className="text-violet-400" /> Intelligence Sources
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                    {intel.sourcesUsed.map((src, i) => (
                                                        <div key={i} className="p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                                <p className="text-[11px] font-semibold text-white/50 line-clamp-1">{src.title}</p>
                                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full flex-shrink-0 uppercase font-bold ${
                                                                    src.relevance === 'high' ? 'bg-violet-500/20 text-violet-400' :
                                                                    src.relevance === 'medium' ? 'bg-white/[0.06] text-white/35' :
                                                                    'bg-white/[0.03] text-white/15'
                                                                }`}>{src.relevance}</span>
                                                            </div>
                                                            <p className="text-[10px] text-white/25 line-clamp-2 leading-relaxed">{src.snippet}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {scannedAt && (
                                                    <p className="text-[9px] text-white/12 mt-3 flex items-center gap-1">
                                                        <Clock size={10} /> Scanned {new Date(scannedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {/* Empty state */}
                                {!intel && !scanning && !scanError && (
                                    <div className="w-full border border-dashed border-white/[0.08] rounded-2xl p-12 flex flex-col items-center text-center">
                                        <Satellite className="w-14 h-14 text-white/8 mb-4" />
                                        <h3 className="text-white/50 font-bold text-lg mb-1">Select a City & Scan</h3>
                                        <p className="text-white/20 text-sm max-w-md">
                                            Choose a city above and click &quot;Scan Intel&quot; to scrape the latest news and government updates for AI-powered supply prediction.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </PageTransition>
    );
}
