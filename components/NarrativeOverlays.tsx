'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FeatureGrid from '@/components/FeatureGrid';
import ActionCards from '@/components/ActionCards';

export default function NarrativeOverlays() {
  return (
    <div className="relative z-10 w-full">
      {/* Skip Link (Persistent) */}
      <Link
        href="/dashboard"
        className="fixed top-6 right-6 z-50 px-5 py-2.5 text-xs font-bold tracking-widest text-emerald-400 border border-emerald-400/20 bg-slate-900/50 backdrop-blur-md rounded-full hover:bg-emerald-400/10 transition-all uppercase hover:scale-105"
      >
        Skip System Intro
      </Link>

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
            We don't need expensive sensors. We need <span className="font-semibold text-white">you</span>.
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
            Action & Relief
          </h2>
          <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Resources are deployed efficiently.
            <br />
            Water flows again. The map turns green.
          </p>
        </motion.div>
      </section>

      {/* Act 5: CTAs */}
      {/* Added z-20 and bg-slate-900 to ensure it sits on top of canvas and hides it if needed, or blends better */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 relative z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center w-full max-w-4xl relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tight text-white">
            Take Action Now
          </h1>

          {/* Replaced old cards with new FeatureGrid and ActionCards */}
          <div className="flex flex-col gap-16 w-full items-center">

            <div className="w-full">
              <FeatureGrid />
            </div>

            <div className="w-full flex justify-center">
              <ActionCards />
            </div>

          </div>

          <p className="mt-12 text-sm text-slate-500 font-mono">
            System Status: ACTIVE • Data simulated for demonstration
          </p>
        </motion.div>
      </section>
    </div>
  );
}
