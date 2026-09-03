'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, AlertTriangle, CheckCircle, ArrowLeft, Crosshair, MapPin, Navigation, Zap, Construction, Trash2, ShowerHead, TrafficCone, Lightbulb, CloudRain, Star, Target, LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <div className="w-full h-[300px] rounded-2xl bg-white/[0.03] flex items-center justify-center animate-pulse"><span className="text-white/20 text-sm font-medium tracking-widest uppercase">Initializing Map Payload...</span></div>
});
import { findNearestLocation, NearestLocationResult } from '@/data/indiaAreas';
import { useLanguage } from '@/context/LanguageContext';

const VoiceInput = dynamic(() => import('@/components/VoiceInput'), { ssr: false });
const VoiceComplaintButton = dynamic(() => import('@/components/VoiceComplaintButton'), { ssr: false });        

// ─── Categories ───
const CATEGORIES = [
    { id: 'water', icon: Droplets, color: 'cyan' },
    { id: 'roads', icon: Construction, color: 'amber' },
    { id: 'electricity', icon: Zap, color: 'yellow' },
    { id: 'sanitation', icon: Trash2, color: 'emerald' },
];

interface IssueType {
    id: string;
    icon: LucideIcon;
    color: string;
}

// ─── Issue types per category ───
const ISSUE_TYPES_MAP: Record<string, IssueType[]> = {
    water: [
        { id: 'no_water', icon: Droplets, color: 'rose' },
        { id: 'low_pressure', icon: ShowerHead, color: 'amber' },
        { id: 'dirty_water', icon: AlertTriangle, color: 'orange' },
        { id: 'leakage', icon: CloudRain, color: 'blue' },
    ],
    roads: [
        { id: 'pothole', icon: TrafficCone, color: 'amber' },
        { id: 'broken_road', icon: Construction, color: 'orange' },
        { id: 'flooding', icon: CloudRain, color: 'blue' },
    ],
    electricity: [
        { id: 'power_outage', icon: Zap, color: 'rose' },
        { id: 'streetlight', icon: Lightbulb, color: 'amber' },
        { id: 'voltage_issue', icon: AlertTriangle, color: 'orange' },
    ],
    sanitation: [
        { id: 'garbage', icon: Trash2, color: 'emerald' },
        { id: 'drainage', icon: Droplets, color: 'blue' },
        { id: 'open_defecation', icon: AlertTriangle, color: 'rose' },
    ],
};

function AnimatedStepTracker({ currentStep, steps }: { currentStep: number, steps: { label: string, isComplete: boolean }[] }) {
    const progressPct = (steps.filter(s => s.isComplete).length / steps.length) * 100;

    return (
        <div className="mb-8">
            <div className="flex justify-between mb-2">
                {steps.map((step, i) => (
                    <div key={i} className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-500 flex flex-col items-center gap-1.5 ${step.isComplete ? 'text-emerald-400' : currentStep === i + 1 ? 'text-white' : 'text-white/20'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 transition-all duration-500 ${step.isComplete ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : currentStep === i + 1 ? 'border-emerald-400 text-emerald-400 outline outline-2 outline-emerald-500/20 outline-offset-2' : 'border-white/10 text-white/30'}`}>
                            {step.isComplete ? <CheckCircle size={10} className="stroke-[3]" /> : i + 1}        
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30" />
                </motion.div>
            </div>
        </div>
    );
}

export default function ReportPage() {
    const { t, language } = useLanguage();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [complaintId, setComplaintId] = useState('');

    const [formData, setFormData] = useState({
        category: '',
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

    // Derived states using useMemo to avoid setState in useEffect errors
    const nearestArea = useMemo(() => findNearestLocation(location.lat, location.lng), [location.lat, location.lng]);

    const distanceFromSelectedArea = useMemo(() => {
        if (!formData.area) return null;
        return nearestArea ? nearestArea.distanceKm : null;
    }, [formData.area, nearestArea]);

    const handlePlaceSelected = (place: {
        formattedAddress: string;
        lat: number;
        lng: number;
        state: string;
        district: string;
        area: string;
        subarea: string;
        fullPath: string;
    }) => {
        setFormData(prev => ({
            ...prev,
            state: place.state,
            district: place.district,
            area: place.area || place.district,
            subarea: place.subarea,
            areaPath: place.fullPath,
        }));
        setLocation({
            lat: place.lat,
            lng: place.lng,
            path: place.fullPath,
        });
    };

    const handleMapChange = (lat: number, lng: number) => {
        setLocation(prev => ({ ...prev, lat, lng }));
    };

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
            setStep('success');
        } catch (err) {
            console.error('Failed to submit complaint:', err);
            alert('Failed to submit complaint. Please try again.');
        }

        setLoading(false);
    };

    const handleVoiceTranscript = (text: string) => {
        setFormData(prev => ({
            ...prev,
            description: prev.description ? prev.description + ' ' + text : text,
        }));
    };

    const handleVoiceComplaint = async (extracted: { category: string; issueType: string; description: string; locationMentioned: string }, transcript: string) => {
        setFormData(prev => ({
            ...prev,
            category: extracted.category || prev.category,
            issueType: extracted.issueType || prev.issueType,
            description: extracted.description || transcript,
        }));

        setLoading(true);
        const complaintData = {
            category: extracted.category,
            issueType: extracted.issueType,
            description: extracted.description || transcript,
            state: formData.state,
            district: formData.district,
            area: formData.area,
            subarea: formData.subarea,
            areaPath: formData.areaPath || `${formData.state} > ${formData.district} > ${formData.area}`,       
            lat: location.lat,
            lng: location.lng,
            fullPath: formData.areaPath,
            voiceTranscript: transcript,
            submittedViaVoice: true,
        };

        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complaintData),
            });
            const data = await res.json();
            setComplaintId(data.complaint?.id || 'WC-0000');
            setStep('success');
        } catch (err) {
            console.error('Failed to submit voice complaint:', err);
            alert('Failed to submit complaint. Please try again.');
        }

        setLoading(false);
    };

    const currentIssueTypes = ISSUE_TYPES_MAP[formData.category] || [];

    // Calculate active step for Stepper
    let activeStep = 1;
    if (formData.category) activeStep = 2;
    if (formData.category && formData.area) activeStep = 3;
    if (formData.category && formData.area && formData.confirmPin) activeStep = 4;

    const trackerSteps = [
        { label: 'Category', isComplete: !!formData.category },
        { label: 'Location', isComplete: !!formData.area },
        { label: 'Pin', isComplete: formData.confirmPin },
        { label: 'Details', isComplete: !!formData.issueType },
    ];

    return (
        <PageTransition>
            <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 flex items-center justify-center"> 

                <div className="w-full max-w-xl mt-4 mb-12">
                    {step === 'form' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-[2rem] border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0a0a0a]/90 backdrop-blur-2xl relative"
                        >
                            {/* Decorative Top Glow */}
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent blur-sm" />
                            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                            <div className="p-8 pb-4 border-b border-white/[0.04]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="flex relative">
                                            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full animate-pulse" />
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 relative z-10 border border-cyan-400/30">
                                                <Crosshair className="text-white" size={22} />
                                            </div>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-white tracking-tight">{t('report.title')}</h1>
                                            <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">{t('report.subtitle')}</p>
                                        </div>
                                    </div>
                                </div>

                                <AnimatedStepTracker currentStep={activeStep} steps={trackerSteps} />
                            </div>

                            <div className="px-8 pt-6">
                                <VoiceComplaintButton onComplaintExtracted={handleVoiceComplaint} />
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-10">
                                {/* ── Step 1: Select Category ── */}
                                <div>
                                    <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />  
                                        {t('report.step_category')}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        {CATEGORIES.map((cat) => {
                                            const Icon = cat.icon;
                                            const isSelected = formData.category === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        category: cat.id,
                                                        issueType: '',
                                                    }))}
                                                    className={`
                                                        relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center overflow-hidden group
                                                        ${isSelected
                                                            ? `border-${cat.color}-500/50 bg-${cat.color}-500/10 shadow-[0_0_20px_rgba(var(--${cat.color}-500-rgb),0.15)] ring-1 ring-${cat.color}-400/50`
                                                            : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15]'
                                                        }
                                                    `}
                                                >
                                                    {isSelected && (
                                                        <motion.div layoutId="category-glow" className={`absolute inset-0 bg-gradient-to-b from-${cat.color}-500/10 to-transparent`} />
                                                    )}
                                                    <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isSelected ? `bg-${cat.color}-500/20 text-${cat.color}-400` : `bg-white/[0.05] text-white/40 group-hover:bg-white/[0.1] group-hover:text-white/70`}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <span className={`relative z-10 text-xs font-bold uppercase tracking-wider ${isSelected ? `text-${cat.color}-400` : 'text-white/40 group-hover:text-white/70'}`}>
                                                        {t(`category.${cat.id}`)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ── Step 2: Search Location ── */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">    
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />  
                                        {t('report.step1')}
                                    </h3>

                                    <div className="relative z-20">
                                        <PlacesAutocomplete onPlaceSelected={handlePlaceSelected} />
                                    </div>

                                    <input type="hidden" value={formData.area} required />
                                </div>

                                {/* ── Step 3: Pin Precise Location on Map ── */}
                                <div className="space-y-4 relative">
                                    <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">    
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                        {t('report.step2')}
                                    </h3>

                                    <div className="relative z-0 rounded-2xl overflow-hidden shadow-inner border border-white/[0.08]">
                                        <LocationPicker lat={location.lat} lng={location.lng} onChange={handleMapChange} />
                                    </div>

                                    {nearestArea && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3.5 border border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent shadow-inner flex items-start gap-3">
                                            <div className="mt-0.5 text-cyan-400 bg-cyan-400/10 p-1.5 rounded-lg flex-shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Closest Match</span>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/40">{nearestArea.location.type}</span>   
                                                </div>
                                                <div className="text-sm font-semibold text-white/80 truncate">{nearestArea.location.path}</div>
                                                <div className="text-[10px] text-emerald-400/80 mt-1 font-medium bg-emerald-400/10 inline-block px-1.5 py-0.5 rounded-md border border-emerald-400/20">
                                                    {nearestArea.distanceKm.toFixed(2)} km accurate
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-colors cursor-pointer group select-none">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                required
                                                checked={formData.confirmPin}
                                                onChange={(e) => setFormData({ ...formData, confirmPin: e.target.checked })}
                                                className="peer appearance-none w-5 h-5 rounded-md border border-white/20 checked:border-emerald-500 checked:bg-emerald-500/20 transition-all cursor-pointer"
                                            />
                                            <CheckCircle size={12} className="absolute text-emerald-400 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]" />
                                        </div>
                                        <span className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors">{t('form.confirm_pin')}</span>
                                    </label>
                                </div>

                                {/* ── Step 4: Issue Details ── */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-white/80 flex items-center gap-2">    
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> 
                                        {t('report.step3')}
                                    </h3>

                                    {/* Issue Type Selector */}
                                    <AnimatePresence mode="wait">
                                        {formData.category ? (
                                            <motion.div
                                                key={formData.category}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="grid grid-cols-2 gap-3"
                                            >
                                                {currentIssueTypes.map((type) => {
                                                    const Icon = type.icon;
                                                    const isSelected = formData.issueType === type.id;
                                                    return (
                                                        <label
                                                            key={type.id}
                                                            className={`
                                                                cursor-pointer p-3.5 rounded-xl border transition-all duration-300 flex items-center gap-3 select-none group relative overflow-hidden
                                                                ${isSelected
                                                                    ? `border-${type.color}-500/40 bg-${type.color}-500/10 ring-1 ring-${type.color}-500/20 shadow-inner`
                                                                    : 'border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.12]'
                                                                }
                                                            `}
                                                        >
                                                            {isSelected && (
                                                                <div className={`absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-${type.color}-500/30 to-transparent rounded-bl-3xl`} />
                                                            )}
                                                            <input
                                                                type="radio"
                                                                name="issue"
                                                                value={type.id}
                                                                required
                                                                className="hidden"
                                                                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                                                            />
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? `bg-${type.color}-500/20 text-${type.color}-400` : 'bg-white/5 text-white/30 group-hover:text-white/60 group-hover:bg-white/10'}`}>
                                                                <Icon size={16} />
                                                            </div>
                                                            <span className={`text-[11px] font-bold uppercase tracking-wider flex-1 ${isSelected ? `text-${type.color}-400` : 'text-white/40 group-hover:text-white/70'}`}>     
                                                                {t(`issue.${type.id}`)}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]"
                                            >
                                                <Target size={24} className="text-white/10 mb-2" />
                                                <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest">{t('report.select_category_first')}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Description text area */}
                                    <div className="relative group">
                                        <textarea
                                            className="w-full bg-[#0a0f1a] text-white p-4 pr-16 rounded-xl border border-white/[0.08] focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 outline-none min-h-[100px] text-sm placeholder:text-white/20 transition-all resize-none shadow-inner"
                                            placeholder={t('form.describe')}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                        <div className="absolute top-3 right-3 opacity-60 group-focus-within:opacity-100 transition-opacity">
                                            <VoiceInput onTranscript={handleVoiceTranscript} language={language} />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !formData.category || !formData.area || !formData.issueType || !formData.confirmPin}
                                    className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 rounded-xl text-[15px] tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/80 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Navigation size={18} className="relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                            <span className="relative z-10 uppercase tracking-widest">{t('form.submit')}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-[2rem] border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-[#0a0f1a]/80 backdrop-blur-2xl relative overflow-hidden"
                        >
                            {/* Confetti/Rays Background */}
                            <motion.div
                                className="absolute inset-0 z-0 opacity-30"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                                style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.1) 30deg, transparent 60deg, rgba(16, 185, 129, 0.1) 90deg, transparent 120deg, rgba(16, 185, 129, 0.1) 150deg, transparent 180deg, rgba(16, 185, 129, 0.1) 210deg, transparent 240deg, rgba(16, 185, 129, 0.1) 270deg, transparent 300deg, rgba(16, 185, 129, 0.1) 330deg, transparent 360deg)' }}
                            />

                            <div className="p-12 text-center relative z-10">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}    
                                    className="relative w-28 h-28 mx-auto mb-8"
                                >
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl rotate-3 shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-emerald-300/30 flex items-center justify-center transform hover:scale-105 transition-transform cursor-default">
                                        <CheckCircle className="text-white drop-shadow-md" size={48} strokeWidth={2.5} />
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                        className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0f1a]"
                                    >
                                        <Star className="text-white fill-current w-5 h-5" />
                                    </motion.div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                        {t('report.success.title')}
                                    </h2>
                                    <p className="text-white/50 mb-8 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                                        {t('report.success.desc')} Thanks for keeping the community safe.       
                                    </p>

                                    <div className="bg-[#060a12]/50 border border-white/[0.06] p-5 rounded-2xl mb-10 shadow-inner backdrop-blur-md">
                                        <span className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] block mb-2">Tracking ID</span>
                                        <span className="text-3xl font-mono text-white font-black tracking-wider flex items-center justify-center gap-3">
                                            {complaintId.split('-')[0]}<span className="text-emerald-400">-</span>{complaintId.split('-')[1] || complaintId}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Link
                                            href={`/track/${complaintId}`}
                                            className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-emerald-400 hover:text-[#0a0f1a] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all duration-300 text-center flex items-center justify-center gap-2 uppercase tracking-wide"
                                        >
                                            <Navigation size={18} />
                                            {t('report.success.track')}
                                        </Link>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href="/dashboard"
                                                className="w-full bg-white/[0.03] border border-white/[0.08] text-white/80 font-bold py-3.5 rounded-xl hover:bg-white/[0.08] transition-colors text-center text-xs uppercase tracking-wider"
                                            >
                                                {t('cta.dashboard')}
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setFormData({ category: '', state: '', district: '', area: '', subarea: '', areaPath: '', issueType: '', description: '', confirmPin: false });
                                                    setLocation({ lat: 20.5937, lng: 78.9629, path: '' });      
                                                    setStep('form');
                                                }}
                                                className="w-full bg-transparent border border-white/[0.08] text-white/40 font-bold py-3.5 rounded-xl hover:text-white/80 hover:border-white/[0.15] transition-colors text-xs uppercase tracking-wider"
                                            >
                                                {t('report.another')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </PageTransition>
    );
}
