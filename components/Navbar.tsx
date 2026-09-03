'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, FileText, BarChart3, Users,
  Menu, X, ChevronRight, ShieldAlert, Coins, ArrowRight, Zap
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const NAV_ITEMS = [
  { href: '/report', icon: FileText, labelKey: 'nav.report', override: 'Report' },
  { href: '/dashboard', icon: BarChart3, labelKey: 'nav.dashboard', override: 'Dashboard' },
  { href: '/community', icon: Users, labelKey: 'nav.community', override: 'Community' },
  { href: '/authority', icon: ShieldAlert, labelKey: 'nav.authority', override: 'Authority' },
  { href: '/bounties', icon: Coins, labelKey: 'nav.bounties', override: 'Bounties' },
];

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCtaVisible(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') return;
    const target = document.getElementById('cta-section');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname === '/login') return null;
  if (pathname === '/' && !ctaVisible) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.1 }}
        className={`
          fixed top-0 left-0 right-0 z-[9990] transition-all duration-500
          ${scrolled
            ? 'bg-[#050505]/90 backdrop-blur-2xl border-b border-white/[0.06]'
            : 'bg-transparent backdrop-blur-xl border-b border-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-[--accent] flex items-center justify-center"
            >
              <Zap size={16} className="text-black" />
            </motion.div>
            <span className="text-sm font-extrabold tracking-tight text-white">
              CIVIC<span className="text-[--accent]">PULSE</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.06] border border-white/[0.08]"
                      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-[--accent]' : 'text-white/40 hover:text-white/80'
                  }`}>
                    {t(item.labelKey) !== item.labelKey ? t(item.labelKey) : item.override}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/report"
              className="group flex items-center gap-2 px-5 py-2 rounded-full bg-[--accent] text-black text-xs font-extrabold uppercase tracking-wider hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] transition-all duration-300"
            >
              Report Issue
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9991] md:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#0a0a0a] border-l border-white/[0.06] z-[9992] md:hidden"
            >
              <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06]">
                <span className="text-xs font-extrabold tracking-tight text-white">
                  CIVIC<span className="text-[--accent]">PULSE</span>
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <div className="p-4 space-y-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                      pathname === '/'
                        ? 'bg-[--accent-dim] text-[--accent]'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <Home size={18} />
                    <span className="flex-1">{t('nav.home')}</span>
                    <ChevronRight size={14} className="text-white/15" />
                  </Link>
                </motion.div>

                {NAV_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (i + 1) * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                          isActive
                            ? 'bg-[--accent-dim] text-[--accent]'
                            : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="flex-1">{t(item.labelKey) !== item.labelKey ? t(item.labelKey) : item.override}</span>
                        <ChevronRight size={14} className="text-white/15" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.04]">
                <Link
                  href="/report"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[--accent] text-black text-xs font-extrabold uppercase tracking-wider"
                >
                  Report Issue
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}
