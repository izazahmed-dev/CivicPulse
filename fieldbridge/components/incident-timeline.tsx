import React from 'react';
import { IncidentEvent } from '@/lib/types';

export function IncidentTimeline({ events }: { events: IncidentEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={`${event.timestamp}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="h-3.5 w-3.5 rounded-full bg-cyan-300" />
            {index !== events.length - 1 && <div className="mt-2 h-full w-px bg-white/10" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-white/40">{event.type.replaceAll('_', ' ')}</p>
            <p className="mt-1 text-white/78">{event.message}</p>
            <p className="mt-2 text-xs text-white/35">
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

