'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin, Loader2, X, Navigation, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface PlaceResult {
    title: string;
    address: string;
    placeId: string;
    lat: number;
    lng: number;
    type: string;
    rating: number;
}

interface PlaceSelection {
    formattedAddress: string;
    lat: number;
    lng: number;
    state: string;
    district: string;
    area: string;
    subarea: string;
    fullPath: string;
}

interface PlacesAutocompleteProps {
    onPlaceSelected: (place: PlaceSelection) => void;
}

// Parse address string into state/district/area
function parseAddress(address: string, title: string): { state: string; district: string; area: string; subarea: string; fullPath: string } {
    const parts = address.split(',').map(p => p.trim());

    let state = '';
    let district = '';
    let area = '';
    let subarea = '';

    // Typically: "Subarea, Area, District, State Pincode" or similar
    if (parts.length >= 4) {
        subarea = parts[0];
        area = parts[1];
        district = parts[2];
        state = parts[3].replace(/\s*\d{6}\s*/, '').trim(); // strip pincode
    } else if (parts.length === 3) {
        area = parts[0];
        district = parts[1];
        state = parts[2].replace(/\s*\d{6}\s*/, '').trim();
    } else if (parts.length === 2) {
        district = parts[0];
        state = parts[1].replace(/\s*\d{6}\s*/, '').trim();
    } else if (parts.length === 1) {
        area = parts[0];
    }

    // Remove "India" if it's the state
    if (state.toLowerCase() === 'india' && district) {
        state = district;
        district = area;
        area = subarea || title;
        subarea = '';
    }

    const pathParts = [state, district, area, subarea].filter(Boolean);
    return {
        state,
        district,
        area: area || title,
        subarea,
        fullPath: pathParts.join(' > '),
    };
}

export default function PlacesAutocomplete({ onPlaceSelected }: PlacesAutocompleteProps) {
    const { t, language } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search
    const searchPlaces = useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 3) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/places-search?query=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                setResults(data.results);
                setShowDropdown(true);
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        } catch (err) {
            console.error('[PlacesAutocomplete] Search error:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setSelectedAddress('');

        // Debounce API calls (500ms)
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchPlaces(val);
        }, 500);
    };

    const handleSelectPlace = (place: PlaceResult) => {
        const parsed = parseAddress(place.address, place.title);

        setQuery(place.title);
        setSelectedAddress(`${place.title}${place.address ? ', ' + place.address : ''}`);
        setShowDropdown(false);
        setResults([]);

        onPlaceSelected({
            formattedAddress: `${place.title}, ${place.address}`,
            lat: place.lat,
            lng: place.lng,
            ...parsed,
        });
    };

    const handleClear = () => {
        setQuery('');
        setSelectedAddress('');
        setResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Search input */}
            <div
                className={`
                    relative flex items-center gap-3 rounded-xl border transition-all duration-300
                    ${isFocused
                        ? 'border-emerald-500/40 bg-white/[0.05] shadow-lg shadow-emerald-500/5'
                        : selectedAddress
                            ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                            : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.12]'
                    }
                `}
            >
                <div className="pl-4 flex-shrink-0">
                    {isLoading ? (
                        <Loader2 size={18} className="text-emerald-400 animate-spin" />
                    ) : selectedAddress ? (
                        <MapPin size={18} className="text-emerald-400" />
                    ) : (
                        <Search size={18} className="text-white/25" />
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setIsFocused(true);
                        if (results.length > 0) setShowDropdown(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t('places.search_placeholder')}
                    className="flex-1 bg-transparent py-3.5 pr-2 text-sm text-white/90 placeholder:text-white/20 outline-none"
                    autoComplete="off"
                />

                {/* Clear button */}
                <AnimatePresence>
                    {query && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            type="button"
                            onClick={handleClear}
                            className="mr-3 p-1 rounded-lg hover:bg-white/[0.06] text-white/25 hover:text-white/50 transition-colors"
                        >
                            <X size={14} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Dropdown results */}
            <AnimatePresence>
                {showDropdown && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-white/[0.08] bg-[#1a1a2e]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
                    >
                        <div className="py-1 max-h-[320px] overflow-y-auto custom-scrollbar">
                            {results.map((place, idx) => (
                                <button
                                    key={place.placeId || idx}
                                    type="button"
                                    onClick={() => handleSelectPlace(place)}
                                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/[0.05] transition-colors text-left group"
                                >
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                        <MapPin size={14} className="text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white/80 truncate group-hover:text-white/95 transition-colors">
                                            {place.title}
                                        </div>
                                        <div className="text-xs text-white/30 truncate mt-0.5">
                                            {place.address}
                                        </div>
                                        {place.type && (
                                            <div className="text-[10px] text-white/15 mt-0.5 flex items-center gap-1">
                                                <Building2 size={9} />
                                                {place.type}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selected address display */}
            <AnimatePresence>
                {selectedAddress && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15"
                    >
                        <Navigation size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-emerald-300/70 leading-relaxed">
                            {selectedAddress}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Helper text */}
            {!selectedAddress && !showDropdown && (
                <p className="mt-2 text-[10px] text-white/15 px-1 italic">
                    {language === 'hi'
                        ? 'दरवाजे का नंबर, गली, मोहल्ला, या कोई लैंडमार्क खोजें'
                        : 'Search by door number, street name, colony, or landmark'
                    }
                </p>
            )}
        </div>
    );
}
