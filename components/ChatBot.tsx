'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    MessageSquare,
    X,
    Send,
    Loader2,
    Sparkles,
    RotateCcw,
    ChevronDown,
    Droplets,
    Copy,
    Check,
    Bot,
    User,
    Zap,
    Cpu,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/context/ChatContext';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

/* ── animated typing dots ── */
function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-3 py-2">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

/* ── copy button ── */
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-all border border-white/[0.05]"
            title="Copy message"
        >
            {copied ? (
                <Check className="w-3 h-3 text-cyan-400" />
            ) : (
                <Copy className="w-3 h-3 text-white/40 group-hover:text-white/70" />
            )}
        </button>
    );
}

/* ── format markdown-lite text ── */
function FormattedText({ content }: { content: string }) {
    // Advanced markdown rendering for bold, links, code, bullets
    const lines = content.split('\n');
    return (
        <div className="space-y-2 text-[13.5px] leading-relaxed">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-1.5" />;

                const processed = line
                    .replace(/\*\*(.*?)\*\*/g, '<b class="font-bold text-white">$1</b>')
                    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[12px] font-mono">$1</code>');

                const isBullet = /^[\-\*•]\s/.test(line.trim());
                if (isBullet) {
                    const bulletContent = processed.replace(/^[\-\*•]\s/, '');
                    return (
                        <div key={i} className="flex items-start gap-2.5 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                            <span className="text-white/80" dangerouslySetInnerHTML={{ __html: bulletContent }} />
                        </div>
                    );
                }

                const numberedMatch = line.trim().match(/^(\d+[.)]\s)(.*)/);
                if (numberedMatch) {
                    return (
                        <div key={i} className="flex items-start gap-2 ml-1">
                            <span className="text-cyan-400 font-bold text-[12px] mt-0.5 min-w-[20px]">{numberedMatch[1]}</span>
                            <span className="text-white/80" dangerouslySetInnerHTML={{ __html: processed.replace(/^\d+[.)]\s/, '') }} />
                        </div>
                    );
                }

                return <p key={i} className="text-white/80" dangerouslySetInnerHTML={{ __html: processed }} />; 
            })}
        </div>
    );
}

/* ── message bubble ── */
function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}
        >
            <div className={`flex items-end gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <motion.div
                    whileHover={{ scale: 1.1, rotate: isUser ? -10 : 10 }}
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${  
                        isUser
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25 border border-indigo-400/30'
                            : 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/25 border border-cyan-400/30'
                    }`}
                >
                    {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />} 
                </motion.div>

                {/* Message Content */}
                <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                        className={`px-4 py-3.5 relative overflow-hidden backdrop-blur-xl ${
                            isUser
                                ? 'bg-gradient-to-br from-indigo-500/90 to-purple-600/90 text-white rounded-2xl rounded-br-sm shadow-[0_8px_32px_rgba(99,102,241,0.2)] border border-indigo-400/30'
                                : 'bg-white/[0.03] text-white rounded-2xl rounded-bl-sm shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/[0.08]'
                        }`}
                    >
                        {/* Shimmer effect for AI messages */}
                        {!isUser && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        )}
                        {isUser ? <p className="text-[13.5px] leading-relaxed">{msg.content}</p> : <FormattedText content={msg.content} />}
                    </div>

                    {/* Metadata */}
                    <div className={`flex items-center gap-2 px-1 ${isUser ? 'justify-end flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-white/30 font-medium tracking-wider uppercase">       
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}      
                        </span>
                        {!isUser && <CopyButton text={msg.content} />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ── suggestion chip ── */
function SuggestionChip({ text, icon, iconColor, onClick }: { text: string; icon: any; iconColor: string; onClick: () => void }) {
    const Icon = icon;
    return (
        <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer text-left group w-full relative overflow-hidden"
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity ${iconColor}`}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] text-white/60 group-hover:text-white/90 transition-colors flex-1">{text}</span>
            <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors translate-x-2 group-hover:translate-x-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </motion.button>
    );
}

/* ══════════════ Main ChatBot Component ══════════════ */

export default function ChatBot() {
    const { isOpen, closeChat, toggleChat } = useChat();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    const suggestions = [
        { text: 'Analyze water quality patterns', icon: Sparkles, color: 'bg-cyan-500' },
        { text: 'Report a critical leakage', icon: Droplets, color: 'bg-blue-500' },
        { text: 'Show system resource usage', icon: Cpu, color: 'bg-indigo-500' },
        { text: 'Explain dashboard alerts', icon: Zap, color: 'bg-purple-500' },
    ];

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 400);
        }
    }, [isOpen]);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };

    const handleSubmit = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || isLoading) return;

        const userMessage: Message = { role: 'user', content: msg, timestamp: new Date() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        if (inputRef.current) inputRef.current.style.height = 'auto';

        try {
            const apiMessages = [...messages, userMessage].map((m) => ({ role: m.role, content: m.content }));  
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages }),
            });
            const data = await response.json();
            const reply = data.reply || data.choices?.[0]?.message?.content || "I couldn't process that query.";

            setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);     
        } catch {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection fragmented. Please retry.', timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const clearChat = () => {
        setMessages([]);
    };

    const hasMessages = messages.length > 0;

    return (
        <>
            <style jsx global>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>

            {/* ── FAB Toggle ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        onClick={toggleChat}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-[1px] shadow-[0_8px_32px_rgba(6,182,212,0.4)] group overflow-hidden"       
                    >
                        <div className="w-full h-full bg-[#060a12]/50 backdrop-blur-xl rounded-[15px] flex items-center justify-center relative z-10 hover:bg-transparent transition-colors duration-300">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] z-0" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Chat Interface ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-[100] w-[440px] h-[680px] max-h-[88vh] max-w-[calc(100vw-48px)] rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] bg-[#020617]/90 backdrop-blur-2xl border border-white/[0.08]"
                    >
                        {/* ── Premium Header ── */}
                        <div className="relative h-20 px-6 flex items-center justify-between bg-white/[0.02] border-b border-white/[0.06] overflow-hidden shrink-0">
                            {/* Animated glowing background */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/20 blur-[50px] rounded-full" />

                            <div className="relative z-10 flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                        <div className="w-full h-full rounded-[15px] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-cyan-400" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#020617] flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                                        L.I.O.N. <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest font-mono">Core AI</span>
                                    </h3>
                                    <p className="text-[11px] text-white/40 tracking-wider font-medium flex items-center gap-1.5 mt-0.5">
                                        Liquid Intelligence Node
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-2">
                                {hasMessages && (
                                    <motion.button
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}  
                                        whileTap={{ scale: 0.9 }}
                                        onClick={clearChat}
                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                        title="Reset Interface"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}      
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeChat}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/[0.05]"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>

                        {/* ── Messages Area ── */}
                        <div
                            ref={containerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-5 py-6 relative custom-scrollbar scroll-smooth"
                        >
                            <AnimatePresence mode="wait">
                                {!hasMessages ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="flex flex-col items-center justify-center h-full pt-10"      
                                    >
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                                            <motion.div
                                                animate={{
                                                    boxShadow: ['0 0 20px rgba(6,182,212,0.2)', '0 0 40px rgba(6,182,212,0.4)', '0 0 20px rgba(6,182,212,0.2)']
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400/10 to-blue-600/10 border border-cyan-400/20 flex items-center justify-center relative z-10"
                                            >
                                                <Cpu className="w-10 h-10 text-cyan-400" />
                                            </motion.div>
                                        </div>

                                        <h2 className="text-xl font-bold text-white mb-2 text-center">System Online.</h2>
                                        <p className="text-sm text-white/40 mb-10 text-center max-w-[280px] leading-relaxed">
                                            I am synced with the city&apos;s hydraulic grid. How can I assist your operations today?
                                        </p>

                                        <div className="w-full space-y-2.5">
                                            {suggestions.map((s, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}       
                                                >
                                                    <SuggestionChip text={s.text} icon={s.icon} iconColor={s.color} onClick={() => handleSubmit(s.text)} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-2">
                                        {messages.map((msg, i) => (
                                            <MessageBubble key={i} msg={msg} />
                                        ))}

                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-end gap-3 mb-6"
                                            >
                                                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/25 border border-cyan-400/30">    
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="bg-white/[0.03] border border-white/[0.08] px-2 py-1.5 rounded-2xl rounded-bl-sm backdrop-blur-xl">
                                                    <TypingIndicator />
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={messagesEndRef} className="h-4" />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Scroll to bottom button */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => scrollToBottom()}
                                    className="absolute bottom-28 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#020617]/80 border border-white/10 flex items-center justify-center backdrop-blur-xl hover:bg-white/10 transition-colors z-20 shadow-xl"
                                >
                                    <ChevronDown className="w-5 h-5 text-white/60" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* ── Input Area ── */}
                        <div className="p-5 bg-gradient-to-t from-[#020617] to-transparent relative z-10 shrink-0">
                            <div className="relative flex items-end gap-3 p-2 bg-white/[0.02] border border-white/[0.08] rounded-3xl backdrop-blur-2xl focus-within:border-cyan-500/40 focus-within:bg-white/[0.04] transition-all duration-300 shadow-inner">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Initiate query protocol..."
                                    rows={1}
                                    className="flex-1 bg-transparent text-white text-[14px] px-3 py-2.5 resize-none outline-none placeholder:text-white/20 min-h-[44px] max-h-[140px] leading-relaxed custom-scrollbar"
                                />
                                <motion.button
                                    onClick={() => handleSubmit()}
                                    disabled={isLoading || !input.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg disabled:opacity-30 disabled:shadow-none mb-0.5"
                                    style={{
                                        background: input.trim() && !isLoading
                                            ? 'linear-gradient(135deg, #06b6d4, #2563eb)'
                                            : 'rgba(255,255,255,0.05)',
                                    }}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 text-white ml-0.5" />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
