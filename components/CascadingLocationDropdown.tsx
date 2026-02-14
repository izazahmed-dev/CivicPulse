'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Building2, Map, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LocationNode,
    getStates,
    getCitiesByState,
    getAreasByCity,
    getSubareasByArea,
} from '@/data/indiaAreas';

interface CascadingLocationDropdownProps {
    onSelectionChange: (selection: {
        state: string;
        district: string;
        area: string;
        subarea: string;
        lat: number;
        lng: number;
        fullPath: string;
    }) => void;
}

/* ── Styled Select ── */
function StyledSelect({
    label,
    icon: Icon,
    value,
    options,
    onChange,
    disabled,
    placeholder,
    badge,
}: {
    label: string;
    icon: React.ElementType;
    value: string;
    options: LocationNode[];
    onChange: (name: string) => void;
    disabled?: boolean;
    placeholder: string;
    badge?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.name === value);

    return (
        <div className="flex-1 min-w-0" ref={ref}>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                <Icon className="w-3.5 h-3.5" />
                {label}
                {badge && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">{badge}</span>
                )}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm transition-all ${
                        disabled
                            ? 'bg-white/[0.02] border border-white/[0.04] text-white/20 cursor-not-allowed'
                            : isOpen
                                ? 'bg-white/[0.06] border border-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                                : value
                                    ? 'bg-white/[0.05] border border-emerald-500/20 text-white'
                                    : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                >
                    <span className={value ? 'font-medium' : ''}>
                        {value || placeholder}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                            disabled ? 'text-white/10' : 'text-white/30'
                        }`}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && options.length > 0 && (
                        <motion.ul
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-[100] w-full mt-2 rounded-xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden max-h-60 overflow-y-auto"
                            style={{ background: 'linear-gradient(180deg, #141e30, #0f1824)' }}
                        >
                            {options.map((opt, i) => (
                                <li
                                    key={opt.name}
                                    onClick={() => {
                                        onChange(opt.name);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-3 cursor-pointer text-sm transition-all flex items-center justify-between ${
                                        opt.name === value
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                                    } ${i < options.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                                >
                                    <span className="font-medium">{opt.name}</span>
                                    {opt.children && opt.children.length > 0 && (
                                        <span className="text-[10px] text-white/20">
                                            {opt.children.length} {opt.type === 'state' ? 'cities' : 'areas'}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ═══════════ Main Component ═══════════ */

export default function CascadingLocationDropdown({ onSelectionChange }: CascadingLocationDropdownProps) {
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedSubarea, setSelectedSubarea] = useState('');

    const states = getStates();
    const districts = selectedState ? getCitiesByState(selectedState) : [];
    const areas = selectedState && selectedDistrict ? getAreasByCity(selectedState, selectedDistrict) : [];
    const subareas = selectedState && selectedDistrict && selectedArea
        ? getSubareasByArea(selectedState, selectedDistrict, selectedArea) : [];

    const handleStateChange = (name: string) => {
        setSelectedState(name);
        setSelectedDistrict('');
        setSelectedArea('');
        setSelectedSubarea('');
        const state = states.find(s => s.name === name);
        if (state) {
            onSelectionChange({
                state: name,
                district: '',
                area: '',
                subarea: '',
                lat: state.lat,
                lng: state.lng,
                fullPath: name,
            });
        }
    };

    const handleDistrictChange = (name: string) => {
        setSelectedDistrict(name);
        setSelectedArea('');
        setSelectedSubarea('');
        const district = districts.find(d => d.name === name);
        if (district) {
            onSelectionChange({
                state: selectedState,
                district: name,
                area: '',
                subarea: '',
                lat: district.lat,
                lng: district.lng,
                fullPath: `${selectedState} > ${name}`,
            });
        }
    };

    const handleAreaChange = (name: string) => {
        setSelectedArea(name);
        setSelectedSubarea('');
        const area = areas.find(a => a.name === name);
        if (area) {
            onSelectionChange({
                state: selectedState,
                district: selectedDistrict,
                area: name,
                subarea: '',
                lat: area.lat,
                lng: area.lng,
                fullPath: `${selectedState} > ${selectedDistrict} > ${name}`,
            });
        }
    };

    const handleSubareaChange = (name: string) => {
        setSelectedSubarea(name);
        const sub = subareas.find(s => s.name === name);
        if (sub) {
            onSelectionChange({
                state: selectedState,
                district: selectedDistrict,
                area: selectedArea,
                subarea: name,
                lat: sub.lat,
                lng: sub.lng,
                fullPath: `${selectedState} > ${selectedDistrict} > ${selectedArea} > ${name}`,
            });
        }
    };

    // Determine completion level
    const completionSteps = [selectedState, selectedDistrict, selectedArea].filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completionSteps / 3) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
                <span className="text-[10px] text-white/25 font-mono">{completionSteps}/3</span>
            </div>

            {/* State Dropdown */}
            <StyledSelect
                label="State"
                icon={MapPin}
                value={selectedState}
                options={states}
                onChange={handleStateChange}
                placeholder="Select your state"
                badge={selectedState ? '✓' : undefined}
            />

            {/* District/City Dropdown */}
            <StyledSelect
                label="District / City"
                icon={Building2}
                value={selectedDistrict}
                options={districts}
                onChange={handleDistrictChange}
                disabled={!selectedState}
                placeholder={selectedState ? 'Select district or city' : 'Select a state first'}
                badge={selectedDistrict ? '✓' : undefined}
            />

            {/* Area Dropdown */}
            <StyledSelect
                label="Area / Locality"
                icon={Map}
                value={selectedArea}
                options={areas}
                onChange={handleAreaChange}
                disabled={!selectedDistrict}
                placeholder={selectedDistrict ? 'Select your area' : 'Select a district first'}
                badge={selectedArea ? '✓' : undefined}
            />

            {/* Subarea (optional, if available) */}
            {subareas.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <StyledSelect
                        label="Sub-area (Optional)"
                        icon={Navigation}
                        value={selectedSubarea}
                        options={subareas}
                        onChange={handleSubareaChange}
                        placeholder="Narrow down further"
                    />
                </motion.div>
            )}

            {/* Selection summary */}
            {selectedArea && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15"
                >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-[11px] text-emerald-400/80 truncate">
                        {selectedState} → {selectedDistrict} → {selectedArea}
                        {selectedSubarea && ` → ${selectedSubarea}`}
                    </span>
                </motion.div>
            )}
        </div>
    );
}
