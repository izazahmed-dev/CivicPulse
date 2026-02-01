'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle, Activity, Filter } from 'lucide-react';

// Dynamic import for Leaflet map to avoid window is not defined
const MapComponent = dynamic(() => import('@/components/DashboardMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#0a192f] text-slate-500 animate-pulse">Initializing Geospatial Engine...</div>
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

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, critical: 0, resolved: 0 });

  useEffect(() => {
    // Load from LocalStorage
    const stored = JSON.parse(localStorage.getItem('water_complaints') || '[]');
    setComplaints(stored);

    // Calculate Stats
    const total = stored.length;
    const critical = stored.filter((c: Complaint) => c.issueType === 'no_water' || c.issueType === 'dirty_water').length;
    const resolved = stored.filter((c: Complaint) => c.status === 'RESOLVED').length;
    setStats({ total, critical, resolved });
  }, []);

  const filteredComplaints = selectedArea 
    ? complaints.filter(c => c.area === selectedArea)
    : complaints;

  return (
    <main className="flex h-screen bg-[#0a192f] overflow-hidden">
        {/* Sidebar (Desktop) / Bottom Sheet (Mobile) logic needed, for now Sidebar */}
        <aside className="w-full md:w-[400px] h-full flex flex-col border-r border-slate-700 bg-[#0f172a] shadow-xl z-10 relative">
            <div className="p-6 border-b border-slate-700">
                <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 text-sm">
                    <ArrowLeft size={16} /> Home
                </Link>
                <div className="flex items-center justify-between">
                     <h1 className="text-2xl font-bold text-white tracking-tight">Water Grid <span className="text-resolution">Live</span></h1>
                     <div className="w-3 h-3 bg-resolution rounded-full animate-pulse shadow-[0_0_10px_#06d6a0]"></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-mono">CITY-WIDE HYDRAULIC STATUS MONITOR</p>
            </div>

            {/* Stats Overview */}
            {!selectedArea && (
                <div className="grid grid-cols-3 gap-2 p-4 border-b border-slate-800">
                    <div className="bg-[#1e293b] p-3 rounded-lg text-center">
                        <p className="text-xs text-slate-400 mb-1">TOTAL</p>
                        <p className="text-xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="bg-[#1e293b] p-3 rounded-lg text-center border border-crisis/30">
                        <p className="text-xs text-crisis mb-1">CRITICAL</p>
                        <p className="text-xl font-bold text-crisis">{stats.critical}</p>
                    </div>
                    <div className="bg-[#1e293b] p-3 rounded-lg text-center border border-resolution/30">
                        <p className="text-xs text-resolution mb-1">RESOLVED</p>
                        <p className="text-xl font-bold text-resolution">{stats.resolved}</p>
                    </div>
                </div>
            )}

            {/* List / Details */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {selectedArea ? (
                    <div>
                         <button 
                            onClick={() => setSelectedArea(null)}
                            className="text-sm text-resolution hover:underline mb-4 flex items-center gap-1"
                         >
                            ← Back to City View
                         </button>
                         <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-warning pl-3">{selectedArea}</h2>
                         <div className="space-y-3">
                            {filteredComplaints.length === 0 && <p className="text-slate-500 italic">No active reports.</p>}
                            {filteredComplaints.map(c => (
                                <div key={c.id} className="bg-[#1e293b] p-3 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                            c.issueType === 'no_water' ? 'bg-crisis/20 text-crisis' : 'bg-warning/20 text-warning'
                                        }`}>
                                            {c.issueType.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 line-clamp-2">{c.description || 'No additional details provided.'}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                         <span className="text-xs font-mono text-slate-500">{c.id}</span>
                                         {c.status === 'OPEN' && <span className="w-2 h-2 rounded-full bg-crisis"></span>}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-sm font-semibold text-slate-400">RECENT ALERTS</h3>
                             <Filter size={14} className="text-slate-600" />
                        </div>
                        {complaints.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Activity size={40} className="mx-auto mb-3" />
                                <p>System Nominal. No reports.</p>
                            </div>
                        ) : (
                            complaints.slice(0, 10).map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => setSelectedArea(c.area)}
                                    className="w-full text-left bg-[#1e293b]/50 p-3 rounded-lg border-l-2 border-transparent hover:border-resolution hover:bg-[#1e293b] transition-all group"
                                >
                                     <div className="flex justify-between">
                                        <span className="font-medium text-white group-hover:text-resolution transition-colors">{c.area}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleDateString()}</span>
                                     </div>
                                     <div className="flex items-center gap-2 mt-1">
                                        {c.issueType === 'no_water' ? <AlertCircle size={12} className="text-crisis"/> : <Activity size={12} className="text-warning"/>}
                                        <span className="text-xs text-slate-400 capitalize">{c.issueType.replace('_', ' ')}</span>
                                     </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
            
            <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center font-mono uppercase">
                Restricted Access • Municipal Use Only
            </div>
        </aside>

        {/* Map Area */}
        <div className="flex-1 relative">
            <MapComponent 
                complaints={complaints} 
                selectedArea={selectedArea}
                onSelectArea={setSelectedArea}
            />
            
            {/* Map Legend Overlay */}
            <div className="absolute bottom-6 right-6 bg-[#0f172a]/90 backdrop-blur border border-slate-700 p-3 rounded-lg z-[400] text-xs">
                <h4 className="font-bold text-white mb-2">SEVERITY INDEX</h4>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-crisis/80"></span>
                    <span className="text-slate-300">Critical (No Supply)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-warning/80"></span>
                    <span className="text-slate-300">Warning (Pressure)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-resolution/80"></span>
                    <span className="text-slate-300">Nominal / Resolved</span>
                </div>
            </div>
        </div>
    </main>
  );
}
