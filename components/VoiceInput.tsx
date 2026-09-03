'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Language code to Web Speech API locale mapping
const SPEECH_LOCALES: Record<string, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    or: 'or-IN',
};

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    language: string;
    className?: string;
}

// Extend Window for webkit prefix
interface SpeechRecognitionEvent {
    results: { [index: number]: { [index: number]: { transcript: string } } };
    resultIndex: number;
}

export default function VoiceInput({ onTranscript, language, className = '' }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [interimText, setInterimText] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = SPEECH_LOCALES[language] || 'en-IN';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interim = '';

            for (let i = event.resultIndex; i < Object.keys(event.results).length; i++) {
                const result = event.results[i];
                if (result) {
                    const transcript = result[0]?.transcript || '';
                    if ((result as any).isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interim += transcript;
                    }
                }
            }

            setInterimText(interim);

            if (finalTranscript) {
                onTranscript(finalTranscript);
                setInterimText('');
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setInterimText('');
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimText('');
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [language, onTranscript]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
        setInterimText('');
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    if (!isSupported) return null;

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`
            relative p-3 rounded-xl border transition-all duration-300
            ${isListening
                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/20'
                            : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/[0.12] hover:bg-white/[0.06]'
                        }
          `}
                    title={isListening ? 'Stop Recording' : 'Start Voice Input'}
                >
                    {/* Animated pulse rings when recording */}
                    <AnimatePresence>
                        {isListening && (
                            <>
                                <motion.div
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                                    className="absolute inset-0 rounded-xl bg-rose-500/30"
                                />
                                <motion.div
                                    initial={{ scale: 1, opacity: 0.3 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                                    className="absolute inset-0 rounded-xl bg-rose-500/20"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {isListening ? (
                        <MicOff size={18} className="relative z-10" />
                    ) : (
                        <Mic size={18} className="relative z-10" />
                    )}
                </button>

                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-xs text-rose-400"
                    >
                        <Loader2 size={12} className="animate-spin" />
                        <span>Listening…</span>
                    </motion.div>
                )}
            </div>

            {/* Interim text preview */}
            <AnimatePresence>
                {interimText && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 italic"
                    >
                        {interimText}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
