'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search, X } from 'lucide-react';
import { SearchResult, searchLocations, FLAT_INDIA_AREAS } from '@/data/indiaAreas';

interface SearchableAreaDropdownProps {
  value: string;
  onChange: (areaName: string, area: SearchResult | null) => void;
  required?: boolean;
}

export default function SearchableAreaDropdown({ 
  value, 
  onChange, 
  required = false 
}: SearchableAreaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAreas, setFilteredAreas] = useState<SearchResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter areas when search query changes
  useEffect(() => {
    const results = searchLocations(searchQuery);
    setFilteredAreas(results);
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectArea = (area: SearchResult) => {
    onChange(area.path, area);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('', null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredAreas.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredAreas[highlightedIndex]) {
          handleSelectArea(filteredAreas[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const selectedLocation = FLAT_INDIA_AREAS.find(a => a.path === value) || FLAT_INDIA_AREAS.find(a => a.name === value);
  const selectedName = selectedLocation?.name || value.split(' > ').slice(-1)[0] || value;
  const selectedPath = selectedLocation?.path || value;

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-3.5 text-slate-500" size={18} />
        
        {value ? (
          <div 
            className="w-full bg-[#1e293b] text-white pl-12 pr-12 py-3 rounded-xl border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors"
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          >
            <span className="text-white font-medium">{selectedName}</span>
            <span className="text-slate-400 text-xs block truncate mt-0.5">
              {selectedPath}
            </span>
            {selectedLocation && (
              <span className="text-[10px] uppercase tracking-wide text-emerald-400/80 mt-1 block">
                {selectedLocation.type}
              </span>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search by State, City, or Locality..."
            className="w-full bg-[#1e293b] text-white pl-12 pr-12 py-3 rounded-xl border border-slate-600 focus:border-[#06d6a0] focus:ring-1 focus:ring-[#06d6a0] outline-none transition-colors"
            required={required && !value}
          />
        )}

        <div className="absolute right-4 top-3.5 flex items-center gap-2">
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          ) : (
            <ChevronDown 
              size={18} 
              className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-slate-600 rounded-xl shadow-2xl max-h-80 overflow-y-auto overflow-x-hidden"
        >
          {filteredAreas.length > 0 ? (
            filteredAreas.map((area, index) => (
              <li
                key={`${area.path}-${index}`}
                className={`px-4 py-3 cursor-pointer transition-colors border-b border-slate-700/50 last:border-0 ${
                  index === highlightedIndex 
                    ? 'bg-[#06d6a0]/20 text-[#06d6a0]' 
                    : 'text-white hover:bg-[#253248]'
                }`}
                onClick={() => handleSelectArea(area)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{area.name}</span>
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      index === highlightedIndex
                        ? 'border-emerald-400/60 text-emerald-400/90'
                        : 'border-slate-600 text-slate-400'
                    }`}>
                      {area.type}
                    </span>
                  </div>
                  <span className={`text-xs ${index === highlightedIndex ? 'text-emerald-400/80' : 'text-slate-400'} truncate`}>
                    {area.path}
                    {area.pincode ? ` • ${area.pincode}` : ''}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-slate-400">
              <Search className="mx-auto mb-2 opacity-50" size={24} />
              <p>No matches found</p>
              <p className="text-xs mt-1">Try a different city or locality</p>
            </li>
          )}
        </ul>
      )}

      {required && (
        <input
          type="hidden"
          value={value}
          required
        />
      )}
    </div>
  );
}
