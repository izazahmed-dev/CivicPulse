'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Camera, Upload, ArrowLeft, Droplets, ShieldCheck, ShieldAlert, ShieldX,
    RefreshCw, Share2, MapPin, Waves, Zap, AlertTriangle, CheckCircle
} from 'lucide-react';

interface ScanResult {
    turbidity: number;
    colorAnalysis: string;
    riskLevel: 'Clean' | 'Suspicious' | 'Hazardous';
    contaminants: string[];
    summary: string;
    drinkable: boolean;
    confidence: number;
}

type ViewState = 'capture' | 'scanning' | 'result';

export default function ScanPage() {
    const [view, setView] = useState<ViewState>('capture');
    const [imageData, setImageData] = useState<string | null>(null);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCameraActive(true);
        } catch {
            setError('Camera access denied. Please use file upload instead.');
        }
    };

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    }, []);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const data = canvas.toDataURL('image/jpeg', 0.8);
            setImageData(data);
            stopCamera();
            analyzeSample(data);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result as string;
            setImageData(data);
            analyzeSample(data);
        };
        reader.readAsDataURL(file);
    };

    const analyzeSample = async (image: string) => {
        setView('scanning');
        setError('');
        try {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
                setView('capture');
                return;
            }
            setResult(data);

            // Save to MongoDB via API
            fetch('/api/scans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...data,
                id: `WS-${Math.floor(Math.random() * 10000)}`,
              }),
            }).catch(err => console.error('Failed to save scan:', err));

            setView('result');
        } catch {
            setError('Network error. Please try again.');
            setView('capture');
        }
    };

    const reset = () => {
        setImageData(null);
        setResult(null);
        setError('');
        setView('capture');
        stopCamera();
    };

    const riskConfig = {
        Clean: { icon: ShieldCheck, color: '#06d6a0', bg: 'from-emerald-500/20 to-emerald-900/20', border: 'border-emerald-500/30', label: 'SAFE' },
        Suspicious: { icon: ShieldAlert, color: '#ffd166', bg: 'from-amber-500/20 to-amber-900/20', border: 'border-amber-500/30', label: 'CAUTION' },
        Hazardous: { icon: ShieldX, color: '#ff6b6b', bg: 'from-rose-500/20 to-rose-900/20', border: 'border-rose-500/30', label: 'DANGER' },
    };

    return (
        <main className="min-h-screen bg-[#0a192f] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                            <Droplets size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">AQUA SCANNER</span>
                    </div>
                    <div className="w-16" /> {/* spacer */}
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {/* CAPTURE VIEW */}
                    {view === 'capture' && (
                        <motion.div key="capture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            {/* Hero */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20"
                                >
                                    <Droplets size={36} className="text-white" />
                                </motion.div>
                                <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                                    Water Quality Scanner
                                </h1>
                                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                                    Photograph your tap water in a clear glass. Our AI will analyze turbidity, color, and contamination risk.
                                </p>
                            </div>

                            {/* Instructions */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[
                                    { icon: '🥛', text: 'Fill a clear glass' },
                                    { icon: '💡', text: 'Good lighting, white background' },
                                    { icon: '📸', text: 'Capture or upload' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        className="bg-[#0f172a] p-4 rounded-2xl border border-slate-700/50 text-center"
                                    >
                                        <span className="text-2xl block mb-2">{item.icon}</span>
                                        <span className="text-xs text-slate-400">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Camera Area */}
                            {cameraActive ? (
                                <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 mb-6">
                                    <video ref={videoRef} className="w-full aspect-[4/3] object-cover bg-black" playsInline muted />
                                    {/* Scan overlay grid */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-4 border-2 border-cyan-400/20 rounded-xl" />
                                        <div className="absolute top-1/2 left-4 right-4 h-px bg-cyan-400/20" />
                                        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-cyan-400/20" />
                                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                                    </div>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                        <button
                                            onClick={capturePhoto}
                                            className="w-16 h-16 rounded-full bg-white border-4 border-cyan-400 shadow-lg shadow-cyan-400/30 hover:scale-105 transition-transform flex items-center justify-center"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 transition-colors" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { stopCamera(); }}
                                        className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 mb-6">
                                    <button
                                        onClick={startCamera}
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                                    >
                                        <Camera size={22} /> Open Camera
                                    </button>
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="w-full bg-[#1e293b] hover:bg-[#253248] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 border border-slate-700 transition-all"
                                    >
                                        <Upload size={20} /> Upload Photo
                                    </button>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-sm flex items-center gap-2">
                                    <AlertTriangle size={16} /> {error}
                                </motion.div>
                            )}

                            {/* Recent scans */}
                            <RecentScans />
                        </motion.div>
                    )}

                    {/* SCANNING VIEW */}
                    {view === 'scanning' && (
                        <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-12">
                            {/* Image preview with scan animation */}
                            <div className="relative w-64 h-64 rounded-3xl overflow-hidden mb-8 border-2 border-cyan-500/30">
                                {imageData && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={imageData} alt="Water sample" className="w-full h-full object-cover" />
                                )}
                                {/* Scan line */}
                                <div className="absolute inset-0">
                                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
                                </div>
                                {/* Corner brackets */}
                                <div className="absolute inset-3 border-2 border-cyan-400/30 rounded-xl" />
                            </div>

                            <div className="text-center space-y-3">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-10 h-10 mx-auto"
                                >
                                    <Zap size={40} className="text-cyan-400" />
                                </motion.div>
                                <h2 className="text-xl font-bold text-white">Analyzing Sample...</h2>
                                <p className="text-sm text-slate-400">AI is checking turbidity, color, and contaminants</p>
                                <div className="flex items-center gap-2 justify-center mt-4">
                                    {['Turbidity', 'Color', 'Contaminants', 'Risk'].map((step, i) => (
                                        <motion.div
                                            key={step}
                                            initial={{ opacity: 0.3 }}
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                                            className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 font-medium"
                                        >
                                            {step}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* RESULT VIEW */}
                    {view === 'result' && result && (
                        <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Risk Level Banner */}
                            {(() => {
                                const config = riskConfig[result.riskLevel];
                                const RiskIcon = config.icon;
                                return (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`bg-gradient-to-r ${config.bg} ${config.border} border rounded-3xl p-6 mb-6 text-center`}
                                    >
                                        <RiskIcon size={48} className="mx-auto mb-3" style={{ color: config.color }} />
                                        <h2 className="text-2xl font-black mb-1" style={{ color: config.color }}>
                                            {config.label}
                                        </h2>
                                        <p className="text-sm text-slate-300">{result.riskLevel} — {result.drinkable ? 'Likely safe to drink' : 'Do NOT drink this water'}</p>
                                    </motion.div>
                                );
                            })()}

                            {/* Image + Metrics */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {/* Sample Image */}
                                <div className="rounded-2xl overflow-hidden border border-slate-700">
                                    {imageData && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={imageData} alt="Analyzed sample" className="w-full aspect-square object-cover" />
                                    )}
                                </div>
                                {/* Core Metrics */}
                                <div className="space-y-3">
                                    {/* Turbidity Gauge */}
                                    <div className="bg-[#0f172a] rounded-2xl border border-slate-700/50 p-4">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Turbidity</div>
                                        <div className="text-3xl font-black" style={{ color: result.turbidity < 30 ? '#06d6a0' : result.turbidity < 60 ? '#ffd166' : '#ff6b6b' }}>
                                            {result.turbidity}
                                            <span className="text-sm font-normal text-slate-400">/100</span>
                                        </div>
                                        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full animate-gauge-fill"
                                                style={{
                                                    width: `${result.turbidity}%`,
                                                    background: result.turbidity < 30 ? '#06d6a0' : result.turbidity < 60 ? '#ffd166' : '#ff6b6b',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {/* Confidence */}
                                    <div className="bg-[#0f172a] rounded-2xl border border-slate-700/50 p-4">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">AI Confidence</div>
                                        <div className="text-2xl font-bold text-cyan-400">
                                            {result.confidence}%
                                        </div>
                                    </div>
                                    {/* Color */}
                                    <div className="bg-[#0f172a] rounded-2xl border border-slate-700/50 p-4">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Color Analysis</div>
                                        <p className="text-xs text-slate-300 leading-relaxed">{result.colorAnalysis}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-[#0f172a] rounded-2xl border border-slate-700/50 p-5 mb-4">
                                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                    <Waves size={16} className="text-cyan-400" /> Analysis Summary
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
                            </div>

                            {/* Contaminants */}
                            {result.contaminants.length > 0 && (
                                <div className="bg-[#0f172a] rounded-2xl border border-slate-700/50 p-5 mb-6">
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-amber-400" /> Detected Contaminants
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.contaminants.map((c, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    onClick={reset}
                                    className="bg-[#1e293b] hover:bg-[#253248] text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
                                >
                                    <RefreshCw size={18} /> Scan Again
                                </button>
                                <Link
                                    href="/report"
                                    className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all text-center"
                                >
                                    <MapPin size={18} /> Report Issue
                                </Link>
                            </div>

                            {!result.drinkable && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center"
                                >
                                    <p className="text-rose-300 text-sm font-medium">⚠️ This water may not be safe. Consider filing a municipal complaint.</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <canvas ref={canvasRef} className="hidden" />
            </div>
        </main>
    );
}

function RecentScans() {
    const [scans, setScans] = useState<Array<{ id: string; riskLevel: string; turbidity: number; timestamp: number }>>([]);

    React.useEffect(() => {
        fetch('/api/scans')
          .then(res => res.json())
          .then((data) => {
            if (Array.isArray(data)) setScans(data.slice(0, 5));
          })
          .catch(err => console.error('Failed to load scans:', err));
    }, []);

    if (scans.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Recent Scans</h3>
            <div className="space-y-2">
                {scans.map((s) => (
                    <div key={s.id} className="bg-[#0f172a] p-3 rounded-xl border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${s.riskLevel === 'Clean' ? 'bg-emerald-400' :
                                    s.riskLevel === 'Suspicious' ? 'bg-amber-400' : 'bg-rose-400'
                                }`} />
                            <div>
                                <span className="text-sm font-medium text-white">{s.riskLevel}</span>
                                <span className="text-xs text-slate-500 ml-2">T: {s.turbidity}/100</span>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500">
                            {new Date(s.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
