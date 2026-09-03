'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Incident {
    id: string;
    title: string;
    category: string;
    area: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
    aiConfidence: number;
    timeReported: string;
    aiDiagnosis: string;
}

interface MapProps {
    incidents: Incident[];
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 12, { duration: 1.2, easeLinearity: 0.4 });
    }, [center, map]);
    return null;
}

function getPriorityColor(priority: string): { fill: string; glow: string } {
    if (priority === 'CRITICAL') return { fill: '#f43f5e', glow: 'rgba(244,63,94,0.4)' }; // Rose
    if (priority === 'HIGH') return { fill: '#f59e0b', glow: 'rgba(245,158,11,0.4)' }; // Amber
    if (priority === 'MEDIUM') return { fill: '#3b82f6', glow: 'rgba(59,130,246,0.4)' }; // Blue
    return { fill: '#10b981', glow: 'rgba(16,185,129,0.4)' }; // Emerald
}

// Map real areas from the mock data to coordinates in Chennai temporarily
const AREA_COORDS: Record<string, [number, number]> = {
    'Adyar, Zone 13': [13.0012, 80.2565],
    'T. Nagar, Zone 10': [13.0418, 80.2341],
    'Velachery, Zone 13': [12.9815, 80.2180],
    'Anna Nagar, Zone 8': [13.0850, 80.2101],
    'Besant Nagar, Zone 13': [13.0003, 80.2666],
};

export default function AuthorityMap({ incidents }: MapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1a] gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            <span className="text-white/20 text-sm font-mono tracking-widest">INITIALIZING SATELLITE UPLINK...</span>
        </div>
    );

    const defaultCenter: [number, number] = [13.04, 80.24]; // Center of Chennai roughly

    return (
        <div className="w-full h-full relative group">
            <style jsx global>{`
        .authority-map .leaflet-control-zoom {
          border: none !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
        }
        .authority-map .leaflet-control-zoom a {
          background: rgba(3, 11, 26, 0.9) !important;
          color: rgba(16, 185, 129, 0.6) !important;
          border: 1px solid rgba(16, 185, 129, 0.1) !important;
          border-bottom: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          font-weight: 300 !important;
          transition: all 0.2s ease;
        }
        .authority-map .leaflet-control-zoom a:hover {
          background: rgba(16, 185, 129, 0.1) !important;
          color: rgba(16, 185, 129, 1) !important;
        }
        .authority-map .leaflet-control-attribution {
          display: none;
        }
        .pulse-marker {
          background: transparent;
          border: none;
        }
        .pulse-ring {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .pulse-ring::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background-color: var(--marker-color);
          border-radius: 50%;
          z-index: 10;
          box-shadow: 0 0 10px var(--marker-color);
        }
        .pulse-ring::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background-color: var(--marker-color);
          border-radius: 50%;
          z-index: 1;
          opacity: 0.3;
          animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>

            {/* Map Scanning Overlay (Cyberpunk Radar Effect) */}
            <div className="absolute inset-0 pointer-events-none z-[400] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,11,26,0.6)_100%)] mix-blend-multiply" />
            <div className="absolute inset-0 pointer-events-none z-[400] opacity-10 bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                zoomControl={false}
                className="w-full h-full z-0 authority-map"
                style={{ height: '100%', width: '100%', background: '#030b1a' }}
            >
                <ZoomControl position="bottomright" />

                {/* CartoDB Dark Matter tile layer for that deep dark UI look */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    maxZoom={19}
                />

                {incidents.filter(inc => AREA_COORDS[inc.area]).map(inc => {
                    const coords = AREA_COORDS[inc.area];
                    const color = getPriorityColor(inc.priority).fill;

                    return (
                        <CircleMarker
                            key={inc.id}
                            center={coords}
                            radius={inc.priority === 'CRITICAL' ? 12 : 8}
                            stroke={true}
                            color={color}
                            weight={2}
                            fillColor={color}
                            fillOpacity={0.4}
                            className={inc.priority === 'CRITICAL' ? 'animate-pulse' : ''}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
