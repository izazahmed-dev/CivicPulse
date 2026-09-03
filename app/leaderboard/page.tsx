'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import {
    ArrowLeft, Trophy, Medal, Droplets, Users, TrendingUp, TrendingDown,
    Minus, Award, Star, ChevronUp, ChevronDown, BarChart3, Target,
    Zap, Shield, Crown, Sparkles
} from 'lucide-react';

interface NeighborhoodScore {
    name: string;
    city: string;
    litersSaved: number;
    reportsCount: number;
    resolvedCount: number;
    activeUsers: number;
    rank: number;
    weeklyChange: number;
    badges: string[];
}

interface BadgeDef {
    id: string;
    name: string;
    emoji: string;
    minReports: number;
}

interface LeaderboardData {
    leaderboard: NeighborhoodScore[];
    totalLitersSaved: number;
    totalReports: number;
    badges: BadgeDef[];
}

const RANK_COLORS = [
    { bg: 'bg-gradient-to-br from-amber-400/20 to-yellow-600/20', border: 'border-amber-400/40', text: 'text-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]' },
    { bg: 'bg-gradient-to-br from-slate-300/20 to-gray-500/20', border: 'border-slate-300/40', text: 'text-slate-300', glow: 'shadow-[0_0_20px_rgba(203,213,225,0.2)]' },
    { bg: 'bg-gradient-to-br from-orange-400/20 to-amber-700/20', border: 'border-orange-500/40', text: 'text-orange-400', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]' },
];

function formatLiters(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
}

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

    useEffect(() => {
        let active = true;
        fetch(`/api/leaderboard?timeframe=${timeframe}`)
            .then(res => res.json())
            .then(d => { 
                if (active) {
                    setData(d); 
                    setLoading(false); 
                }
            })
            .catch(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [timeframe]);

    const handleTimeframeChange = (t: 'week' | 'month') => {
        setLoading(true);
        setTimeframe(t);
    };

    if (loading) {
        return (
            <PageTransition>
                <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">        
                    <div className="text-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Trophy className="w-14 h-14 text-amber-400/50 mx-auto mb-5 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                        </motion.div>
                        <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Syncing Leaderboard...</p>
                    </div>
                </main>
            </PageTransition>
        );
    }

    if (!data) return null;
    const { leaderboard, totalLitersSaved, totalReports, badges } = data;

    const maxLiters = leaderboard.length > 0 ? leaderboard[0].litersSaved : 1;

    return (
        <PageTransition>
            <main className="min-h-screen bg-[#050505] text-white">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/[0.06]">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">     
                        <div className="flex items-center gap-5">
                            <Link href="/#cta-section" className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
                                <ArrowLeft size={18} />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                    <h1 className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                        Conservation Protocol
                                    </h1>
                                </div>
                                <p className="text-[11px] text-emerald-400/80 uppercase tracking-widest font-semibold font-mono">
                                    Live Community Rankings
                                </p>
                            </div>
                        </div>

                        {/* Time Filter */}
                        <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.05] shadow-inner">
                            {(['week', 'month'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleTimeframeChange(t)}
                                    className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                        timeframe === t
                                            ? 'text-white'
                                            : 'text-white/40 hover:text-white/70'
                                    }`}
                                >
                                    {timeframe === t && (
                                        <motion.div
                                            layoutId="timeFilter"
                                            className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg -z-10 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/30"
                                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}        
                                        />
                                    )}
                                    <span className="relative z-10">{t === 'week' ? 'This Week' : 'This Month'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                        {[
                            { icon: Droplets, val: formatLiters(totalLitersSaved) + 'L', desc: 'Saved Citywide', color: 'cyan' },
                            { icon: Target, val: totalReports.toString(), desc: 'Issues Resolved', color: 'violet' },
                            { icon: Users, val: leaderboard.reduce((s, n) => s + n.activeUsers, 0).toString(), desc: 'Active Citizens', color: 'amber' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative overflow-hidden rounded-3xl p-6 border border-${stat.color}-500/20 bg-${stat.color}-500/[0.02] group`}
                            >
                                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full bg-${stat.color}-500/10 blur-3xl group-hover:bg-${stat.color}-500/20 transition-all duration-500`} />
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-${stat.color}-400/10 to-${stat.color}-600/10 border border-${stat.color}-400/20 shadow-[0_0_20px_rgba(var(--${stat.color}-500-rgb),0.1)] group-hover:scale-110 transition-transform duration-500`}>
                                        <stat.icon className={`w-7 h-7 text-${stat.color}-400 drop-shadow-[0_0_8px_currentColor]`} />
                                    </div>
                                    <div>
                                        <p className={`text-4xl font-black text-${stat.color}-400 tracking-tight`}>{stat.val}</p>
                                        <p className="text-[11px] uppercase tracking-widest text-white/40 mt-1 font-semibold">{stat.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Conservation Race</h2>      
                    </div>

                    <div className="relative bg-[#0a0a0a] border border-white/[0.08] rounded-[2rem] p-8 mb-12 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,white/[0.02]_1px,transparent_1px),linear-gradient(to_bottom,white/[0.02]_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />

                        <div className="relative flex items-end gap-2 md:gap-4 h-72 justify-center z-10">       
                            {leaderboard.slice(0, 8).map((hood, i) => {
                                const heightPct = Math.max((hood.litersSaved / maxLiters) * 100, 10);
                                const hue = 180 - i * 15;
                                const isTop3 = i < 3;

                                return (
                                    <motion.div
                                        key={hood.name}
                                        className="flex flex-col items-center flex-1 max-w-[90px] group"        
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1, type: 'spring' }}
                                    >
                                        <motion.div
                                            className="text-[11px] text-cyan-300 font-bold mb-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                            initial={{ y: 5 }}
                                            whileHover={{ y: 0 }}
                                        >
                                            {formatLiters(hood.litersSaved)}L
                                        </motion.div>

                                        <div className="relative w-full h-56 bg-white/[0.01] border-[1.5px] border-white/[0.1] rounded-2xl overflow-hidden backdrop-blur-md shadow-inner">
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent w-1/3 z-20 pointer-events-none" />

                                            <motion.div
                                                className="absolute bottom-0 left-0 right-0 rounded-b-xl"       
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPct}%` }}
                                                transition={{ duration: 1.5, delay: i * 0.1, type: 'spring', damping: 20 }}
                                                style={{
                                                    background: `linear-gradient(180deg, hsla(${hue}, 80%, 60%, 0.9), hsla(${hue}, 100%, 40%, 1))`,
                                                    boxShadow: `0 -10px 20px hsla(${hue}, 80%, 50%, 0.4)`       
                                                }}
                                            >
                                                <motion.div
                                                    className="absolute top-0 left-0 right-0 h-4 opacity-70"    
                                                    style={{
                                                        background: `linear-gradient(to bottom, hsla(${hue}, 100%, 75%, 1) 0%, transparent 100%)`,
                                                        borderRadius: '50%',
                                                        transform: 'translateY(-50%)',
                                                    }}
                                                    animate={{ rotate: [-2, 2, -2] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                                />
                                            </motion.div>

                                            {isTop3 && (
                                                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 drop-shadow-md">
                                                    {i === 0 ? <Crown className="w-5 h-5 text-amber-400" /> : <Medal className={`w-5 h-5 ${i === 1 ? 'text-slate-300' : 'text-orange-400'}`} />}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[10px] text-white/50 mt-4 text-center truncate w-full font-bold tracking-wider uppercase group-hover:text-white transition-colors">
                                            {hood.name}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <List className="w-4 h-4 text-violet-400" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight text-white">Full Rankings</h2>  
                            </div>

                            {leaderboard.map((hood, i) => {
                                const isTop3 = i < 3;
                                const style = isTop3 ? RANK_COLORS[i] : null;

                                return (
                                    <motion.div
                                        key={hood.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.01, x: 4 }}
                                        className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-default group ${
                                            style ? `${style.bg} ${style.border} ${style.glow}` : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            style ? `bg-black/20 backdrop-blur-md ${style.text}` : 'bg-white/[0.04] text-white/40'
                                        }`}>
                                            {isTop3 ? (
                                                i === 0 ? <Crown className="w-6 h-6" /> : <Medal className="w-6 h-6" />
                                            ) : (
                                                <span className="text-lg font-black">#{hood.rank}</span>        
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className={`font-bold text-base truncate ${style ? style.text : 'text-white/90 group-hover:text-white'}`}>
                                                    {hood.name}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[9px] text-white/40 uppercase tracking-widest font-semibold border border-white/[0.05]">
                                                    {hood.city}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5 opacity-60">
                                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                                                    <Users size={12} className="text-white/40" />
                                                    {hood.activeUsers} Active
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                                                    <Target size={12} className="text-white/40" />
                                                    {hood.resolvedCount}/{hood.reportsCount} Fixed
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hidden sm:flex gap-1.5 px-4 border-l border-white/[0.06]">
                                            {hood.badges.slice(0, 3).map(badgeId => {
                                                const badge = badges.find(b => b.id === badgeId);
                                                return badge ? (
                                                    <div
                                                        key={badgeId}
                                                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.1] flex items-center justify-center text-lg shadow-inner"       
                                                        title={badge.name}
                                                    >
                                                        {badge.emoji}
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>

                                        <div className="flex items-center gap-6 flex-shrink-0 pl-4 border-l border-white/[0.06]">
                                            <div className="flex flex-col items-end w-16">
                                                <div className="flex items-center gap-1">
                                                    {hood.weeklyChange > 0 ? (
                                                        <TrendingUp size={14} className="text-emerald-400" />   
                                                    ) : hood.weeklyChange < 0 ? (
                                                        <TrendingDown size={14} className="text-rose-400" />    
                                                    ) : (
                                                        <Minus size={14} className="text-white/20" />
                                                    )}
                                                    <span className={`text-sm font-bold ${hood.weeklyChange > 0 ? 'text-emerald-400' : hood.weeklyChange < 0 ? 'text-rose-400' : 'text-white/20'}`}>
                                                        {Math.abs(hood.weeklyChange) || '-'}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider mt-0.5">7D Trend</span>
                                            </div>

                                            <div className="text-right w-20">
                                                <p className="text-lg font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                                                    {formatLiters(hood.litersSaved)}
                                                </p>
                                                <p className="text-[9px] font-bold text-cyan-400/50 uppercase tracking-widest mt-0.5">L Saved</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="space-y-6 sticky top-28 h-fit">
                            <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-amber-500/10 to-transparent p-4 rounded-2xl border border-amber-500/10">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                </div>
                                <h2 className="text-sm font-bold tracking-widest uppercase text-amber-400">Collectibles</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {badges.map((badge, i) => (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -5, scale: 1.05 }}
                                        className="relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] rounded-2xl p-4 text-center group cursor-pointer overflow-hidden shadow-lg"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <span className="text-4xl block mb-3 filter drop-shadow-md group-hover:scale-110 transition-transform">{badge.emoji}</span>
                                            <p className="text-xs font-bold text-white/80 mb-1 group-hover:text-white transition-colors">{badge.name}</p>
                                            <p className="text-[10px] text-white/40 font-semibold">{badge.minReports}+ Reports</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PageTransition>
    );
}

function List(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    )
}
