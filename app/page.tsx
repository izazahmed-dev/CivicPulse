import React from 'react';
import CivicScrollyCanvas from '@/components/CivicScrollyCanvas';
import NarrativeOverlays from '@/components/NarrativeOverlays';

export default function Home() {
  return (
    <main className="relative min-h-[500vh] bg-[#0a192f]">
      {/* 1. Underlying Canvas Layer (Sticky/Fixed) */}
      <CivicScrollyCanvas />
      
      {/* 2. Scrollable Narrative Text Layer */}
      <NarrativeOverlays />
    </main>
  );
}
