'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FeatureGrid from '@/components/FeatureGrid';
import UserNavBadge from '@/components/UserNavBadge';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ArrowDown, Zap } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function NarrativeOverlays() {
  const { t } = useLanguage();
  const heatmapDesc = t('hero.heatmap_desc');
  const [heatmapPart1, heatmapPart2] = heatmapDesc.split(/(?<=[.|।])\s+/) || [heatmapDesc, ''];

  return (
    <div className="relative z-10 w-full">
      {/* Top Nav */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <UserNavBadge />
        <button
          onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="group px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase text-white/50 border border-white/10 bg-black/50 backdrop-blur-md rounded-full hover:border-[--accent]/40 hover:text-[--accent] transition-all duration-300"
        >
          Skip Intro
          <ArrowDown size={12} className="inline ml-2 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Act 1: Hero */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.5 }}
          className="text-center max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ amount: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[--accent]/20 bg-[--accent-dim] mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[--accent] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[--accent]">
              Civic Intelligence Platform
            </span>
          </motion.div>

          <h1 className="heading-xl text-white mb-6 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/50 font-light tracking-wide max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ amount: 0.5 }}
            className="mt-12 animate-float"
          >
            <ArrowDown size={20} className="mx-auto text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* Act 2: The Problem */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.5 }}
          className="max-w-4xl"
        >
          <p className="label-caps text-[--accent]/60 mb-4 tracking-[0.3em]">The Problem</p>
          <h2 className="heading-lg text-white mb-8">
            {t('hero.problem_title')}
          </h2>
          <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
            {t('hero.problem_desc')}
          </p>
          <div className="divider-glow mt-12 w-24" />
        </motion.div>
      </section>

      {/* Act 3: Your Voice */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.5 }}
          className="max-w-4xl text-right"
        >
          <p className="label-caps text-[--accent]/60 mb-4 tracking-[0.3em]">Your Voice</p>
          <h2 className="heading-lg text-white mb-8">
            {t('hero.voice_title')}
          </h2>
          <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
            {t('hero.voice_desc')}
          </p>
          <div className="divider-glow mt-12 w-24 ml-auto" />
        </motion.div>
      </section>

      {/* Act 4: The Heatmap */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.5 }}
          className="text-center max-w-4xl"
        >
          <p className="label-caps text-[--accent]/60 mb-4 tracking-[0.3em]">Real-Time Intelligence</p>
          <h2 className="heading-lg text-white mb-8">
            {t('hero.heatmap_title')}
          </h2>
          <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed mb-6">
            {heatmapPart1}
          </p>
          {heatmapPart2 && (
            <p className="text-xl md:text-2xl font-bold text-white">
              {heatmapPart2}
            </p>
          )}
        </motion.div>
      </section>

      {/* Act 5: Action */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.5 }}
          className="text-center max-w-4xl"
        >
          <p className="label-caps text-[--accent]/60 mb-4 tracking-[0.3em]">Take Action</p>
          <h2 className="heading-lg text-white mb-8">
            {t('hero.action_relief')}
          </h2>
          <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed mb-10">
            {t('hero.action_desc')}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ amount: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <Link href="/report" className="btn-accent">
              Report Now <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" className="btn-outline">
              View Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== Act 6: CTAs & Features ====== */}
      <section id="cta-section" className="relative min-h-screen py-32 px-6 overflow-hidden bg-[#050505] z-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="animate-orb-1 absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }}
          />
          <div
            className="animate-orb-2 absolute bottom-[15%] right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.02]"
            style={{ background: 'radial-gradient(circle, var(--cyan), transparent 70%)' }}
          />
        </div>

        <div className="divider-glow absolute top-0 left-0 right-0" />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative z-10"
        >
          <p className="label-caps text-[--accent]/60 mb-6 tracking-[0.3em]">
            {t('cta.core_actions')}
          </p>
          <h1 className="heading-xl">
            <span
              className="animate-gradient-text inline-block"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--accent), #00d4ff, var(--accent), #00ff87)',
              }}
            >
              Take Action
            </span>
          </h1>
          <p className="mt-6 text-base text-white/30 max-w-lg mx-auto leading-relaxed">
            Every tool you need to report, track, and solve civic problems in your community.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="relative z-10">
          <FeatureGrid />
        </div>

        {/* Marquee Banner */}
        <div className="relative z-10 mt-32 overflow-hidden py-6 border-y border-white/[0.04]">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/10 flex items-center gap-8">
                <span>Report</span>
                <span className="text-[--accent]/20">•</span>
                <span>Dashboard</span>
                <span className="text-[--accent]/20">•</span>
                <span>Community</span>
                <span className="text-[--accent]/20">•</span>
                <span>AI Powered</span>
                <span className="text-[--accent]/20">•</span>
                <span>Forecast</span>
                <span className="text-[--accent]/20">•</span>
                <span>Bounties</span>
                <span className="text-[--accent]/20">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="relative z-10 mt-16 pt-12"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[--accent] flex items-center justify-center">
                <Zap size={14} className="text-black" />
              </div>
              <span className="text-white/80 font-extrabold tracking-tight text-sm uppercase">
                CivicPulse
              </span>
            </div>

            <p className="text-[10px] text-white/20 font-mono text-center tracking-wider">
              Status: <span className="text-[--accent]/60">ONLINE</span> • Civic Intelligence Platform
            </p>

            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-[10px] text-white/25 hover:text-[--accent] transition-colors uppercase tracking-wider font-semibold">
                Dashboard
              </Link>
              <Link href="/report" className="text-[10px] text-white/25 hover:text-[--accent] transition-colors uppercase tracking-wider font-semibold">
                Report
              </Link>
              <Link href="/community" className="text-[10px] text-white/25 hover:text-[--accent] transition-colors uppercase tracking-wider font-semibold">
                Community
              </Link>
            </div>
          </div>
        </motion.footer>
      </section>
    </div>
  );
}
