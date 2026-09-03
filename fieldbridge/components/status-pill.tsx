import React from 'react';
import { STATUS_LABELS } from '@/lib/constants';
import { IncidentStatus } from '@/lib/types';

export function StatusPill({ status }: { status: IncidentStatus }) {
  return (
    <span className={`fb-status-${status} inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

