import React from 'react';
import CivicScrollyCanvas from '@/components/CivicScrollyCanvas';
import NarrativeOverlays from '@/components/NarrativeOverlays';

export default function Home() {
  return (
    <main className="relative min-h-[500vh] bg-[#050505]">
      <CivicScrollyCanvas />
      <NarrativeOverlays />
    </main>
  );
}
