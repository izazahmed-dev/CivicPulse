'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', animate = true, delay = 0, onClick }: GlassCardProps) {
  const baseClasses = 'rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm shadow-xl shadow-black/20';

  if (!animate) {
    return (
      <div className={`${baseClasses} ${className}`} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`${baseClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
