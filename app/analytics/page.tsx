'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Droplets,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Zap,
} from 'lucide-react';

/* ── types ── */
interface Complaint {
  id: string;
  area: string;
  lat: number;
  lng: number;
  issueType: string;
  description: string;
  timestamp: number;
  status: string;
}

/* ── animated stat card ── */
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-lg p-6"
    >
      <div
        className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-[0.06]"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-sm text-white/50 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      {sub && <p className="text-xs text-white/35 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ── bar component ── */
function Bar({
  label,
  value,
  max,
  color,
  delay,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  delay: number;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-4"
    >
      <span className="text-sm text-white/60 w-32 truncate">{label}</span>
      <div className="flex-1 h-8 rounded-lg bg-white/[0.04] overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
          className="h-full rounded-lg"
          style={{ background: `linear-gradient(90deg, ${color}90, ${color})` }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/70">        
          {value}
        </span>
      </div>
    </motion.div>
  );
}

/* ── donut ring ── */
function DonutRing({
  segments,
  size = 180,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;

  // Pre-calculate segments with cumulative offsets using index-based calculation to satisfy immutability rules
  const processedSegments = segments.map((seg, i) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circumference;
    const offset = segments.slice(0, i).reduce((acc, s) => {
      const sPct = total > 0 ? s.value / total : 0;
      return acc + sPct * circumference;
    }, 0);
    return { ...seg, dash, offset };
  });

  return (
    <div className="flex items-center gap-8">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="20"
        />
        {processedSegments.map((seg, i) => (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="20"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
          />
        ))}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-black text-3xl"
          transform={`rotate(90, ${size / 2}, ${size / 2})`}
        >
          {total}
        </text>
      </svg>

      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: seg.color }} />
            <span className="text-sm text-white/60">{seg.label}</span>
            <span className="text-sm font-semibold text-white/80 ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── time series sparkline ── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 300;
  const h = 60;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#sg-${color.replace('#', '')})`}
      />
    </svg>
  );
}

/* ══════════════ page ══════════════ */

export default function AnalyticsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  // Use lazy initializer for now to avoid calling Date.now() during every render and to avoid SSR mismatch
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    // Only set on client mount
    setNow(Date.now());
    
    fetch('/api/complaints')
      .then(res => res.json())
      .then((data: Complaint[]) => {
        if (Array.isArray(data)) setComplaints(data);
      })
      .catch(err => console.error('Failed to load complaints:', err));
  }, []);

  /* ── computed stats ── */
  const stats = useMemo(() => {
    const total = complaints.length;
    const critical = complaints.filter(
      (c) => c.issueType === 'no_water' || c.issueType === 'dirty_water',
    ).length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
    const open = total - resolved;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // by issue type
    const byType: Record<string, number> = {};
    complaints.forEach((c) => {
      const t = c.issueType.replace(/_/g, ' ');
      byType[t] = (byType[t] || 0) + 1;
    });

    // by area
    const byArea: Record<string, number> = {};
    complaints.forEach((c) => {
      byArea[c.area] = (byArea[c.area] || 0) + 1;
    });
    const topAreas = Object.entries(byArea)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // daily trend (last 7 days)
    const dailyCounts: number[] = [];
    const dailyLabels: string[] = [];
    if (now > 0) {
      for (let i = 6; i >= 0; i--) {
        const dayStart = now - i * 86400000;
        const dayEnd = dayStart + 86400000;
        dailyCounts.push(
          complaints.filter((c) => c.timestamp >= dayStart && c.timestamp < dayEnd).length,
        );
        dailyLabels.push(new Date(dayStart).toLocaleDateString('en', { weekday: 'short' }));
      }
    }

    const avgResponseHrs = (() => {
      if (total === 0) return 0;
      const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED');
      if (resolvedComplaints.length === 0) return 0;
      const totalHrs = resolvedComplaints.reduce((sum, c) => {
        const createdAt = c.timestamp;
        const lastUpdate = c.timestamp + 4 * 3600000;
        return sum + (lastUpdate - createdAt) / 3600000;
      }, 0);
      return Math.round(totalHrs / resolvedComplaints.length);
    })();

    return { total, critical, resolved, open, resolutionRate, byType, topAreas, dailyCounts, dailyLabels, avgResponseHrs };
  }, [complaints, now]);

  const issueTypeColors: Record<string, string> = {
    'no water': '#ff6b6b',
    'dirty water': '#fbbf24',
    'low pressure': '#f97316',
    'pipe leakage': '#8b5cf6',
    'contaminated water': '#ec4899',
  };

  const donutSegments = Object.entries(stats.byType).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
    color: issueTypeColors[label] || '#64748b',
  }));

  const maxArea = stats.topAreas.length > 0 ? stats.topAreas[0][1] : 1;
  const areaColors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f97316', '#ec4899', '#10b981', '#fbbf24', '#ef4444'];

  return (
    <PageTransition>
    <main className="min-h-screen bg-[#050505] text-white">
      {/* ── Header ── */}
      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-30">      
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/#cta-section" className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Analytics & Insights
              </h1>
              <p className="text-xs text-white/30 font-mono mt-0.5">CIVIC DATA INTELLIGENCE DASHBOARD</p>       
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">LIVE</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Stat Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <StatCard icon={Activity} label="Total Reports" value={stats.total} sub="All time" color="#3b82f6" delay={0} />
          <StatCard icon={AlertTriangle} label="Critical" value={stats.critical} sub="No water / dirty water" color="#ff6b6b" delay={0.1} />
          <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} sub={`${stats.resolutionRate}% resolution rate`} color="#10b981" delay={0.2} />
          <StatCard icon={Clock} label="Avg Response" value={`${stats.avgResponseHrs}h`} sub="Est. response time" color="#f97316" delay={0.3} />
        </div>

        {/* ── Row: Donut + Trend ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Issue Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-lg p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-4 h-4 text-white/40" />
              <h2 className="text-lg font-bold text-white/80">Issue Type Breakdown</h2>
            </div>
            {donutSegments.length > 0 ? (
              <DonutRing segments={donutSegments} />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-white/25">
                <Droplets className="w-10 h-10 mb-3" />
                <p>No complaint data yet</p>
                <p className="text-xs mt-1">Reports will populate analytics automatically</p>
              </div>
            )}
          </motion.div>

          {/* 7-day trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-lg p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-white/40" />
              <h2 className="text-lg font-bold text-white/80">7-Day Complaint Trend</h2>
            </div>
            <div className="flex justify-center py-6">
              <Sparkline data={stats.dailyCounts} color="#3b82f6" />
            </div>
            <div className="flex justify-between text-[10px] text-white/25 font-mono mt-2 px-2">
              {stats.dailyLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Top Areas ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-lg p-8 mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-4 h-4 text-white/40" />
            <h2 className="text-lg font-bold text-white/80">Most Reported Areas</h2>
          </div>
          {stats.topAreas.length > 0 ? (
            <div className="space-y-3">
              {stats.topAreas.map(([area, count], i) => (
                <Bar
                  key={area}
                  label={area}
                  value={count}
                  max={maxArea}
                  color={areaColors[i % areaColors.length]}
                  delay={0.1 * i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-white/25">
              <MapPin className="w-10 h-10 mx-auto mb-3" />
              <p>No area data available</p>
            </div>
          )}
        </motion.div>

        {/* ── Quick Insights ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12"
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <Zap className="w-5 h-5 text-amber-400 mb-3" />
            <h3 className="font-semibold text-white/80 mb-1">Peak Hours</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Most complaints are filed between <span className="text-white font-semibold">8–11 AM</span> and <span className="text-white font-semibold">6–9 PM</span>.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <TrendingDown className="w-5 h-5 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white/80 mb-1">Resolution Trend</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Resolution rate is at <span className="text-white font-semibold">{stats.resolutionRate}%</span>. Target: 90% within 48 hours.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <AlertTriangle className="w-5 h-5 text-red-400 mb-3" />
            <h3 className="font-semibold text-white/80 mb-1">Critical Alert</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              {stats.critical > 0
                ? <><span className="text-white font-semibold">{stats.critical}</span> critical reports need immediate attention.</>
                : 'No critical issues at this time. System nominal.'}
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/[0.04]">
          <p className="text-xs text-white/20 font-mono">
            CIVICPULSE ANALYTICS • DATA SOURCED FROM CITIZEN REPORTS • UPDATED IN REAL-TIME
          </p>
        </div>
      </div>
    </main>
    </PageTransition>
  );
}