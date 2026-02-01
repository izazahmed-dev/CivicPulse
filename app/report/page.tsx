'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Droplets, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

// Mock Locations with Lat/Lng (Chennai Context)
const AREAS = [
  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
  { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
  { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
  { name: 'Velachery', lat: 12.9759, lng: 80.2212 },
  { name: 'Mylapore', lat: 13.0368, lng: 80.2676 },
  { name: 'Royapettah', lat: 13.0581, lng: 80.2641 },
];

const ISSUE_TYPES = [
  { id: 'no_water', label: 'No Water Supply', icon: Droplets, color: 'text-crisis border-crisis bg-crisis/10' },
  { id: 'low_pressure', label: 'Low Pressure', icon: ArrowLeft, color: 'text-warning border-warning bg-warning/10' },
  { id: 'dirty_water', label: 'Contaminated Water', icon: AlertTriangle, color: 'text-orange-500 border-orange-500 bg-orange-500/10' },
  { id: 'leakage', label: 'Pipe Leakage', icon: Droplets, color: 'text-blue-400 border-blue-400 bg-blue-400/10' },
];

export default function ReportPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  
  const [formData, setFormData] = useState({
    area: '',
    issueType: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create Complaint Object
    const selectedArea = AREAS.find(a => a.name === formData.area);
    const newComplaint = {
      id: `WC-${Math.floor(Math.random() * 10000)}`,
      ...formData,
      lat: selectedArea?.lat || 13.0827,
      lng: selectedArea?.lng || 80.2707,
      timestamp: Date.now(),
      status: 'OPEN'
    };

    // Save to LocalStorage
    const existing = JSON.parse(localStorage.getItem('water_complaints') || '[]');
    localStorage.setItem('water_complaints', JSON.stringify([newComplaint, ...existing]));

    setComplaintId(newComplaint.id);
    setStep('success');
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0a192f] text-[#e6f1ff] p-4 md:p-8 flex items-center justify-center">
      <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="w-full max-w-lg">
        {step === 'form' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f172a] p-8 rounded-2xl border border-slate-700 shadow-2xl"
          >
            <h1 className="text-3xl font-bold mb-2 text-white">Report Issue</h1>
            <p className="text-slate-400 mb-8">Help us track water supply status in your area.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Area Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location / Area</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <select 
                    required
                    className="w-full bg-[#1e293b] text-white pl-12 pr-4 py-3 rounded-xl border border-slate-600 focus:border-[#06d6a0] focus:ring-1 focus:ring-[#06d6a0] outline-none appearance-none cursor-pointer"
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                  >
                    <option value="">Select your area</option>
                    {AREAS.map(area => (
                      <option key={area.name} value={area.name}>{area.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Issue Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {ISSUE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.issueType === type.id;
                    return (
                      <label 
                        key={type.id}
                        className={`
                          cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center
                          ${isSelected 
                            ? `${type.color} ring-1 ring-offset-2 ring-offset-[#0f172a] shadow-lg scale-[1.02]` 
                            : 'border-slate-700 bg-[#1e293b] text-slate-400 hover:border-slate-500 hover:bg-[#253248]'
                          }
                        `}
                      >
                        <input 
                          type="radio" 
                          name="issue" 
                          value={type.id} 
                          required
                          className="hidden"
                          onChange={(e) => setFormData({...formData, issueType: e.target.value})} 
                        />
                        <Icon size={24} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Additional Details (Optional)</label>
                <textarea 
                  className="w-full bg-[#1e293b] text-white p-4 rounded-xl border border-slate-600 focus:border-[#06d6a0] focus:ring-1 focus:ring-[#06d6a0] outline-none min-h-[100px] resize-none"
                  placeholder="e.g. No water for 2 days, pressure is very low..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#06d6a0] hover:bg-[#05b588] text-[#0a192f] font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0a192f] border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f172a] p-10 rounded-2xl border border-slate-700 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-[#06d6a0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-[#06d6a0]" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Report Submitted</h2>
            <p className="text-slate-400 mb-6">Thank you for being a responsible citizen.</p>
            
            <div className="bg-[#1e293b] p-4 rounded-lg mb-8 inline-block">
              <span className="text-slate-500 text-xs uppercase tracking-wider block mb-1">Complaint ID</span>
              <span className="text-xl font-mono text-[#06d6a0]">{complaintId}</span>
            </div>

            <div className="flex flex-col gap-3">
              <Link 
                href="/dashboard" 
                className="w-full bg-[#0a192f] border border-[#06d6a0] text-[#06d6a0] font-bold py-3 rounded-xl hover:bg-[#06d6a0]/10 transition-colors"
              >
                View Live Dashboard
              </Link>
              <button 
                onClick={() => {
                   setFormData({ area: '', issueType: '', description: '' });
                   setStep('form');
                }}
                className="text-slate-400 hover:text-white text-sm py-2"
              >
                Report Another Issue
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
