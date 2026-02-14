'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Droplets, AlertTriangle, CheckCircle, ArrowLeft, Crosshair, MapPin, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import CascadingLocationDropdown from '@/components/CascadingLocationDropdown';
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <div className="w-full h-[300px] rounded-xl bg-white/[0.03] flex items-center justify-center animate-pulse"><span className="text-white/20 text-sm">Loading Map...</span></div>
});
import { findNearestLocation, NearestLocationResult, haversineKm } from '@/data/indiaAreas';

const ISSUE_TYPES = [
    { id: 'no_water', label: 'No Water Supply', icon: Droplets, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    { id: 'low_pressure', label: 'Low Pressure', icon: ArrowLeft, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { id: 'dirty_water', label: 'Contaminated Water', icon: AlertTriangle, color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
    { id: 'leakage', label: 'Pipe Leakage', icon: Droplets, color: 'text-blue-400 border-blue-500/40 bg-blue-400/10' },
];

export default function ReportPage() {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [complaintId, setComplaintId] = useState('');

    const [formData, setFormData] = useState({
        state: '',
        district: '',
        area: '',
        subarea: '',
        areaPath: '',
        issueType: '',
        description: '',
        confirmPin: false,
    });

    const [location, setLocation] = useState({
        lat: 20.5937,
        lng: 78.9629,
        path: ''
    });

    const [nearestArea, setNearestArea] = useState<NearestLocationResult | null>(null);

    const handleSelectionChange = (selection: {
        state: string;
        district: string;
        area: string;
        subarea: string;
        lat: number;
        lng: number;
        fullPath: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            state: selection.state,
            district: selection.district,
            area: selection.area,
            subarea: selection.subarea,
            areaPath: selection.fullPath,
        }));
        setLocation({
            lat: selection.lat,
            lng: selection.lng,
            path: selection.fullPath,
        });
    };

    const handleMapChange = (lat: number, lng: number) => {
        setLocation(prev => ({ ...prev, lat, lng }));
    };

    useEffect(() => {
        const nearest = findNearestLocation(location.lat, location.lng);
        setNearestArea(nearest);
    }, [location.lat, location.lng]);

    const distanceFromSelectedArea = formData.area
        ? (() => {
            // Find the area coordinates from the hierarchy — use the last selected level
            const nearest = findNearestLocation(location.lat, location.lng);
            return nearest ? nearest.distanceKm : null;
        })()
        : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const complaintData = {
            ...formData,
            lat: location.lat,
            lng: location.lng,
            fullPath: formData.areaPath,
            selectedAreaPath: formData.areaPath,
            selectedAreaType: formData.subarea ? 'subarea' : formData.area ? 'area' : formData.district ? 'city' : 'state',
            selectedAreaName: formData.subarea || formData.area || formData.district || formData.state,
            distanceFromSelectedAreaKm: distanceFromSelectedArea,
        };

        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complaintData),
            });
            const data = await res.json();
            setComplaintId(data.complaint?.id || 'WC-0000');
        } catch (err) {
            console.error('Failed to submit complaint:', err);
            setComplaintId('WC-ERR');
        }

        setStep('success');
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#060e1a] text-white p-4 md:p-8 flex items-center justify-center">
            <Link href="/" className="absolute top-6 left-6 text-white/30 hover:text-white flex items-center gap-2 transition-colors z-10">
                <ArrowLeft size={20} /> Back to Home
            </Link>

            <div className="w-full max-w-lg mt-12 mb-12">
                {step === 'form' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/40 overflow-hidden"
                        style={{ background: 'linear-gradient(180deg, #0c1628 0%, #080f1c 100%)' }}
                    >
                        {/* Header */}
                        <div className="p-8 pb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Crosshair className="text-white" size={20} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Report Issue</h1>
                                    <p className="text-xs text-white/30">Drill down to your exact location for faster resolution</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* ── Step 1: Cascading Location Selection ── */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">1</div>
                                    <h2 className="text-sm font-semibold text-white/70">Select Your Location</h2>
                                </div>

                                <CascadingLocationDropdown
                                    onSelectionChange={handleSelectionChange}
                                />

                                {/* Hidden required input for form validation */}
                                <input
                                    type="hidden"
                                    value={formData.area}
                                    required
                                />
                            </div>

                            {/* ── Step 2: Pin Precise Location on Map ── */}
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">2</div>
                                    <h2 className="text-sm font-semibold text-white/70">Pin Precise Location</h2>
                                </div>

                                <div className="relative z-0">
                                    <LocationPicker
                                        lat={location.lat}
                                        lng={location.lng}
                                        onChange={handleMapChange}
                                    />
                                </div>

                                {nearestArea && (
                                    <div className="mt-3 rounded-xl p-3 text-xs border border-white/[0.06] bg-white/[0.02]">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-white/30">Closest match to pin:</span>
                                            <span className="text-[10px] uppercase tracking-wide text-white/15">{nearestArea.location.type}</span>
                                        </div>
                                        <div className="text-white/70 font-medium truncate mt-1">{nearestArea.location.path}</div>
                                        <div className="text-[10px] text-white/20 mt-0.5">
                                            {nearestArea.distanceKm.toFixed(2)} km from pin
                                        </div>
                                    </div>
                                )}

                                <label className="mt-3 flex items-center gap-2 text-xs text-white/30">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={formData.confirmPin}
                                        onChange={(e) => setFormData({ ...formData, confirmPin: e.target.checked })}
                                        className="accent-emerald-400 rounded"
                                    />
                                    I confirm the pin marks the exact location of the issue.
                                </label>
                            </div>

                            {/* ── Step 3: Issue Details ── */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">3</div>
                                    <h2 className="text-sm font-semibold text-white/70">Issue Details</h2>
                                </div>

                                {/* Issue Type */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {ISSUE_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = formData.issueType === type.id;
                                        return (
                                            <label
                                                key={type.id}
                                                className={`
                                                    cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center
                                                    ${isSelected
                                                        ? `${type.color} ring-1 ring-emerald-500/50 shadow-lg scale-[1.02]`
                                                        : 'border-white/[0.06] bg-white/[0.02] text-white/30 hover:border-white/[0.12] hover:bg-white/[0.04]'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    name="issue"
                                                    value={type.id}
                                                    required
                                                    className="hidden"
                                                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                                                />
                                                <Icon size={24} />
                                                <span className="text-xs font-semibold">{type.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* Description */}
                                <textarea
                                    className="w-full bg-white/[0.03] text-white p-4 rounded-xl border border-white/[0.06] focus:border-emerald-500/40 focus:shadow-[0_0_20px_rgba(16,185,129,0.05)] outline-none min-h-[80px] text-sm placeholder:text-white/15 transition-all"
                                    placeholder="Describe the issue in detail... (optional)"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.area || !formData.issueType || !formData.confirmPin}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Navigation size={18} />
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl border border-white/[0.06] text-center shadow-2xl overflow-hidden"
                        style={{ background: 'linear-gradient(180deg, #0c1628 0%, #080f1c 100%)' }}
                    >
                        <div className="p-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                                className="w-20 h-20 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10"
                            >
                                <CheckCircle className="text-emerald-400" size={40} />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
                            <p className="text-white/30 mb-6 text-sm">Our crew has your exact coordinates and will investigate soon.</p>

                            <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-xl mb-8 inline-block">
                                <span className="text-white/20 text-[10px] uppercase tracking-wider block mb-1">Complaint ID</span>
                                <span className="text-xl font-mono text-emerald-400 font-bold">{complaintId}</span>
                            </div>

                            {formData.areaPath && (
                                <div className="flex items-center justify-center gap-2 mb-6 text-xs text-white/20">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{formData.areaPath}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/dashboard"
                                    className="w-full border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl hover:bg-emerald-500/10 transition-colors text-center"
                                >
                                    View Live Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        setFormData({ state: '', district: '', area: '', subarea: '', areaPath: '', issueType: '', description: '', confirmPin: false });
                                        setLocation({ lat: 20.5937, lng: 78.9629, path: '' });
                                        setNearestArea(null);
                                        setStep('form');
                                    }}
                                    className="text-white/20 hover:text-white/50 text-sm py-2 transition-colors"
                                >
                                    Report Another Issue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
