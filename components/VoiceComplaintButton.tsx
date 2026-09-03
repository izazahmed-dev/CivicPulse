'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Mic, MicOff, Loader2, CheckCircle, RotateCcw, Send, Sparkles, AlertTriangle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface ExtractedComplaint {
    category: string;
    issueType: string;
    description: string;
    descriptionOriginal?: string;
    detectedLanguage: string;
    detectedLanguageCode?: string;
    transcript?: string;
    transcriptEnglish?: string;
    confidence: number;
    locationMentioned: string;
}

interface VoiceComplaintButtonProps {
    onComplaintExtracted: (data: ExtractedComplaint, transcript: string) => void;
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'review' | 'error';

const CATEGORY_LABELS: Record<string, { en: string; hi: string; icon: string; color: string }> = {
    water: { en: 'Water', hi: 'पानी', icon: '💧', color: 'text-cyan-400' },
    roads: { en: 'Roads', hi: 'सड़कें', icon: '🛣️', color: 'text-amber-400' },
    electricity: { en: 'Electricity', hi: 'बिजली', icon: '⚡', color: 'text-yellow-400' },
    sanitation: { en: 'Sanitation', hi: 'स्वच्छता', icon: '🧹', color: 'text-emerald-400' },    
};

const ISSUE_LABELS: Record<string, { en: string; hi: string }> = {
    no_water: { en: 'No Water Supply', hi: 'पानी की आपूर्ति नहीं' },
    low_pressure: { en: 'Low Pressure', hi: 'कम दबाव' },
    dirty_water: { en: 'Contaminated Water', hi: 'दूषित पानी' },
    leakage: { en: 'Pipe Leakage', hi: 'पाइप रिसाव' },
    pothole: { en: 'Pothole', hi: 'गड्ढा' },
    broken_road: { en: 'Broken Road', hi: 'टूटी सड़क' },
    flooding: { en: 'Road Flooding', hi: 'सड़क पर बाढ़' },
    power_outage: { en: 'Power Outage', hi: 'बिजली कटौती' },
    streetlight: { en: 'Streetlight Issue', hi: 'स्ट्रीटलाइट खराब' },
    voltage_issue: { en: 'Voltage Fluctuation', hi: 'वोल्टेज उतार-चढ़ाव' },      
    garbage: { en: 'Garbage Dump', hi: 'कूड़ा ढेर' },
    drainage: { en: 'Blocked Drain', hi: 'नाली बंद' },
    open_defecation: { en: 'Open Defecation', hi: 'खुले में शौच' },
};

const LANGUAGE_FLAGS: Record<string, string> = {
    hi: '🇮🇳', en: '🇬🇧', ta: '🇮🇳', te: '🇮🇳', bn: '🇮🇳', mr: '🇮🇳',
    gu: '🇮🇳', kn: '🇮🇳', ml: '🇮🇳', pa: '🇮🇳', or: '🇮🇳', ur: '🇮🇳',
    as: '🇮🇳', kok: '🇮🇳', sa: '🇮🇳', mai: '🇮🇳', ne: '🇳🇵',
};

const SUPPORTED_LANGS = [
    'Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi',
    'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu',
    'Assamese', 'Konkani', 'Nepali', 'Maithili',
];

// Convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            // Strip the data:audio/...;base64, prefix
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export default function VoiceComplaintButton({ onComplaintExtracted }: VoiceComplaintButtonProps) {
    const { t, language } = useLanguage();
    const [state, setState] = useState<VoiceState>('idle');
    const [extracted, setExtracted] = useState<ExtractedComplaint | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Waveform data pre-calculated to satisfy React purity rules
    const waveformData = useMemo(() => Array.from({ length: 32 }, () => ({
        heights: [6, Math.random() * 36 + 6, 6],
        duration: 0.4 + Math.random() * 0.4
    })), []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = useCallback(async () => {
        try {
            setErrorMsg('');
            setExtracted(null);
            setRecordingTime(0);
            audioChunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Pick the best available mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(250); // Collect chunks every 250ms
            setState('recording');

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err: any) {
            console.error('Microphone access error:', err);
            if (err.name === 'NotAllowedError') {
                setErrorMsg('Microphone access denied. Please allow microphone permission in your browser settings.');
            } else {
                setErrorMsg('Could not access microphone. Please check your device settings.');
            }
            setState('error');
        }
    }, []);

    const stopRecording = useCallback(async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const mediaRecorder = mediaRecorderRef.current;
        if (!mediaRecorder || mediaRecorder.state !== 'recording') {
            setErrorMsg('No active recording found.');
            setState('error');
            return;
        }

        setState('processing');

        // Wait for final data
        await new Promise<void>((resolve) => {
            mediaRecorder.onstop = () => resolve();
            mediaRecorder.stop();
        });

        // Stop the mic stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
        });

        if (audioBlob.size < 1000) {
            setErrorMsg('Recording too short. Please speak for at least 2 seconds.');
            setState('error');
            return;
        }

        try {
            const base64Audio = await blobToBase64(audioBlob);

            const res = await fetch('/api/voice-complaint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio: base64Audio,
                    mimeType: mediaRecorder.mimeType.split(';')[0], // e.g. 'audio/webm'
                }),
            });

            const data = await res.json();

            if (data.success && data.extracted) {
                setExtracted(data.extracted);
                setState('review');
            } else {
                setErrorMsg(data.error || 'Failed to process audio');
                setState('error');
            }
        } catch (err) {
            console.error('Voice complaint API error:', err);
            setErrorMsg('Network error. Please try again.');
            setState('error');
        }
    }, []);

    const handleSubmit = useCallback(() => {
        if (extracted) {
            onComplaintExtracted(extracted, extracted.transcript || extracted.description);
            setState('idle');
            setExtracted(null);
        }
    }, [extracted, onComplaintExtracted]);

    const handleRetry = useCallback(() => {
        setState('idle');
        setExtracted(null);
        setErrorMsg('');
        setRecordingTime(0);
        audioChunksRef.current = [];
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const lang = language === 'hi' ? 'hi' : 'en';

    return (
        <div className="mb-6">
            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-medium flex items-center gap-1.5">
                    <Sparkles size={10} className="text-violet-400/60" />
                    {t('voice.or_divider')}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>

            <AnimatePresence mode="wait">
                {/* ─── IDLE STATE ─── */}
                {state === 'idle' && (
                    <motion.button
                        key="idle"
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={startRecording}
                        className="w-full group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-purple-500/[0.05] p-5 transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                                <Mic className="text-white" size={26} />
                            </div>
                            <div className="text-left flex-1">
                                <div className="text-base font-bold text-white/90 mb-0.5">
                                    {t('voice.complaint_btn')}
                                </div>
                                <div className="text-xs text-white/30 flex items-center gap-1.5">
                                    <Globe size={11} className="text-violet-400/50" />
                                    {t('voice.auto_detect')}
                                </div>
                            </div>
                            <Sparkles className="ml-auto text-violet-400/40 group-hover:text-violet-400/70 transition-colors" size={20} />
                        </div>

                        {/* Language tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {SUPPORTED_LANGS.map((l) => (
                                <span key={l} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05] text-white/20">
                                    {l}
                                </span>
                            ))}
                        </div>

                        {/* Shimmer */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                    </motion.button>
                )}

                {/* ─── RECORDING STATE ─── */}
                {state === 'recording' && (
                    <motion.div
                        key="recording"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/[0.08] to-red-500/[0.05] p-5"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                                    <MicOff className="text-white relative z-10" size={26} />
                                </div>
                                <motion.div
                                    className="absolute inset-0 rounded-2xl bg-rose-500/20"
                                    animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                                />
                                <motion.div
                                    className="absolute inset-0 rounded-2xl bg-rose-500/15"
                                    animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="text-base font-bold text-rose-300 mb-0.5 flex items-center gap-2">
                                    {t('voice.recording')}
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-rose-400"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                </div>
                                <div className="text-xs text-white/30 flex items-center gap-2">
                                    <Globe size={11} className="text-rose-400/50" />
                                    {lang === 'hi' ? 'किसी भी भाषा में बोलें' : 'Speak in any language'}
                                </div>
                            </div>
                            <div className="text-xl font-mono font-bold text-rose-300/70 tabular-nums">
                                {formatTime(recordingTime)}
                            </div>
                        </div>

                        {/* Waveform */}
                        <div className="flex items-center justify-center gap-[3px] h-12 mb-4">
                            {waveformData.map((data, i) => (
                                <motion.div
                                    key={i}
                                    className="w-[3px] rounded-full bg-gradient-to-t from-rose-500/40 to-rose-400/80"
                                    animate={{
                                        height: data.heights,
                                    }}
                                    transition={{
                                        duration: data.duration,
                                        repeat: Infinity,
                                        delay: i * 0.04,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={stopRecording}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold text-sm hover:from-rose-600 hover:to-red-600 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                        >
                            <MicOff size={16} />
                            {t('voice.stop')}
                        </button>
                    </motion.div>
                )}

                {/* ─── PROCESSING STATE ─── */}
                {state === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-purple-500/[0.04] p-6"
                    >
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Loader2 className="text-violet-400 animate-spin" size={32} />
                                </div>
                                <motion.div
                                    className="absolute inset-0 rounded-2xl border-2 border-violet-400/30"      
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white/80 mb-1">{t('voice.processing')}</div>
                                <div className="text-xs text-white/25 flex items-center justify-center gap-1.5">
                                    <Globe size={11} />
                                    {lang === 'hi' ? 'भाषा पहचान + विश्लेषण...' : 'Detecting language + analyzing...'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ─── REVIEW STATE ─── */}
                {state === 'review' && extracted && (
                    <motion.div
                        key="review"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.04] p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="text-emerald-400" size={18} />
                            <span className="text-sm font-bold text-white/80">{t('voice.review_title')}</span>  
                            {extracted.confidence >= 0.5 && (
                                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    {Math.round(extracted.confidence * 100)}% {lang === 'hi' ? 'सटीकता' : 'confidence'}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2.5 mb-4">
                            {/* Detected Language */}
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
                                <span className="text-lg">{LANGUAGE_FLAGS[extracted.detectedLanguageCode || ''] || '🌐'}</span>
                                <div>
                                    <div className="text-[10px] text-violet-300/50 uppercase tracking-wider">{t('voice.auto_detect')}</div>
                                    <div className="text-sm font-semibold text-violet-300">
                                        {extracted.detectedLanguage || 'Unknown'}
                                    </div>
                                </div>
                                <Globe size={14} className="ml-auto text-violet-400/30" />
                            </div>

                            {/* Category */}
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                <span className="text-lg">{CATEGORY_LABELS[extracted.category]?.icon || '📋'}</span>
                                <div>
                                    <div className="text-[10px] text-white/25 uppercase tracking-wider">{lang === 'hi' ? 'श्रेणी' : 'Category'}</div>
                                    <div className={`text-sm font-semibold ${CATEGORY_LABELS[extracted.category]?.color || 'text-white/70'}`}>
                                        {CATEGORY_LABELS[extracted.category]?.[lang] || extracted.category}     
                                    </div>
                                </div>
                            </div>

                            {/* Issue Type */}
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                <span className="text-lg">🛠️</span>
                                <div>
                                    <div className="text-[10px] text-white/25 uppercase tracking-wider">{lang === 'hi' ? 'समस्या प्रकार' : 'Issue Type'}</div>
                                    <div className="text-sm font-semibold text-white/70">
                                        {ISSUE_LABELS[extracted.issueType]?.[lang] || extracted.issueType}      
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">       
                                <div className="text-[10px] text-white/25 uppercase tracking-wider mb-1">       
                                    {lang === 'hi' ? 'विवरण' : 'Description'}
                                </div>
                                <div className="text-sm text-white/60 leading-relaxed">
                                    {extracted.description}
                                </div>
                                {extracted.descriptionOriginal && extracted.descriptionOriginal !== extracted.description && (
                                    <div className="text-xs text-white/30 mt-1.5 pt-1.5 border-t border-white/[0.04] italic">
                                        {extracted.descriptionOriginal}
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            {extracted.locationMentioned && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                                    <span className="text-lg">📍</span>
                                    <div>
                                        <div className="text-[10px] text-white/25 uppercase tracking-wider">{lang === 'hi' ? 'स्थान' : 'Location'}</div>
                                        <div className="text-sm font-semibold text-white/70">{extracted.locationMentioned}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transcript */}
                        {extracted.transcript && (
                            <div className="mb-4 p-2.5 rounded-xl bg-black/20 border border-white/[0.04]">      
                                <div className="text-[10px] text-white/20 mb-1">{lang === 'hi' ? 'मूल प्रतिलेखन' : 'Transcript'}</div>
                                <div className="text-xs text-white/40 italic">&ldquo;{extracted.transcript}&rdquo;</div>
                                {extracted.transcriptEnglish && extracted.transcriptEnglish !== extracted.transcript && (
                                    <div className="text-xs text-white/25 mt-1">{extracted.transcriptEnglish}</div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 font-semibold text-sm hover:bg-white/[0.04] hover:text-white/70 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={14} />
                                {t('voice.try_again')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <Send size={14} />
                                {t('voice.submit')}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ─── ERROR STATE ─── */}
                {state === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.06] to-red-500/[0.04] p-5"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                                <AlertTriangle className="text-rose-400" size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-rose-300">{lang === 'hi' ? 'त्रुटि' : 'Error'}</div>
                                <div className="text-xs text-white/30">{errorMsg}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="w-full py-3 rounded-xl border border-rose-500/20 text-rose-300 font-semibold text-sm hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={14} />
                            {t('voice.try_again')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
