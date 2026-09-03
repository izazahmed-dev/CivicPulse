'use client';

import React from 'react';
import { DemoArea } from '@/data/areas';
import { AreaSignal, Incident } from '@/lib/types';

interface CityGridMapProps {
  areas: DemoArea[];
  incidents?: Incident[];
  signals?: AreaSignal[];
  selectedAreaId?: string;
  onSelectArea?: (areaId: string) => void;
}

function markerTone(signal?: AreaSignal) {
  if (!signal) return 'bg-white/50';
  if (signal.riskLevel === 'critical') return 'bg-rose-400';
  if (signal.riskLevel === 'elevated') return 'bg-amber-400';
  if (signal.riskLevel === 'watch') return 'bg-cyan-400';
  return 'bg-emerald-400';
}

export function CityGridMap({ areas, incidents = [], signals = [], selectedAreaId, onSelectArea }: CityGridMapProps) {
  return (
    <div className="fb-panel relative overflow-hidden rounded-[1.75rem] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="fb-kicker">Hotspot Grid</p>
          <h3 className="fb-heading mt-2 text-2xl font-black text-white">Demo service map</h3>
        </div>
        <div className="fb-chip">{incidents.length} incidents plotted</div>
      </div>

      <div className="relative aspect-[4/3] rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,36,0.9),rgba(15,30,50,0.95))] p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,231,255,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:48px_48px]" />

        {areas.map((area) => {
          const signal = signals.find((entry) => entry.areaId === area.id);
          const count = incidents.filter((incident) => incident.areaId === area.id).length;
          const selected = selectedAreaId === area.id;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelectArea?.(area.id)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 text-left"
              style={{ left: `${area.x}%`, top: `${area.y}%` }}
            >
              <div className={`absolute inset-0 rounded-full blur-xl ${markerTone(signal)} opacity-40`} />
              <div className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#08121f] ${markerTone(signal)} ${selected ? 'scale-125' : ''}`}>
                <span className="text-[9px] font-black text-[#08121f]">{count || ''}</span>
              </div>
              <div className={`mt-2 min-w-[110px] rounded-xl border border-white/10 bg-[rgba(8,18,31,0.88)] px-3 py-2 shadow-lg transition-all ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <p className="text-xs font-bold text-white">{area.label}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">{signal?.riskLevel ?? 'stable'} risk</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

