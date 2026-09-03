'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, AlertCircle, CheckCircle2, Activity, Filter, Lock,
    Droplets, TrendingUp, Shield, ChevronRight, MapPin, Clock, Server
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/DashboardMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#060a12] gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0,transparent_50%)]" />
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-[spin_1.5s_linear_infinite] shadow-[0_0_30px_rgba(6,182,212,0.3)]" />
            <span className="text-cyan-400/80 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Initializing Geospatial Engine</span>
        </div>
    ),
});

interface Complaint {
    id: string;
    area: string;
    lat: number;
    lng: number;
    issueType: string;
    description: string;
    timestamp: number;
    status: string;
}

const SPARKLINE_COLORS: Record<string, { stroke: string; fill: string }> = {
    cyan: { stroke: '#22d3ee', fill: '#06b6d4' },
    rose: { stroke: '#fb7185', fill: '#f43f5e' },
    emerald: { stroke: '#34d399', fill: '#10b981' },
};

function generateSparkline(color: string, points: number[]) {
    const colors = SPARKLINE_COLORS[color] || SPARKLINE_COLORS.cyan;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const stepX = 100 / (points.length - 1);

    const d = points.reduce((acc, val, i) => {
        const x = i * stepX;
        const y = 30 - ((val - min) / range) * 30;
        return `${acc} ${i === 0 ? 'M' : 'L'} ${x},${y}`;
    }, '');

    return (
        <svg className="w-full h-8 overflow-visible mt-2 opacity-50" viewBox="0 0 100 30" preserveAspectRatio="none">
            <motion.path
                d={d}
                fill="none"
                stroke={colors.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
                d={`${d} L 100,30 L 0,30 Z`}
                fill={`url(#gradient-${color})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            />
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={colors.fill} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

function getIssueColor(issueType: string, status: string) {
    if (status === 'RESOLVED') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', isCritical: false };
    if (issueType === 'no_water' || issueType === 'dirty_water' || issueType === 'power_outage')
        return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400', isCritical: true };
    if (issueType === 'low_pressure' || issueType === 'leakage' || issueType === 'broken_road')
        return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400', isCritical: false };
    return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400', isCritical: false };
}

export default function DashboardPage() {
    const { t } = useLanguage();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, critical: 0, resolved: 0 });

    useEffect(() => {
        fetch('/api/complaints')
            .then(res => res.json())
            .then((stored: Complaint[]) => {
                if (Array.isArray(stored)) {
                    setComplaints(stored);
                    const total = stored.length;
                    const critical = stored.filter((c) => c.issueType === 'no_water' || c.issueType === 'dirty_water' || c.issueType === 'power_outage').length;
                    const resolved = stored.filter((c) => c.status === 'RESOLVED').length;
                    setStats({ total, critical, resolved });
                }
            })
            .catch(err => console.error('Failed to load complaints:', err));
    }, []);

    const filteredComplaints = selectedArea
        ? complaints.filter(c => c.area === selectedArea)
        : complaints;

    // Compute sparkline data from real complaint history
    const computeTrend = (items: Complaint[]) => {
        const now = Date.now();
        const buckets = [0, 0, 0, 0, 0, 0, 0];
        items.forEach(c => {
            const daysAgo = Math.floor((now - c.timestamp) / 86400000);
            if (daysAgo >= 0 && daysAgo < 7) buckets[6 - daysAgo]++;
        });
        return buckets;
    };
    const totalTrend = computeTrend(complaints);
    const criticalTrend = computeTrend(complaints.filter(c => c.issueType === 'no_water' || c.issueType === 'dirty_water' || c.issueType === 'power_outage'));
    const resolvedTrend = computeTrend(complaints.filter(c => c.status === 'RESOLVED'));

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <PageTransition>
            <main className="flex h-screen pt-[60px] bg-[#050505] overflow-hidden">
                {/* ─── Sidebar ─── */}
                <aside className="w-full md:w-[420px] h-full flex flex-col border-r border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-3xl shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)] z-10 relative">
                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-white/[0.04]">
                        <div className="flex items-center justify-between mb-1">
                            <div>
                                <div className="flex items-center gap-3">
                                    <Server className="text-cyan-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                    <h1 className="text-xl font-bold text-white tracking-tight">
                                        {t('dash.title')}
                                    </h1>
                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_currentColor]" />
                                        <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest leading-none">
                                            {t('dash.live')}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-white/30 text-[10px] tracking-[0.2em] font-semibold mt-2 uppercase flex items-center gap-2">
                                    <Activity size={10} />
                                    {t('dash.subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {!selectedArea && (
                        <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/[0.04] bg-white/[0.01]">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-cyan-500/[0.08] to-transparent p-3.5 rounded-2xl border border-cyan-500/10 relative overflow-hidden group">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Activity size={12} className="text-cyan-400" />
                                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">Total</p>
                                </div>
                                <p className="text-3xl font-black text-white tabular-nums tracking-tight">{stats.total}</p>
                                <div className="absolute inset-x-0 bottom-0 opacity-40 group-hover:opacity-100 transition-opacity">
                                    {generateSparkline('cyan', totalTrend)}
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-rose-500/[0.08] to-transparent p-3.5 rounded-2xl border border-rose-500/20 relative overflow-hidden group shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <AlertCircle size={12} className="text-rose-500 animate-pulse" />
                                    <p className="text-[9px] text-rose-400/80 font-bold uppercase tracking-widest">Critical</p>
                                </div>
                                <p className="text-3xl font-black text-rose-400 tabular-nums tracking-tight">{stats.critical}</p>
                                <div className="absolute inset-x-0 bottom-0 opacity-40 group-hover:opacity-100 transition-opacity">
                                    {generateSparkline('rose', criticalTrend)}
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-3.5 rounded-2xl border border-emerald-500/10 relative overflow-hidden group">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                    <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest">Resolved</p>
                                </div>
                                <p className="text-3xl font-black text-emerald-400 tabular-nums tracking-tight">{stats.resolved}</p>
                                <div className="absolute inset-x-0 bottom-0 opacity-40 group-hover:opacity-100 transition-opacity">
                                    {generateSparkline('emerald', resolvedTrend)}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Alert List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {selectedArea ? (
                            <div className="p-4">
                                <button
                                    onClick={() => setSelectedArea(null)}
                                    className="text-xs font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 mb-6 flex items-center gap-2 group transition-colors bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20"
                                >
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                    Back to City View
                                </button>

                                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-inner">
                                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                                        <MapPin size={18} className="text-white/60" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white tracking-tight">{selectedArea}</h2>
                                        <p className="text-xs text-white/40 uppercase tracking-widest">{filteredComplaints.length} Active Records</p>
                                    </div>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    <motion.div variants={containerVariants as any} initial="hidden" animate="show" className="space-y-3">
                                        {filteredComplaints.length === 0 && (
                                            <p className="text-white/20 italic text-sm text-center py-10 border border-dashed border-white/10 rounded-xl">No active reports in this area.</p>
                                        )}
                                        {filteredComplaints.map((c) => {
                                            const color = getIssueColor(c.issueType, c.status);
                                            return (
                                                <motion.div key={c.id} variants={itemVariants as any} className={`relative bg-gradient-to-br from-white/[0.03] to-transparent p-4 rounded-2xl border transition-all ${color.border} shadow-lg hover:bg-white/[0.04] group`}>
                                                    {color.isCritical && (
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                    )}

                                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${color.bg} ${color.text} uppercase tracking-widest flex items-center gap-1.5`}>
                                                            {color.isCritical && <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />}
                                                            {c.issueType.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-[10px] text-white/30 font-medium flex items-center gap-1 bg-white/[0.05] px-2 py-1 rounded-md">
                                                            <Clock size={10} />
                                                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-white/70 line-clamp-2 leading-relaxed font-medium relative z-10">
                                                        "{c.description || 'No additional details provided by the reporter.'}"
                                                    </p>

                                                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                                                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{c.id.split('-')[0]}-{c.id.split('-')[1] || c.id}</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${c.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/[0.05] text-white/40'
                                                            }`}>
                                                            {c.status}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Activity size={12} className="text-cyan-500/50" />
                                        {t('dash.recent')}
                                    </h3>
                                    <Filter size={14} className="text-white/20 cursor-pointer hover:text-white transition-colors" />
                                </div>

                                {complaints.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-white/20 border border-dashed border-white/10 rounded-2xl mx-1 bg-white/[0.01]">
                                        <CheckCircle2 size={32} className="mb-3 opacity-30" />
                                        <span className="text-xs font-semibold uppercase tracking-widest">{t('dash.empty')}</span>
                                    </div>
                                ) : (
                                    <motion.div variants={containerVariants as any} initial="hidden" animate="show" className="space-y-2">
                                        {complaints.slice(0, 15).map((c) => {
                                            const color = getIssueColor(c.issueType, c.status);
                                            return (
                                                <motion.button
                                                    key={c.id}
                                                    variants={itemVariants as any}
                                                    onClick={() => setSelectedArea(c.area)}
                                                    className={`w-full text-left bg-gradient-to-r from-white/[0.01] to-transparent p-3.5 rounded-xl border transition-all duration-300 group flex items-start gap-3 ${color.isCritical ? 'border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5' : 'border-white/[0.04] hover:border-cyan-500/30 hover:bg-cyan-500/5'
                                                        }`}
                                                >
                                                    {/* Indicator Dot/Pulse */}
                                                    <div className="mt-1 flex-shrink-0 relative">
                                                        {color.isCritical && (
                                                            <div className={`absolute inset-0 ${color.dot} opacity-40 blur-[4px] animate-pulse`} />
                                                        )}
                                                        <div className={`w-2.5 h-2.5 rounded-full ${color.dot} relative z-10 ring-2 ring-[#0a0f1a] shadow-sm`} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className="font-bold text-white/80 group-hover:text-white transition-colors text-sm truncate">
                                                                {c.area || 'Unknown Area'}
                                                            </span>
                                                            <span className="text-[9px] text-white/20 font-medium whitespace-nowrap ml-2">
                                                                {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${color.text} opacity-80`}>
                                                                {c.issueType.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between bg-black/20 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-white/20" />
                            <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">{t('dash.restricted')}</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    </div>
                </aside>

                {/* ─── Map Area ─── */}
                <div className="flex-1 relative bg-[#020617]">
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0,transparent_100%)]" />

                    <MapComponent
                        complaints={complaints}
                        selectedArea={selectedArea}
                        onSelectArea={setSelectedArea}
                    />

                    {/* Legend overlay */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-8 left-8 bg-[#0a0f1a]/90 backdrop-blur-2xl border border-white/[0.08] p-5 rounded-2xl z-[400] shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                    >
                        <h4 className="font-black text-white/80 mb-4 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin size={12} className="text-cyan-400" />
                            {t('dash.legend_title')}
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 absolute blur-[3px] opacity-60 animate-pulse" />
                                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 relative ring-2 ring-[#0a0f1a]" />
                                </div>
                                <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase">{t('dash.legend_crit')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] ring-2 ring-[#0a0f1a]" />
                                <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase">{t('dash.legend_warn')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] ring-2 ring-[#0a0f1a]" />
                                <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase">{t('dash.legend_nom')}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </PageTransition>
    );
}
