'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import {
    ShieldAlert, Activity, CheckCircle2, AlertTriangle,
    Map as MapIcon, Users, BarChart3, Clock,
    ArrowRight, Search, Settings, ArrowLeft,
    Filter, MoreVertical, Droplets, Zap, TrendingUp, Thermometer, Home
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/AuthorityMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            <span className="text-white/20 text-sm font-mono tracking-widest">INITIALIZING SATELLITE UPLINK...</span>
        </div>
    )
});

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';

interface Incident {
    id: string;
    title: string;
    category: string;
    area: string;
    priority: Priority;
    status: Status;
    aiConfidence: number;
    timeReported: string;
    aiDiagnosis: string;
}

// Dummy data highlighting Gemini's AI triage capabilities
const INITIAL_INCIDENTS: Incident[] = [
    {
        id: 'INC-8091',
        title: 'Severe Contamination (Black Water)',
        category: 'Water Quality',
        area: 'Adyar, Zone 13',
        priority: 'CRITICAL',
        status: 'NEW',
        aiConfidence: 98,
        timeReported: '10 mins ago',
        aiDiagnosis: 'Voice transcript and text extracted highly toxic keywords ("black", "smell", "sick"). Immediate pipeline shutdown recommended.'
    },
    {
        id: 'INC-8092',
        title: 'Main Pipe Burst causing Flooding',
        category: 'Infrastructure',
        area: 'T. Nagar, Zone 10',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        aiConfidence: 95,
        timeReported: '1 hour ago',
        aiDiagnosis: '14 clustered complaints in 200m radius within 30 mins indicates main line failure. Repair crew dispatched.'
    },
    {
        id: 'INC-8095',
        title: 'No Supply (Tanker Requested)',
        category: 'Supply',
        area: 'Velachery, Zone 13',
        priority: 'HIGH',
        status: 'NEW',
        aiConfidence: 88,
        timeReported: '45 mins ago',
        aiDiagnosis: 'Routine supply failure. Correlates with scheduled maintenance in Zone 13. Tanker dispatch suggested.'
    },
    {
        id: 'INC-8105',
        title: 'Low Pressure in Apartment',
        category: 'Water Pressure',
        area: 'Anna Nagar, Zone 8',
        priority: 'LOW',
        status: 'RESOLVED',
        aiConfidence: 90,
        timeReported: 'Yesterday',
        aiDiagnosis: 'Isolated issue. Likely building-level pump failure.'
    },
    {
        id: 'INC-8107',
        title: 'Open Manhole (Dangerous)',
        category: 'Infrastructure',
        area: 'Besant Nagar, Zone 13',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        aiConfidence: 92,
        timeReported: '2 hours ago',
        aiDiagnosis: 'Image analysis confirms open manhole on active pedestrian path. Hazard barriers deployed.'
    },
];

const PRIORITY_STYLES = {
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'Water Quality': <Thermometer size={14} />,
    'Infrastructure': <AlertTriangle size={14} />,
    'Supply': <Droplets size={14} />,
    'Water Pressure': <Activity size={14} />
};

export default function AuthorityDashboard() {
    const { t } = useLanguage();
    const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
    const [activeTab, setActiveTab] = useState<'triage' | 'map' | 'analytics'>('triage');
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    // --- Kanban Logic ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItem(id);
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: Status) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id) {
            setIncidents(prev => prev.map(inc =>
                inc.id === id ? { ...inc, status } : inc
            ));
        }
        setDraggedItem(null);
    };

    const moveStatus = (id: string, newStatus: Status) => {
        setIncidents(prev => prev.map(inc =>
            inc.id === id ? { ...inc, status: newStatus } : inc
        ));
    };

    const renderKanbanColumn = (title: string, status: Status, icon: React.ReactNode, colorClass: string) => {
        const columnIncidents = incidents.filter(i => i.status === status)
            .sort((a, b) => a.priority === 'CRITICAL' ? -1 : 1); // Basic sort to keep critical on top

        return (
            <div
                className="flex-1 min-w-[320px] bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col h-[calc(100vh-280px)] backdrop-blur-md"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
            >
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${colorClass}`}>{icon}</div>
                        <h3 className="font-bold text-white tracking-wide">{title}</h3>
                    </div>
                    <span className="bg-white/[0.05] px-2.5 py-1 rounded-full text-xs font-bold text-white/50">
                        {columnIncidents.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-20">
                    <AnimatePresence>
                        {columnIncidents.map(inc => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={inc.id}
                                draggable
                                onDragStart={(e: any) => handleDragStart(e, inc.id)}
                                className={`bg-[#0a0a0a] border border-white/[0.08] p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-white/20 transition-all shadow-lg relative group ${inc.priority === 'CRITICAL' ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_STYLES[inc.priority]}`}>
                                        {inc.priority}
                                    </span>
                                    <span className="text-[10px] font-medium text-white/30">{inc.timeReported}</span>
                                </div>

                                {/* Title */}
                                <h4 className="font-bold text-[15px] text-white/90 mb-1 leading-snug">{inc.title}</h4>

                                {/* Meta details */}
                                <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                                    <div className="flex items-center gap-1">
                                        {CATEGORY_ICONS[inc.category] || <AlertTriangle size={12} />}
                                        {inc.category}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapIcon size={12} />
                                        {inc.area}
                                    </div>
                                </div>

                                {/* Gemini AI Diagnosis Box */}
                                <div className="bg-emerald-500/[0.05] border border-emerald-500/10 rounded-lg p-2.5 mb-3">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <Zap size={12} className="text-emerald-400" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Gemini Triage ({inc.aiConfidence}% Conf)</span>
                                    </div>
                                    <p className="text-[11px] text-white/60 leading-relaxed italic border-l-2 border-emerald-500/30 pl-2">
                                        &quot;{inc.aiDiagnosis}&quot;
                                    </p>
                                </div>

                                {/* Action Footer (Mobile/Click fallback for drag and drop) */}
                                <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/[0.05]">
                                    <span className="text-xs font-mono text-white/20">{inc.id}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {status === 'NEW' && (
                                            <button onClick={() => moveStatus(inc.id, 'IN_PROGRESS')} className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                        {status === 'IN_PROGRESS' && (
                                            <>
                                                <button onClick={() => moveStatus(inc.id, 'NEW')} className="p-1.5 text-white/40 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors">
                                                    <ArrowLeft size={14} />
                                                </button>
                                                <button onClick={() => moveStatus(inc.id, 'RESOLVED')} className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                                                    <CheckCircle2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {columnIncidents.length === 0 && (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/[0.05] rounded-xl">
                            <span className="text-white/20 text-sm font-medium">Drop items here</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <PageTransition>
            <main className="min-h-screen bg-[#050505] overflow-hidden flex flex-col font-sans">

                {/* === HEADER === */}
                <header className="h-[70px] border-b border-white/[0.08] bg-black/40 backdrop-blur-2xl px-6 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                            <Home size={20} />
                        </Link>
                        <div className="w-[1px] h-6 bg-white/[0.1] mx-2" />
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="text-emerald-400 w-6 h-6" />
                            <div>
                                <h1 className="text-white font-bold tracking-wide leading-none">Authority Command</h1>
                                <p className="text-[10px] text-emerald-400/70 font-mono mt-1">SECURE TERMINAL // ZONE 13</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-white/[0.02] border border-white/[0.08] px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-bold text-white/50 tracking-wider">SYSTEM ONLINE</span>
                        </div>
                        <div className="w-[1px] h-6 bg-white/[0.1] hidden md:block" />
                        <button className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 flex items-center justify-center shadow-lg text-sm font-black text-white">
                            DJB
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-6 flex flex-col max-w-[1600px] w-full mx-auto relative z-10">

                    {/* === TOP STATS ROW === */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-75" />
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-sm font-semibold text-white/50 tracking-wide">Active Critical</span>
                                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400"><ShieldAlert size={16} /></span>
                            </div>
                            <p className="text-4xl font-black text-white tracking-tighter relative z-10">2</p>
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-rose-400 font-medium relative z-10">
                                <TrendingUp size={12} /> +1 since last hour
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-75" />
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-sm font-semibold text-white/50 tracking-wide">AI Triage Accuracy</span>
                                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Zap size={16} /></span>
                            </div>
                            <p className="text-4xl font-black text-white tracking-tighter relative z-10">98<span className="text-xl text-white/50">.4%</span></p>
                            <div className="mt-2 text-[11px] text-emerald-400 font-medium relative z-10">
                                Processed 1,204 reports today
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-sm font-semibold text-white/50 tracking-wide">Avg Resolution</span>
                                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400"><Clock size={16} /></span>
                            </div>
                            <p className="text-4xl font-black text-white tracking-tighter relative z-10">4<span className="text-xl text-white/50">h</span> 12<span className="text-xl text-white/50">m</span></p>
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-medium relative z-10">
                                <TrendingUp size={12} className="rotate-180" /> -15m this week
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-sm font-semibold text-white/50 tracking-wide">Field Agents Online</span>
                                <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400"><Users size={16} /></span>
                            </div>
                            <p className="text-4xl font-black text-white tracking-tighter relative z-10">14<span className="text-xl text-white/50">/25</span></p>
                            <div className="mt-2 text-[11px] text-white/40 font-medium relative z-10">
                                3 currently in dispatch
                            </div>
                        </div>
                    </div>

                    {/* === TABS AND CONTROLS === */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl backdrop-blur-md">
                            <button
                                onClick={() => setActiveTab('triage')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'triage' ? 'bg-white/[0.1] text-white shadow-md' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'}`}
                            >
                                <Activity size={16} /> AI Triage Board
                            </button>
                            <button
                                onClick={() => setActiveTab('map')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'map' ? 'bg-white/[0.1] text-white shadow-md' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'}`}
                            >
                                <MapIcon size={16} /> Live Hazard Map
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="ID, location, or keyword..."
                                    className="bg-[#0a0a0a] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all w-[240px]"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-white/[0.1] rounded-xl text-sm font-bold text-white hover:bg-white/[0.05] transition-colors">
                                <Filter size={16} className="text-white/50" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* === MAIN CONTENT AREA === */}
                    {activeTab === 'triage' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-6 overflow-x-auto pb-6"
                        >
                            {renderKanbanColumn('New Alerts (AI Sorted)', 'NEW', <AlertTriangle className="text-rose-400" size={16} />, 'bg-rose-500/10')}
                            {renderKanbanColumn('In Progress (Dispatched)', 'IN_PROGRESS', <Clock className="text-amber-400" size={16} />, 'bg-amber-500/10')}
                            {renderKanbanColumn('Resolved (Awaiting Audit)', 'RESOLVED', <CheckCircle2 className="text-emerald-400" size={16} />, 'bg-emerald-500/10')}
                        </motion.div>
                    )}

                    {activeTab === 'map' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl relative overflow-hidden flex flex-col justify-center items-center backdrop-blur-xl"
                        >
                            <MapComponent incidents={incidents} />

                            {/* Holographic Overlay Effects */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none z-10" />
                            <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl pointer-events-none">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-white text-xs font-bold tracking-wider">LIVE SATELLITE FEED</span>
                                </div>
                                <p className="text-emerald-400/70 text-[10px] font-mono">ENCRYPTED CONNECTION</p>
                            </div>
                        </motion.div>
                    )}

                </div>
            </main>
        </PageTransition>
    );
}
