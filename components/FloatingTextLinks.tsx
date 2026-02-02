"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FloatingTextLinks() {
  return (
    <div className="flex flex-col items-center justify-center gap-12 w-full py-20 relative z-30">
      
      {/* Link 1: Report Issue */}
      <Link href="/report" className="group relative block text-center cursor-pointer">
        <motion.div
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] group-hover:text-blue-400 transition-colors duration-300">
            Report Water Issue
          </div>
          <div className="mt-2 text-blue-200/80 text-lg md:text-xl font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            Submit in 30s <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </Link>

      {/* Divider / Spacer - visually light */}
      <div className="w-16 h-[1px] bg-white/20"></div>

      {/* Link 2: Live Dashboard */}
      <Link href="/dashboard" className="group relative block text-center cursor-pointer">
        <motion.div
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] group-hover:text-amber-400 transition-colors duration-300">
            View Live Dashboard
          </div>
           <div className="mt-2 text-amber-200/80 text-lg md:text-xl font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            See the Heatmap <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </Link>

    </div>
  );
}
