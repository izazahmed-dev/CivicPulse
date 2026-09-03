'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, ImagePlus, ShieldAlert, XCircle } from 'lucide-react';
import { IncidentDetail } from '@/lib/types';
import { useDemoRole } from '@/components/demo-role';
import { StatusPill } from '@/components/status-pill';

export function ProofWorkbench({ detail }: { detail: IncidentDetail }) {
  const router = useRouter();
  const { role } = useDemoRole();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState('');
  const [media, setMedia] = useState<string[]>([]);

  const pendingProof = useMemo(
    () => detail.proofs.find((proof) => proof.verificationStatus === 'pending'),
    [detail.proofs],
  );

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMedia((current) => [...current, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function submit(decision?: 'accepted' | 'rejected') {
    startTransition(async () => {
      await fetch(`/api/incidents/${detail.incident.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note,
          media,
          submittedBy: role,
          decision,
        }),
      });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="fb-panel rounded-[2rem] p-6">
        <p className="fb-kicker">Verification Flow</p>
        <h1 className="fb-heading mt-3 text-4xl font-black text-white">Close the loop with visible proof</h1>
        <p className="mt-4 text-white/60">
          FieldBridge keeps closure trustworthy by recording proof submissions and operator review.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusPill status={detail.incident.status} />
          <div className="fb-chip">{detail.incident.areaLabel}</div>
          <div className="fb-chip">{detail.incident.subtype.replaceAll('_', ' ')}</div>
        </div>

        {pendingProof && (
          <div className="mt-6 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/8 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <ShieldAlert size={18} />
              <p className="text-sm font-bold uppercase tracking-[0.14em]">Pending proof on file</p>
            </div>
            <p className="mt-3 text-sm text-white/70">{pendingProof.note}</p>
          </div>
        )}
      </div>

      <div className="fb-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold text-white/70">
          Current role: <span className="font-black uppercase tracking-[0.14em] text-cyan-300">{role}</span>
        </p>
        <textarea
          className="fb-textarea mt-4"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={role === 'operator' ? 'Add a verification note or decision rationale' : 'Describe what changed on the ground and what your proof shows'}
        />

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/18 bg-white/4 p-4 text-sm text-white/70 transition-all hover:border-white/30">
          <ImagePlus size={18} />
          Upload before/after or closure proof
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
        </label>

        {media.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {media.map((src, index) => (
              <img key={`${src}-${index}`} src={src} alt="Proof upload preview" className="h-28 w-full rounded-2xl border border-white/10 object-cover" />
            ))}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {role === 'operator' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => submit('accepted')} disabled={isPending} className="fb-button fb-button-primary">
                <CheckCircle2 size={16} />
                Accept Proof
              </button>
              <button type="button" onClick={() => submit('rejected')} disabled={isPending} className="fb-button fb-button-secondary">
                <XCircle size={16} />
                Reject Proof
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => submit()} disabled={isPending} className="fb-button fb-button-primary">
              Submit Proof
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

