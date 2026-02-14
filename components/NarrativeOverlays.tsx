'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FeatureGrid from '@/components/FeatureGrid';
import UserNavBadge from '@/components/UserNavBadge';

export default function NarrativeOverlays() {
  return (
    <div className="relative z-10 w-full">
      {/* Top Nav */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <UserNavBadge />
        <button
          onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-5 py-2.5 text-xs font-bold tracking-widest text-emerald-400 border border-emerald-400/20 bg-slate-900/50 backdrop-blur-md rounded-full hover:bg-emerald-400/10 transition-all uppercase hover:scale-105"
        >
          Skip System Intro
        </button>
      </div>

      {/* Act 1: Hero - Floating Text */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 text-white tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            Water Complaint
            <br />
            Heatmap
          </h2>
          <p className="text-lg md:text-xl text-white/80 font-light tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Civic Technology for Tamil Nadu
          </p>
        </motion.div>
      </section>

      {/* Act 2: The Problem - Floating Text */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
          className="text-center max-w-4xl"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            Water Scarcity is Silent
          </h2>
          <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Every day, thousands of taps run dry.
            <br />
            Without data, these problems remain <span className="font-semibold text-white">invisible</span>.
          </p>
        </motion.div>
      </section>

      {/* Act 3: Your Voice - Floating Text */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
          className="text-center max-w-4xl"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            Your Voice is the Sensor
          </h2>
          <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            We don&apos;t need expensive sensors. We need <span className="font-semibold text-white">you</span>.
            <br />
            A single report puts a pin on the map.
          </p>
        </motion.div>
      </section>

      {/* Act 4: The Heatmap - Floating Text */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
          className="text-center max-w-4xl"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            From Noise to Signal
          </h2>
          <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Individual complaints are isolated.
          </p>
          <p className="text-xl md:text-3xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            Together, they form a Heatmap of Urgency.
          </p>
        </motion.div>
      </section>

      {/* Act 5: Action - Floating Text */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ amount: 0.5 }}
          className="text-center max-w-4xl"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 text-white tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            Action &amp; Relief
          </h2>
          <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Resources are deployed efficiently.
            <br />
            Water flows again. The map turns green.
          </p>
        </motion.div>
      </section>

      {/* ====== Act 6: CTAs — Redesigned ====== */}
      <section id="cta-section" className="relative min-h-screen py-32 px-6 overflow-hidden bg-[#030b1a] z-20">
        {/* Floating background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="animate-orb-1 absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
          />
          <div
            className="animate-orb-2 absolute bottom-[15%] right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
          />
          <div
            className="animate-orb-1 absolute top-[50%] left-[60%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
          />
        </div>

        {/* Gradient top edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative z-10"
        >
          <p className="text-sm font-semibold tracking-[0.3em] uppercase text-blue-400/70 mb-4">
            Your Civic Toolkit
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span
              className="animate-gradient-text inline-block"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #60a5fa, #a78bfa, #06b6d4, #34d399, #60a5fa)',
              }}
            >
              Take Action
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
            Every tool you need to report, scan, track, and solve water problems in your community.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="relative z-10">
          <FeatureGrid />
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="relative z-10 mt-32 pt-12 border-t border-white/[0.06]"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-black text-sm">W</span>
              </div>
              <span className="text-white/80 font-bold tracking-tight text-lg">
                WaterGrid
              </span>
            </div>

            <p className="text-sm text-white/25 font-mono text-center">
              System Status: <span className="text-emerald-500/60">ACTIVE</span> • Civic Intelligence Platform • Tamil Nadu
            </p>

            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Dashboard
              </Link>
              <Link href="/report" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Report
              </Link>
              <Link href="/community" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Community
              </Link>
            </div>
          </div>
        </motion.footer>
      </section>
    </div>
  );
}
