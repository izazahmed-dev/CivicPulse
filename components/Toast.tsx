'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: 'border-emerald-500/30', icon: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  error: { border: 'border-red-500/30', icon: 'text-red-400', bg: 'bg-red-500/10' },
  warning: { border: 'border-amber-500/30', icon: 'text-amber-400', bg: 'bg-amber-500/10' },
  info: { border: 'border-cyan-500/30', icon: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      <div className="fixed top-20 right-4 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type];
            const colors = COLORS[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#0a0a0a]/95 backdrop-blur-xl border ${colors.border} shadow-[0_20px_60px_rgba(0,0,0,0.5)]`}
              >
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={16} className={colors.icon} />
                </div>
                <p className="text-sm text-white/80 font-medium flex-1 leading-relaxed pt-1">
                  {t.message}
                </p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0 mt-1"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
