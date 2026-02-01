'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L from 'leaflet';

// Props
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

// Component to handle map view updates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function DashboardMap({ complaints, selectedArea, onSelectArea }: MapProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full flex items-center justify-center bg-[#0a192f] text-slate-500">Loading Map Data...</div>;

  // Determine Map Center
  const defaultCenter: [number, number] = [13.0827, 80.2707]; // Chennai
  let center = defaultCenter;

  if (selectedArea) {
    const areaComplaint = complaints.find(c => c.area === selectedArea);
    if (areaComplaint) {
        center = [areaComplaint.lat, areaComplaint.lng];
    }
  }

  // Group by location for "Heat" intensity
  // But for simple "Weighted Circle" we just stack them.
  // Crisis: Red, Warning: Orange/Yellow
  
  return (
    <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0 bg-[#0a192f]"
        style={{ height: '100%', width: '100%' }}
    >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Render "Heat" Circles */}
        {complaints.map((c) => {
            let color = '#ff6b6b'; // Red
            if (c.issueType === 'low_pressure') color = '#ffd166'; // Yellow
            if (c.status === 'RESOLVED') color = '#06d6a0'; // Green
            
            return (
                <CircleMarker
                    key={c.id}
                    center={[c.lat, c.lng]}
                    radius={30} // Large radius for heat effect
                    pathOptions={{ 
                        color: 'transparent',
                        fillColor: color, 
                        fillOpacity: 0.15 // Low opacity for stacking
                    }}
                    eventHandlers={{
                        click: () => onSelectArea(c.area)
                    }}
                />
            );
        })}

        {/* Render Precise Points (Clickable) */}
         {complaints.map((c) => {
            let color = '#ff6b6b';
            if (c.issueType === 'low_pressure') color = '#ffd166';
            if (c.status === 'RESOLVED') color = '#06d6a0';

            return (
                <CircleMarker
                    key={`point-${c.id}`}
                    center={[c.lat, c.lng]}
                    radius={6}
                    pathOptions={{ 
                        color: '#fff',
                        weight: 1,
                        fillColor: color, 
                        fillOpacity: 1 
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="bg-slate-900 text-slate-100 p-2 min-w-[200px]">
                            <h3 className="font-bold text-[#06d6a0]">{c.area}</h3>
                            <p className="text-sm border-b border-slate-700 pb-2 mb-2">{c.id}</p>
                            <p className="text-sm font-medium text-white mb-1">{c.issueType.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-xs text-slate-400">{c.description || 'No description'}</p>
                            <p className="text-xs text-slate-500 mt-2">{new Date(c.timestamp).toLocaleString()}</p>
                        </div>
                    </Popup>
                </CircleMarker>
            );
        })}

        <MapUpdater center={center} />
    </MapContainer>
  );
}
