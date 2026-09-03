'use client';

import React from 'react';

interface StepIndicatorProps {
  step: number;
  label: string;
  color?: string;
}

export default function StepIndicator({ step, label, color = 'emerald' }: StepIndicatorProps) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  };

  const colors = colorMap[color] || colorMap.emerald;

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-6 h-6 rounded-full ${colors.bg} ${colors.text} text-xs font-bold flex items-center justify-center`}>
        {step}
      </div>
      <h2 className="text-sm font-semibold text-white/70">{label}</h2>
    </div>
  );
}
