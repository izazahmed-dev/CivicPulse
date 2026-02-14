'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

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

// Component to handle map view updates when external lat/lng changes
function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom() < 14 ? 15 : map.getZoom());
    }, [lat, lng, map]);
    return null;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
    const [mounted, setMounted] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const markerIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    }), []);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported on this device.');
            return;
        }

        setGeoLoading(true);
        setGeoError('');
        setGeoAccuracy(null);

        // First try: High accuracy (GPS)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGeoLoading(false);
                setGeoAccuracy(Math.round(pos.coords.accuracy));
                onChange(pos.coords.latitude, pos.coords.longitude);
            },
            (highAccErr) => {
                console.warn('[LocationPicker] High accuracy failed:', highAccErr.message);
                // Fallback: Try without high accuracy
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setGeoLoading(false);
                        setGeoAccuracy(Math.round(pos.coords.accuracy));
                        onChange(pos.coords.latitude, pos.coords.longitude);
                    },
                    (lowAccErr) => {
                        setGeoLoading(false);
                        if (lowAccErr.code === 1) {
                            setGeoError('Location access denied. Please enable location permissions in your browser settings.');
                        } else if (lowAccErr.code === 2) {
                            setGeoError('Location unavailable. Check that GPS/location services are enabled on your device.');
                        } else if (lowAccErr.code === 3) {
                            setGeoError('Location request timed out. Try again or use a different network.');
                        } else {
                            setGeoError(lowAccErr.message || 'Unable to get your location.');
                        }
                    },
                    { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    if (!mounted) return (
        <div className="w-full h-[300px] rounded-xl bg-white/[0.03] flex items-center justify-center animate-pulse">
            <span className="text-white/20 text-sm">Initializing Map...</span>
        </div>
    );

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-white/30 px-1 flex-wrap gap-2">
                <span>Click or drag pin to mark exact location</span>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleUseMyLocation}
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                        disabled={geoLoading}
                    >
                        {geoLoading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                Locating...
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                                </svg>
                                Use GPS Location
                            </>
                        )}
                    </button>
                </div>
            </div>

            {geoError && (
                <div className="text-[11px] text-rose-400 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    ⚠️ {geoError}
                </div>
            )}

            {geoAccuracy !== null && (
                <div className="text-[10px] text-emerald-400/60 px-1">
                    📍 GPS accuracy: ±{geoAccuracy}m
                </div>
            )}

            <div className="w-full h-[300px] rounded-xl overflow-hidden border border-white/[0.06] shadow-inner relative z-0">
                <MapContainer
                    center={[lat, lng]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="w-full h-full"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                </MapContainer>
            </div>

            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-white/15 italic">
                    This helps us deploy repair crews directly to the fountainhead.
                </p>
                <span className="text-[10px] font-mono text-white/15">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
            </div>
        </div>
    );
}
