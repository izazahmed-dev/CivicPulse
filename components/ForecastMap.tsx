'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, ZoomControl, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export interface PredictionData {
    district: string;
    category: string;
    date: string;
    predicted_count: number;
    severity: number;
    coordinates: { lat: number; lng: number };
}

interface MapProps {
    predictions: PredictionData[];
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 10, { duration: 1.2, easeLinearity: 0.4 });
    }, [center, map]);
    return null;
}

export default function ForecastMap({ predictions }: MapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full h-[400px] rounded-2xl flex flex-col items-center justify-center bg-[#0a0f1a] gap-3 border border-white/[0.06]">
            <div className="w-10 h-10 rounded-full border-2 border-rose-500/30 border-t-rose-400 animate-spin" />
            <span className="text-white/20 text-sm font-mono tracking-widest">INITIALIZING PREDICTIVE ENGINE...</span>
        </div>
    );

    // Default center (Center of India to see all points, but we could make it dynamic based on the prediction list)
    const defaultCenter: [number, number] = [20.5937, 78.9629];

    return (
        <div className="w-full h-[500px] relative group rounded-2xl overflow-hidden shadow-2xl shadow-rose-900/10 border border-white/[0.08]">
            {/* Global Styles for Leaflet Overrides without affecting AuthorityMap */}
            <style jsx global>{`
                .forecast-map .leaflet-control-zoom {
                    border: none !important;
                    border-radius: 12px !important;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
                }
                .forecast-map .leaflet-control-zoom a {
                    background: rgba(3, 11, 26, 0.9) !important;
                    color: rgba(244, 63, 94, 0.6) !important;
                    border: 1px solid rgba(244, 63, 94, 0.1) !important;
                    border-bottom: none !important;
                    width: 36px !important;
                    height: 36px !important;
                    line-height: 36px !important;
                    font-size: 18px !important;
                    font-weight: 300 !important;
                    transition: all 0.2s ease;
                }
                .forecast-map .leaflet-control-zoom a:hover {
                    background: rgba(244, 63, 94, 0.1) !important;
                    color: rgba(244, 63, 94, 1) !important;
                }
                .forecast-map .leaflet-control-attribution {
                    display: none;
                }
                .forecast-map .leaflet-tooltip {
                    background: rgba(10, 15, 26, 0.95) !important;
                    border: 1px solid rgba(244, 63, 94, 0.3) !important;
                    border-radius: 8px;
                    color: white;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    font-family: inherit;
                }
                .forecast-map .leaflet-tooltip-top:before {
                    border-top-color: rgba(244, 63, 94, 0.5) !important;
                }
            `}</style>

            {/* AI HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[400] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,11,26,0.6)_100%)] mix-blend-multiply" />
            <div className="absolute inset-0 pointer-events-none z-[400] opacity-30 bg-[linear-gradient(rgba(244,63,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />

            <MapContainer
                center={defaultCenter}
                zoom={5}
                scrollWheelZoom={true}
                zoomControl={false}
                className="w-full h-full z-0 forecast-map"
                style={{ background: '#030b1a' }}
            >
                <ZoomControl position="bottomright" />

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    maxZoom={19}
                />

                {predictions.map((p, idx) => {
                    const coords: [number, number] = [p.coordinates.lat, p.coordinates.lng];

                    // Adjust radius by severity
                    // Base size 6 + scaled by severity (0-100) -> max additional + 14
                    const radius = 8 + (p.severity / 100) * 16;

                    return (
                        <CircleMarker
                            key={`${p.district}-${p.category}-${idx}`}
                            center={coords}
                            radius={radius}
                            stroke={true}
                            color="rgba(244, 63, 94, 0.8)" // Rose border
                            weight={2}
                            fillColor="#f43f5e" // Rose
                            fillOpacity={0.6 + (p.severity / 100) * 0.4}
                            className={p.severity > 50 ? 'animate-pulse cursor-pointer' : 'cursor-pointer'}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                <div className="p-1 min-w-[120px]">
                                    <div className="flex items-center justify-between mb-1 border-b border-rose-500/20 pb-1">
                                        <span className="font-bold text-sm tracking-wide text-rose-400">{p.district}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 rounded bg-rose-500/10 text-rose-400`}>
                                            Risk: {p.severity}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-2">
                                        <span className="text-white/40 uppercase tracking-wider">{p.category}</span>
                                        <span className="font-medium">+{p.predicted_count} Complaints</span>
                                    </div>
                                    <div className="text-[10px] text-white/30 text-right mt-1">{p.date}</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
