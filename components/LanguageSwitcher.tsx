'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X } from 'lucide-react';
import { useLanguage, LANGUAGES } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div ref={panelRef} className="fixed bottom-8 right-[112px] z-[9999]">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300
          ${isOpen
            ? 'bg-white/10 backdrop-blur-xl border border-white/20'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400/30 shadow-indigo-500/30'
          }
        `}
        title="Change Language"
      >
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <div className="flex flex-col items-center">
            <Globe size={18} className="text-white" />
            <span className="text-[8px] text-white/70 font-bold mt-0.5">{language.toUpperCase()}</span>
          </div>
        )}
      </motion.button>

      {/* Language Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-[72px] right-0 w-72 max-h-[60vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0c1628]/95 backdrop-blur-2xl shadow-2xl shadow-black/50"
          >
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white/80">🌐 Choose Language</h3>
              <p className="text-[10px] text-white/30 mt-0.5">भाषा चुनें • மொழியைத் தேர்ந்தெடுக்கவும்</p>
            </div>

            <div className="p-2">
              {LANGUAGES.map((lang) => {
                const isActive = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                      ${isActive
                        ? 'bg-indigo-500/20 border border-indigo-500/30 text-white'
                        : 'hover:bg-white/[0.04] text-white/60 hover:text-white border border-transparent'
                      }
                    `}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{lang.nativeName}</div>
                      <div className="text-[10px] text-white/30">{lang.name}</div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-indigo-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
