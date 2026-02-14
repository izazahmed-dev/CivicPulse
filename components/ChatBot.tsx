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
    ExternalLink,
    Copy,
    Check,
    Bot,
    User,
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
        <div className="flex items-center gap-1.5 px-4 py-3">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-400/60"
                    animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                    transition={{
                        duration: 0.9,
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
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 transition-all"
            title="Copy message"
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
                <Copy className="w-3.5 h-3.5 text-white/30" />
            )}
        </button>
    );
}

/* ── format markdown-lite text ── */
function FormattedText({ content }: { content: string }) {
    // Simple markdown rendering for bold, links, and bullets
    const lines = content.split('\n');
    return (
        <div className="space-y-1.5">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-1" />;

                // Bold text
                let processed = line.replace(/\*\*(.*?)\*\*/g, '<b class="font-semibold text-white">$1</b>');
                // Inline code
                processed = processed.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 text-[12px] font-mono">$1</code>');
                // Bullet points
                const isBullet = /^[\-\*•]\s/.test(line.trim());

                if (isBullet) {
                    const bulletContent = processed.replace(/^[\-\*•]\s/, '');
                    return (
                        <div key={i} className="flex items-start gap-2 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 mt-2 flex-shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: bulletContent }} />
                        </div>
                    );
                }

                // Numbered items
                const numberedMatch = line.trim().match(/^(\d+[.)]\s)(.*)/);
                if (numberedMatch) {
                    return (
                        <div key={i} className="flex items-start gap-2 ml-1">
                            <span className="text-emerald-400/70 font-semibold text-[12px] mt-0.5 min-w-[18px]">{numberedMatch[1]}</span>
                            <span dangerouslySetInnerHTML={{ __html: processed.replace(/^\d+[.)]\s/, '') }} />
                        </div>
                    );
                }

                return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />;
            })}
        </div>
    );
}

/* ── message bubble ── */
function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 group`}
        >
            <div className={`flex items-start gap-2.5 max-w-[88%] ${isUser ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/20'
                        }`}
                >
                    {isUser ? (
                        <User className="w-4 h-4 text-white" />
                    ) : (
                        <Bot className="w-4 h-4 text-white" />
                    )}
                </motion.div>

                {/* Message content */}
                <div className="flex flex-col gap-1.5">
                    <div
                        className={`rounded-2xl px-4 py-3 text-[13.5px] leading-[1.65] ${isUser
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-lg shadow-blue-600/15'
                            : 'bg-white/[0.04] border border-white/[0.07] text-white/80 rounded-tl-sm backdrop-blur-sm'
                            }`}
                    >
                        {isUser ? (
                            <p>{msg.content}</p>
                        ) : (
                            <FormattedText content={msg.content} />
                        )}
                    </div>
                    <div className={`flex items-center gap-2 px-1 ${isUser ? 'justify-end' : ''}`}>
                        <span className="text-[10px] text-white/15 font-medium tabular-nums">
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
function SuggestionChip({ text, icon, onClick }: { text: string; icon: string; onClick: () => void }) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] text-white/55 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:text-white/80 hover:border-emerald-500/30 transition-all cursor-pointer text-left group"
        >
            <span className="text-base">{icon}</span>
            <span className="group-hover:text-white/80 transition-colors">{text}</span>
        </motion.button>
    );
}

/* ── quick action pills (shown after conversation starts) ── */
function QuickActions({ onSelect }: { onSelect: (text: string) => void }) {
    const actions = [
        { label: 'Report issue', icon: '🚨' },
        { label: 'Water quality', icon: '🔬' },
        { label: 'Dashboard', icon: '📊' },
    ];
    return (
        <div className="flex gap-2 px-1 mb-3">
            {actions.map((a) => (
                <motion.button
                    key={a.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(a.label === 'Report issue' ? 'How do I report a water issue?' : a.label === 'Water quality' ? 'How is water quality measured?' : 'Explain the dashboard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-emerald-500/30 transition-all"
                >
                    <span>{a.icon}</span>
                    {a.label}
                </motion.button>
            ))}
        </div>
    );
}

/* ═══════════ main component ═══════════ */

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
        { text: 'How do I report a water issue?', icon: '📝' },
        { text: 'What areas have critical shortages?', icon: '🗺️' },
        { text: 'Explain the heatmap dashboard', icon: '📊' },
        { text: 'How is water quality measured?', icon: '🔬' },
    ];

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Scroll button visibility
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

        // Reset textarea height
        if (inputRef.current) inputRef.current.style.height = 'auto';

        try {
            const apiMessages = [...messages, userMessage]
                .map((m) => ({ role: m.role, content: m.content }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages }),
            });

            const data = await response.json();

            const reply = data.reply || data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Please try again.";

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: reply, timestamp: new Date() },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Network error. Please check your connection.', timestamp: new Date() },
            ]);
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
            {/* ── FAB Toggle ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        onClick={toggleChat}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center group"
                    >
                        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-ping" style={{ animationDuration: '3s' }} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Chat Panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.92 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        className="fixed bottom-6 right-6 z-50 w-[420px] h-[620px] max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/60"
                        style={{
                            background: 'linear-gradient(180deg, #0a1628 0%, #060e1a 100%)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        {/* ── Header ── */}
                        <div className="relative flex items-center justify-between px-5 py-4">
                            {/* Glow bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <Droplets className="w-5 h-5 text-white" />
                                    </div>
                                    {/* Online indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a1628]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        WaterGrid AI
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    </h3>
                                    <p className="text-[10px] text-emerald-400/60 font-medium">Online • Powered by Gemini</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                {hasMessages && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={clearChat}
                                        className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                                        title="New chat"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </motion.button>
                                )}
                                <button
                                    onClick={closeChat}
                                    className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── Messages Area ── */}
                        <div
                            ref={containerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-4 py-4 relative"
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}
                        >
                            {/* Empty State */}
                            {!hasMessages && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center justify-center h-full text-center"
                                >
                                    {/* Animated hero icon */}
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                '0 0 30px rgba(16,185,129,0.1)',
                                                '0 0 60px rgba(16,185,129,0.15)',
                                                '0 0 30px rgba(16,185,129,0.1)',
                                            ],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mb-6"
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            <Droplets className="w-10 h-10 text-emerald-400" />
                                        </motion.div>
                                    </motion.div>

                                    <h3 className="text-lg font-bold text-white/85 mb-1.5">
                                        Hi, I'm WaterGrid AI
                                    </h3>
                                    <p className="text-[13px] text-white/30 mb-8 max-w-[280px] leading-relaxed">
                                        Your assistant for water issues, reporting, and platform navigation.
                                    </p>

                                    {/* Suggestions */}
                                    <div className="grid grid-cols-1 gap-2 w-full max-w-[330px]">
                                        {suggestions.map((s, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 + i * 0.08 }}
                                            >
                                                <SuggestionChip
                                                    text={s.text}
                                                    icon={s.icon}
                                                    onClick={() => handleSubmit(s.text)}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Messages */}
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} />
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2.5 mb-4"
                                >
                                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm">
                                        <TypingIndicator />
                                    </div>
                                </motion.div>
                            )}

                            {/* Quick actions after first exchange */}
                            {hasMessages && !isLoading && messages[messages.length - 1]?.role === 'assistant' && (
                                <QuickActions onSelect={handleSubmit} />
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to bottom */}
                        <AnimatePresence>
                            {showScrollBtn && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    onClick={() => scrollToBottom()}
                                    className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-lg hover:bg-white/20 transition-colors z-10"
                                >
                                    <ChevronDown className="w-4 h-4 text-white/70" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* ── Input Area ── */}
                        <div className="px-4 pb-4 pt-2">
                            <div className="flex items-end gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3 focus-within:border-emerald-500/40 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about water issues..."
                                    rows={1}
                                    className="flex-1 bg-transparent text-white/90 text-[13.5px] resize-none outline-none placeholder:text-white/20 max-h-[120px] leading-relaxed"
                                />
                                <motion.button
                                    onClick={() => handleSubmit()}
                                    disabled={isLoading || !input.trim()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-20"
                                    style={{
                                        background:
                                            input.trim() && !isLoading
                                                ? 'linear-gradient(135deg, #10b981, #14b8a6)'
                                                : 'transparent',
                                    }}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4 text-white" />
                                    )}
                                </motion.button>
                            </div>
                            <p className="text-center text-[10px] text-white/10 mt-2 font-medium">
                                Powered by Gemini AI • WaterGrid Platform
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
