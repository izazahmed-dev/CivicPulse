'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

interface MapProps {
  complaints: Complaint[];
  selectedArea: string | null;
  onSelectArea: (area: string) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.2, easeLinearity: 0.4 });
  }, [center, map]);
  return null;
}

// Severity color scheme
function getSeverityColor(issueType: string, status: string): { fill: string; glow: string } {
  if (status === 'RESOLVED') return { fill: '#10b981', glow: 'rgba(16,185,129,0.3)' };
  if (issueType === 'no_water' || issueType === 'dirty_water') return { fill: '#ef4444', glow: 'rgba(239,68,68,0.3)' };
  if (issueType === 'low_pressure') return { fill: '#f59e0b', glow: 'rgba(245,158,11,0.3)' };
  if (issueType === 'leakage') return { fill: '#3b82f6', glow: 'rgba(59,130,246,0.3)' };
  return { fill: '#f59e0b', glow: 'rgba(245,158,11,0.3)' };
}

export default function DashboardMap({ complaints, selectedArea, onSelectArea }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1a] gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
      <span className="text-white/20 text-sm">Initializing Geospatial Engine...</span>
    </div>
  );

  const defaultCenter: [number, number] = [13.0827, 80.2707];
  let center = defaultCenter;

  if (selectedArea) {
    const areaComplaint = complaints.find(c => c.area === selectedArea);
    if (areaComplaint) {
      center = [areaComplaint.lat, areaComplaint.lng];
    }
  }

  const tileConfigs = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    },
  };

  const activeTile = tileConfigs[mapStyle];

  return (
    <div className="w-full h-full relative">
      {/* CSS for premium map controls */}
      <style jsx global>{`
        .dashboard-map .leaflet-control-zoom {
          border: none !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }
        .dashboard-map .leaflet-control-zoom a {
          background: rgba(15,23,42,0.9) !important;
          color: rgba(255,255,255,0.6) !important;
          border: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          font-weight: 300 !important;
          transition: all 0.15s ease;
        }
        .dashboard-map .leaflet-control-zoom a:hover {
          background: rgba(20,30,50,0.95) !important;
          color: rgba(34,211,238,0.9) !important;
        }
        .dashboard-map .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
        .dashboard-map .leaflet-control-attribution {
          background: rgba(10,10,20,0.7) !important;
          color: rgba(255,255,255,0.15) !important;
          font-size: 9px !important;
          border-radius: 6px 0 0 0 !important;
          padding: 2px 8px !important;
        }
        .dashboard-map .leaflet-control-attribution a {
          color: rgba(34,211,238,0.3) !important;
        }
        .dashboard-map .leaflet-popup-content-wrapper {
          background: rgba(15,23,42,0.95) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          backdrop-filter: blur(12px);
        }
        .dashboard-map .leaflet-popup-tip {
          background: rgba(15,23,42,0.95) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .dashboard-map .leaflet-popup-close-button {
          color: rgba(255,255,255,0.3) !important;
          font-size: 18px !important;
        }
        .dashboard-map .leaflet-popup-close-button:hover {
          color: rgba(255,255,255,0.6) !important;
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* Map/Satellite toggle */}
      <div className="absolute top-4 right-4 z-[500] flex rounded-xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setMapStyle('dark')}
          className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all ${
            mapStyle === 'dark'
              ? 'bg-cyan-500/15 text-cyan-400'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('satellite')}
          className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all ${
            mapStyle === 'satellite'
              ? 'bg-cyan-500/15 text-cyan-400'
              : 'text-white/35 hover:text-white/60'
          }`}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0 dashboard-map"
        style={{ height: '100%', width: '100%', background: '#0a0f1a' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution={activeTile.attribution}
          url={activeTile.url}
          maxZoom={19}
        />

        {/* Heat radius circles */}
        {complaints.map((c) => {
          const severity = getSeverityColor(c.issueType, c.status);
          return (
            <CircleMarker
              key={`heat-${c.id}`}
              center={[c.lat, c.lng]}
              radius={35}
              pathOptions={{
                color: 'transparent',
                fillColor: severity.fill,
                fillOpacity: 0.08,
              }}
              eventHandlers={{
                click: () => onSelectArea(c.area)
              }}
            />
          );
        })}

        {/* Precise clickable points */}
        {complaints.map((c) => {
          const severity = getSeverityColor(c.issueType, c.status);
          return (
            <CircleMarker
              key={`point-${c.id}`}
              center={[c.lat, c.lng]}
              radius={7}
              pathOptions={{
                color: severity.fill,
                weight: 2,
                fillColor: severity.fill,
                fillOpacity: 0.9,
                opacity: 0.7,
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: severity.fill }} />
                    <h3 className="font-bold text-cyan-400 text-sm">{c.area}</h3>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: severity.fill + '33' }}>
                        {c.issueType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{c.description || 'No description provided'}</p>
                    <div className="flex justify-between items-center pt-1 border-t border-white/[0.04]">
                      <span className="text-[10px] font-mono text-white/20">{c.id.slice(0, 12)}...</span>
                      <span className="text-[10px] text-white/25">{new Date(c.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        <MapUpdater center={center} />
      </MapContainer>
    </div>
  );
}
