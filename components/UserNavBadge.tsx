'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserNavBadge() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-xs font-bold tracking-wider text-white bg-gradient-to-r from-[#06d6a0]/20 to-[#3b82f6]/20 border border-[#06d6a0]/30 rounded-full backdrop-blur-md hover:from-[#06d6a0]/30 hover:to-[#3b82f6]/30 transition-all"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/50 hover:border-slate-600 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#06d6a0] to-[#3b82f6] flex items-center justify-center text-[10px] font-bold text-white">
          {user.avatar}
        </div>
        <span className="text-xs font-medium text-white hidden sm:inline">{user.name.split(' ')[0]}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-52 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">+91 {user.phone}</p>
            </div>
            <Link
              href="/community"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <User size={14} /> My Posts
            </Link>
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
