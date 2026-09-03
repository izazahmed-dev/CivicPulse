'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number) => void;
}

// Custom hook to handle map clicks
function MapEventsHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Smooth fly-to when location changes externally
function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], map.getZoom() < 14 ? 16 : map.getZoom(), {
            duration: 1.2,
            easeLinearity: 0.4,
        });
    }, [lat, lng, map]);
    return null;
}

// Inject custom CSS for the map
function MapStyleInjector() {
    const map = useMap();
    useEffect(() => {
        const container = map.getContainer();
        // Remove default Leaflet styles on zoom control
        container.querySelectorAll('.leaflet-control-zoom a').forEach(el => {
            (el as HTMLElement).style.cssText = '';
        });
    }, [map]);
    return null;
}

// Custom Google-like marker using DivIcon
function createPulsingMarker() {
    return L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div style="position:relative;width:44px;height:44px;">
                <div style="
                    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                    width:44px; height:44px; border-radius:50%;
                    background:rgba(16,185,129,0.12);
                    animation: marker-pulse 2s ease-out infinite;
                "></div>
                <div style="
                    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                    width:28px; height:28px; border-radius:50%;
                    background:rgba(16,185,129,0.2);
                    animation: marker-pulse 2s ease-out infinite 0.4s;
                "></div>
                <div style="
                    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                    width:18px; height:18px; border-radius:50%;
                    background: linear-gradient(135deg, #10b981, #059669);
                    border: 3px solid white;
                    box-shadow: 0 2px 12px rgba(16,185,129,0.5), 0 0 0 1px rgba(0,0,0,0.1);
                "></div>
            </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
    });
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
    const [mounted, setMounted] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
    const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

    useEffect(() => {
        setMounted(true);
    }, []);

    const markerIcon = useMemo(() => createPulsingMarker(), []);

    const handleUseMyLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported on this device.');
            return;
        }

        setGeoLoading(true);
        setGeoError('');
        setGeoAccuracy(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGeoLoading(false);
                setGeoAccuracy(Math.round(pos.coords.accuracy));
                onChange(pos.coords.latitude, pos.coords.longitude);
            },
            (highAccErr) => {
                console.warn('[LocationPicker] High accuracy failed:', highAccErr.message);
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setGeoLoading(false);
                        setGeoAccuracy(Math.round(pos.coords.accuracy));
                        onChange(pos.coords.latitude, pos.coords.longitude);
                    },
                    (lowAccErr) => {
                        setGeoLoading(false);
                        if (lowAccErr.code === 1) {
                            setGeoError('Location access denied. Please enable permissions.');
                        } else if (lowAccErr.code === 2) {
                            setGeoError('Location unavailable. Check GPS settings.');
                        } else if (lowAccErr.code === 3) {
                            setGeoError('Location timed out. Try again.');
                        } else {
                            setGeoError(lowAccErr.message || 'Unable to get location.');
                        }
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, [onChange]);

    // Tile layer configs
    const tileConfigs = {
        streets: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        },
    };

    if (!mounted) return (
        <div className="w-full h-[380px] rounded-2xl bg-white/[0.03] flex flex-col items-center justify-center animate-pulse gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
            <span className="text-white/20 text-sm">Loading Map...</span>
        </div>
    );

    const activeTile = tileConfigs[mapStyle];

    return (
        <div className="space-y-0">
            {/* ── Inline CSS for marker animation + map overrides ── */}
            <style jsx global>{`
                @keyframes marker-pulse {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
                }
                .custom-map-marker {
                    background: transparent !important;
                    border: none !important;
                }
                .premium-map .leaflet-control-zoom {
                    border: none !important;
                    border-radius: 12px !important;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
                }
                .premium-map .leaflet-control-zoom a {
                    background: rgba(20,20,35,0.9) !important;
                    color: rgba(255,255,255,0.7) !important;
                    border: none !important;
                    border-bottom: 1px solid rgba(255,255,255,0.06) !important;
                    width: 36px !important;
                    height: 36px !important;
                    line-height: 36px !important;
                    font-size: 18px !important;
                    font-weight: 300 !important;
                    transition: all 0.15s ease;
                }
                .premium-map .leaflet-control-zoom a:hover {
                    background: rgba(30,30,50,0.95) !important;
                    color: rgba(16,185,129,0.9) !important;
                }
                .premium-map .leaflet-control-zoom a:last-child {
                    border-bottom: none !important;
                }
                .premium-map .leaflet-control-attribution {
                    background: rgba(10,10,20,0.7) !important;
                    color: rgba(255,255,255,0.2) !important;
                    font-size: 9px !important;
                    border-radius: 6px 0 0 0 !important;
                    padding: 2px 8px !important;
                }
                .premium-map .leaflet-control-attribution a {
                    color: rgba(16,185,129,0.4) !important;
                }
            `}</style>

            {/* ── Map Container ── */}
            <div className="relative group">
                {/* Top bar overlay */}
                <div className="absolute top-0 left-0 right-0 z-[500] flex items-center justify-between px-3 py-2.5 bg-gradient-to-b from-black/60 via-black/30 to-transparent rounded-t-2xl pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={geoLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.1] text-white/70 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/[0.08] transition-all text-xs font-medium shadow-lg"
                        >
                            {geoLoading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Locating...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                                    </svg>
                                    <span>My Location</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Style toggle */}
                    <div className="pointer-events-auto flex rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.1] overflow-hidden shadow-lg">
                        <button
                            type="button"
                            onClick={() => setMapStyle('streets')}
                            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                                mapStyle === 'streets'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            Map
                        </button>
                        <button
                            type="button"
                            onClick={() => setMapStyle('satellite')}
                            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                                mapStyle === 'satellite'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            Satellite
                        </button>
                    </div>
                </div>

                {/* Bottom coordinates bar */}
                <div className="absolute bottom-0 left-0 right-0 z-[500] flex items-center justify-between px-4 py-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-b-2xl pointer-events-none">
                    <div className="flex items-center gap-2">
                        {geoAccuracy !== null && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400/70 border border-emerald-500/15">
                                ±{geoAccuracy}m
                            </span>
                        )}
                        <span className="text-[10px] text-white/20 italic">
                            Tap to place pin
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/25 tabular-nums bg-black/30 px-2 py-0.5 rounded-md">
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                    </span>
                </div>

                {/* Error overlay */}
                {geoError && (
                    <div className="absolute top-14 left-3 right-3 z-[500] text-[11px] text-rose-300 px-3 py-2 rounded-xl bg-rose-500/10 backdrop-blur-md border border-rose-500/20 shadow-lg">
                        ⚠️ {geoError}
                    </div>
                )}

                {/* The map */}
                <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/30 relative z-0">
                    <MapContainer
                        center={[lat, lng]}
                        zoom={16}
                        scrollWheelZoom={true}
                        zoomControl={false}
                        className="w-full h-full premium-map"
                    >
                        <ZoomControl position="bottomleft" />
                        <TileLayer
                            attribution={activeTile.attribution}
                            url={activeTile.url}
                            maxZoom={19}
                        />
                        <Marker
                            position={[lat, lng]}
                            icon={markerIcon}
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    onChange(position.lat, position.lng);
                                }
                            }}
                        />
                        <MapEventsHandler onClick={onChange} />
                        <MapCenterUpdater lat={lat} lng={lng} />
                        <MapStyleInjector />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
