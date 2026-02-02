'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import FloatingTextLinks from '@/components/FloatingTextLinks';

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

      {/* Act 1: The Problem */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ amount: 0.5 }}
          className="max-w-2xl text-center bg-slate-950/40 p-10 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 tracking-tight">Water Scarcity is Silent</h2>
          <p className="text-lg md:text-2xl text-slate-200 font-light leading-relaxed">
            Every day, thousands of taps run dry. Without data, these problems remain <span className="font-semibold text-white">invisible</span>.
          </p>
        </motion.div>
      </section>

      {/* Act 2: Your Voice */}
      <section className="h-screen flex items-center justify-end p-6 md:pr-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ amount: 0.5 }}
          className="max-w-xl text-right bg-slate-950/40 p-10 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl ml-auto"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 tracking-tight">Your Voice is the Sensor</h2>
          <p className="text-lg md:text-xl text-slate-200 font-light leading-relaxed">
            We don't need expensive sensors. We need <span className="font-semibold text-white">you</span>. A single report puts a pin on the map.
          </p>
        </motion.div>
      </section>

      {/* Act 3: The Heatmap */}
      <section className="h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ amount: 0.5 }}
          className="max-w-3xl text-center bg-slate-950/50 p-12 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-2xl"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter">From Noise to Signal</h2>
          <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed mb-6">
            Individual complaints are isolated.
            <span className="block mt-4 font-bold text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-pink-500">Together, they form a Heatmap of Urgency.</span>
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono uppercase tracking-widest">
            Red zones trigger immediate response
          </div>
        </motion.div>
      </section>

      {/* Act 4: The Flow */}
      <section className="h-screen flex items-center justify-start p-6 md:pl-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ amount: 0.5 }}
          className="max-w-xl text-left bg-slate-950/40 p-10 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl mr-auto"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight">Action & Relief</h2>
          <p className="text-lg md:text-xl text-slate-200 font-light leading-relaxed">
            Resources are deployed efficiently. Water flows again. The map turns green.
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
          {/* <h1 className="text-5xl md:text-7xl font-black mb-12 tracking-tight text-white">
            Take Action Now
          </h1> */}

          <FloatingTextLinks />

          <p className="mt-24 text-sm text-slate-500 font-mono">
            System Status: ACTIVE • Data simulated for demonstration
          </p>
        </motion.div>
      </section>
    </div>
  );
}
