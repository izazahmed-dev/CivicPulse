'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, CheckCircle, AlertTriangle, Truck, Wrench, Shield,
    MapPin, Clock, Users, Share2, ExternalLink, Copy, Check, Sparkles, Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PageTransition from '@/components/PageTransition';

interface StatusEntry {
    status: string;
    timestamp: number;
    note: string;
}

interface ComplaintDetail {
    id: string;
    area: string;
    areaPath: string;
    lat: number;
    lng: number;
    issueType: string;
    description: string;
    timestamp: number;
    status: string;
    verifications: number;
    statusHistory: StatusEntry[];
}

const STAGES = [
    { key: 'REPORTED', label: 'Reported', icon: AlertTriangle, color: 'text-cyan-400', bg: 'bg-cyan-500', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]', desc: 'Issue submitted by citizen' },
    { key: 'VERIFIED', label: 'Verified by Neighbors', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]', desc: 'Confirmed by nearby residents' },
    { key: 'DISPATCHED', label: 'Crew Dispatched', icon: Truck, color: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]', desc: 'Municipal crew is on the way' },
    { key: 'IN_PROGRESS', label: 'Fix in Progress', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]', desc: 'On-site repair underway' },
    { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]', desc: 'Issue has been fixed' },
];

function getStageIndex(status: string): number {
    const idx = STAGES.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
}

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const ISSUE_LABELS: Record<string, string> = {
    no_water: 'No Water Supply',
    low_pressure: 'Low Water Pressure',
    dirty_water: 'Contaminated Water',
    leakage: 'Pipe Leakage',
    pothole: 'Pothole',
    broken_road: 'Broken Road',
    flooding: 'Road Flooding',
    no_streetlight: 'No Streetlight',
    power_outage: 'Power Outage',
    voltage_fluctuation: 'Voltage Fluctuation',
    broken_pole: 'Broken Pole',
    wire_issue: 'Wire Issue',
    garbage_dump: 'Garbage Dump',
    blocked_drain: 'Blocked Drain',
    sewage_overflow: 'Sewage Overflow',
    open_manhole: 'Open Manhole',
};

export default function TrackPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { user } = useAuth();
    const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/complaints/${resolvedParams.id}`)
            .then(res => res.json())
            .then(data => {
                setComplaint(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [resolvedParams.id]);

    const handleVerify = async () => {
        if (!complaint || verified) return;
        setVerifying(true);
        try {
            await fetch(`/api/complaints/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', userName: user?.name }),
            });
            setComplaint(prev => prev ? {
                ...prev,
                verifications: (prev.verifications || 0) + 1,
                status: 'VERIFIED',
            } : null);
            setVerified(true);
        } catch (err) {
            console.error('Failed to verify:', err);
        }
        setVerifying(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentStage = complaint ? getStageIndex(complaint.status) : 0;
    const currentTheme = STAGES[currentStage];

    if (loading) {
        return (
            <PageTransition>
                <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">        
                    <div className="text-center">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-14 h-14 border-[3px] border-cyan-500/30 border-t-cyan-400 rounded-full mx-auto mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        />
                        <p className="text-white/40 text-[11px] font-bold tracking-widest uppercase">Locating Signal...</p>
                    </div>
                </main>
            </PageTransition>
        );
    }

    if (!complaint) {
        return (
            <PageTransition>
                <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">        
                    <div className="text-center max-w-sm px-6">
                        <AlertTriangle className="w-16 h-16 text-rose-500/50 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]" />
                        <h2 className="text-xl font-bold mb-2">Signal Lost</h2>
                        <p className="text-white/40 text-sm mb-8 leading-relaxed">The complaint ID you are tracking doesn&apos;t exist or has been archived.</p>
                        <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/80 hover:bg-white/[0.1] hover:text-white transition-all text-sm font-semibold tracking-wide">
                            Return to Dashboard
                        </Link>
                    </div>
                </main>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${currentTheme.bg}`} />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#050505] pointer-events-none z-0" />

                <div className="max-w-2xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all">
                            <ArrowLeft size={18} />
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${copied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/[0.03] text-white/50 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                                }`}
                        >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <LinkIcon size={14} />}
                            {copied ? 'Link Copied' : 'Share Tracker'}
                        </motion.button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-3xl border border-white/[0.08] overflow-hidden mb-8 backdrop-blur-xl shadow-2xl bg-white/[0.02]"
                    >
                        <div className={`absolute top-0 left-0 right-0 h-1 ${currentTheme.bg}`} />

                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-white/[0.05] text-white/60 border border-white/[0.1]">
                                        #{complaint.id.split('-')[0].substring(0, 8)}
                                    </span>
                                </div>
                                <span className="text-[11px] font-semibold text-white/40 tracking-wider uppercase flex items-center gap-1.5">
                                    <Clock size={12} className="text-white/30" />
                                    {timeAgo(complaint.timestamp)}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight drop-shadow-sm">
                                {ISSUE_LABELS[complaint.issueType] || complaint.issueType}
                            </h1>

                            {complaint.description && (
                                <p className="text-sm text-white/50 mb-6 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04]">
                                    &quot;{complaint.description}&quot;
                                </p>
                            )}

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-white/60 font-medium">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                                    <MapPin size={14} className="text-white/40" />
                                    {complaint.area || complaint.areaPath}
                                </div>
                                {complaint.verifications > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                                        <Users size={14} className="text-violet-400" />
                                        Verified by {complaint.verifications}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative px-6 py-4 md:px-8 bg-white/[0.02] border-t border-white/[0.05] overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentTheme.bg}`} />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="relative">
                                    <div className={`w-3 h-3 rounded-full ${currentTheme.bg}`} />
                                    <motion.div
                                        className={`absolute inset-0 rounded-full ${currentTheme.bg}`}
                                        animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Live Status</p>
                                    <span className={`text-base font-black tracking-tight ${currentTheme.color}`}>
                                        {currentTheme.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-white/[0.08] p-6 md:p-8 mb-8 backdrop-blur-xl relative overflow-hidden shadow-2xl bg-white/[0.01]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} className="text-cyan-400" /> Resolution Tracker
                            </h2>
                        </div>

                        <div className="relative pl-2">
                            {STAGES.map((stage, i) => {
                                const Icon = stage.icon;
                                const isComplete = i <= currentStage;
                                const isCurrent = i === currentStage;
                                const isPending = i > currentStage;

                                return (
                                    <motion.div
                                        key={stage.key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.15 + 0.3 }}
                                        className="flex gap-5 md:gap-6 relative group"
                                    >
                                        {i < STAGES.length - 1 && (
                                            <div className="absolute left-[23px] top-[48px] w-0.5 h-[calc(100%-8px)] rounded-full overflow-hidden bg-white/[0.05]">
                                                {isComplete && !isCurrent && (
                                                    <div className={`w-full h-full ${stage.bg}`} />
                                                )}
                                                {isCurrent && (
                                                    <motion.div
                                                        className={`w-full ${stage.bg}`}
                                                        initial={{ height: '0%' }}
                                                        animate={{ height: ['0%', '100%'] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}        
                                                    />
                                                )}
                                            </div>
                                        )}

                                        <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isCurrent ? `${stage.bg}/20 border-2 border-current scale-110`
                                                : isComplete ? `${stage.bg}/10 border border-white/10`
                                                    : 'bg-white/[0.02] border border-white/[0.05]'
                                            }`}>
                                            {isCurrent && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-2xl border-2 border-current opacity-50"
                                                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            )}
                                            <Icon size={isCurrent ? 24 : 20} className={`transition-colors duration-500 ${isComplete ? stage.color : 'text-white/20'}`} />

                                            {isComplete && !isCurrent && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#050505] flex items-center justify-center">
                                                    <CheckCircle size={12} className={stage.color} />
                                                </div>
                                            )}
                                        </div>

                                        <div className={`pb-10 flex-1 ${isPending ? 'opacity-40' : 'opacity-100'} transition-opacity duration-500`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1.5 mt-0.5">
                                                <span className={`text-base font-bold ${isCurrent ? stage.color : isComplete ? 'text-white/90' : 'text-white/50'}`}>
                                                    {stage.label}
                                                </span>
                                                {isCurrent && (
                                                    <span className="w-fit px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-white/[0.1] text-white capitalize border border-white/[0.1]">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-white/40 leading-relaxed max-w-sm">{stage.desc}</p>

                                            <AnimatePresence>
                                                {isCurrent && (stage.key === 'REPORTED' || stage.key === 'VERIFIED') && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}       
                                                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
                                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative group">
                                                            <p className="text-xs text-white/60 mb-4 font-medium relative z-10">
                                                                Confirming validity accelerates municipal dispatch.
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-4 relative z-10">
                                                                <button
                                                                    onClick={handleVerify}
                                                                    disabled={verifying || verified}
                                                                    className={`relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${verified
                                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                            : 'bg-white text-black'
                                                                        }`}
                                                                >
                                                                    <div className="relative z-10 flex items-center gap-2">
                                                                        {verified ? (
                                                                            <><CheckCircle size={16} /> Verified</>
                                                                        ) : verifying ? (
                                                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                                        ) : (
                                                                            <><Shield size={16} /> Verify Now</>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {isCurrent && stage.key === 'DISPATCHED' && (
                                                <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                                    <div className="flex items-center gap-4 relative z-10">     
                                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                                            <Truck size={20} className="text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-bold text-amber-400 block mb-0.5">Municipal Crew En Route</span>
                                                            <span className="text-[10px] text-amber-400/60 uppercase tracking-widest font-semibold">ETA: ~45 mins</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {complaint.statusHistory && isComplete && (
                                                <div className="mt-2 space-y-1">
                                                    {complaint.statusHistory
                                                        .filter(h => h.status === stage.key)
                                                        .map((h, j) => (
                                                            <p key={j} className="text-[10px] text-white/20 font-medium">
                                                                <span className="text-white/30 mr-2">{new Date(h.timestamp).toLocaleTimeString()}</span>
                                                                {h.note}
                                                            </p>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/dashboard"
                            className="flex-1 text-center py-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all hover:border-white/[0.15] text-xs font-bold tracking-widest text-white/60 hover:text-white uppercase"
                        >
                            Return to Dashboard
                        </Link>
                        <Link
                            href="/report"
                            className="flex-1 text-center py-4 rounded-2xl bg-white text-black transition-all hover:bg-emerald-400 text-xs font-bold uppercase tracking-widest"
                        >
                            Log Another Issue
                        </Link>
                    </div>
                </div>
            </main>
        </PageTransition>
    );
}

function LinkIcon({ size = 14, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) {
    return (
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    )
}
