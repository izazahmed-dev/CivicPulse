'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, ClipboardList, RefreshCw, ShieldCheck } from 'lucide-react';
import { CityGridMap } from '@/components/city-grid-map';
import { StatusPill } from '@/components/status-pill';
import { DEMO_AREAS } from '@/data/areas';
import { Incident, IncidentDetail, IncidentStatus, AreaSignal } from '@/lib/types';

const columns: IncidentStatus[] = ['new', 'triaged', 'in_progress', 'resolved', 'verified'];

const nextStatus: Partial<Record<IncidentStatus, IncidentStatus>> = {
  new: 'triaged',
  triaged: 'in_progress',
  in_progress: 'resolved',
  resolved: 'verified',
};

export function OpsDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [signals, setSignals] = useState<AreaSignal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<IncidentDetail | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [incidentsResponse, signalsResponse] = await Promise.all([
      fetch('/api/incidents'),
      fetch('/api/areas/signals'),
    ]);
    const [incidentsPayload, signalsPayload] = await Promise.all([incidentsResponse.json(), signalsResponse.json()]);
    setIncidents(incidentsPayload.incidents ?? []);
    setSignals(signalsPayload.signals ?? []);
    setLoading(false);
  }

  async function loadDetail(id: string) {
    const response = await fetch(`/api/incidents/${id}`);
    const payload = await response.json();
    setSelectedDetail(payload);
    setSelectedId(id);
  }

  async function moveForward(incident: Incident) {
    const status = nextStatus[incident.status];
    if (!status) return;

    await fetch(`/api/incidents/${incident.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        note: note || `Operator moved incident to ${status.replaceAll('_', ' ')}.`,
      }),
    });

    setNote('');
    await loadData();
    await loadDetail(incident.id);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const grouped = useMemo(() => {
    return columns.reduce<Record<IncidentStatus, Incident[]>>((acc, status) => {
      acc[status] = incidents.filter((incident) => incident.status === status);
      return acc;
    }, {
      new: [],
      triaged: [],
      in_progress: [],
      resolved: [],
      verified: [],
    });
  }, [incidents]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <CityGridMap areas={DEMO_AREAS} incidents={incidents} signals={signals} onSelectArea={(areaId) => {
          const areaIncident = incidents.find((incident) => incident.areaId === areaId);
          if (areaIncident) void loadDetail(areaIncident.id);
        }} />

        <div className="fb-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="fb-kicker">Signal Summary</p>
              <h2 className="fb-heading mt-2 text-2xl font-black text-white">Area risk ladder</h2>
            </div>
            <button type="button" onClick={() => void loadData()} className="fb-chip">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {signals.slice(0, 6).map((signal) => (
              <div key={signal.areaId} className="fb-panel-soft rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{signal.areaLabel}</p>
                    <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.14em] fb-risk-${signal.riskLevel}`}>
                      {signal.riskLevel} risk
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{signal.openCount}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">open incidents</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-4 xl:grid-cols-5">
          {columns.map((status) => (
            <div key={status} className="fb-panel rounded-[1.75rem] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">{status.replaceAll('_', ' ')}</p>
                <span className="fb-chip">{grouped[status].length}</span>
              </div>
              <div className="space-y-3">
                {grouped[status].map((incident) => (
                  <button
                    key={incident.id}
                    type="button"
                    onClick={() => void loadDetail(incident.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                      selectedId === incident.id
                        ? 'border-cyan-300/40 bg-cyan-300/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-bold text-white">{incident.areaLabel}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/35">{incident.subtype.replaceAll('_', ' ')}</p>
                    <p className="mt-3 text-xs text-white/55">{incident.description}</p>
                  </button>
                ))}
                {grouped[status].length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs uppercase tracking-[0.14em] text-white/25">
                    No incidents
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="fb-panel rounded-[2rem] p-6">
          {selectedDetail ? (
            <>
              <p className="fb-kicker">Operator Detail</p>
              <h2 className="fb-heading mt-2 text-2xl font-black text-white">{selectedDetail.incident.areaLabel}</h2>
              <p className="mt-3 text-white/60">{selectedDetail.incident.description}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <StatusPill status={selectedDetail.incident.status} />
                <div className="fb-chip">{selectedDetail.incident.category}</div>
                <div className="fb-chip">{selectedDetail.incident.severity}</div>
              </div>

              <textarea
                className="fb-textarea mt-5"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add operator note before moving the incident forward"
              />

              {nextStatus[selectedDetail.incident.status] && (
                <button
                  type="button"
                  onClick={() => void moveForward(selectedDetail.incident)}
                  className="fb-button fb-button-primary mt-5"
                >
                  Move to {nextStatus[selectedDetail.incident.status]?.replaceAll('_', ' ')}
                  <ArrowRight size={16} />
                </button>
              )}

              <div className="fb-divider my-6" />

              <div className="space-y-3 text-sm text-white/65">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-cyan-300" />
                  {selectedDetail.events.length} status events recorded
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-lime-300" />
                  {selectedDetail.proofs.length} proof submissions on file
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-amber-300" />
                  Incident ID: {selectedDetail.incident.id}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
              <ClipboardList size={36} className="text-white/20" />
              <p className="mt-4 text-lg font-bold text-white/60">Select an incident</p>
              <p className="mt-2 max-w-sm text-sm text-white/40">
                Open one incident from the board or map to show the operator flow during the demo.
              </p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fb-panel-soft rounded-2xl p-4 text-sm text-white/60">
          Loading operator data…
        </div>
      )}
    </div>
  );
}
