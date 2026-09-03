'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, CheckCircle2, ImagePlus, Search, Sparkles } from 'lucide-react';
import { DEMO_AREAS } from '@/data/areas';
import { CATEGORY_LABELS, LANGUAGES, SUBTYPE_OPTIONS } from '@/lib/constants';
import { IncidentCategory, LanguageCode, ParsedVoicePayload } from '@/lib/types';
import { CityGridMap } from '@/components/city-grid-map';
import { VoiceComposer } from '@/components/voice-composer';

export function ReportForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState<IncidentCategory>('water');
  const [subtype, setSubtype] = useState(SUBTYPE_OPTIONS.water[0].value);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [description, setDescription] = useState('');
  const [transcript, setTranscript] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState(DEMO_AREAS[0].id);
  const [media, setMedia] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [voiceSummary, setVoiceSummary] = useState<ParsedVoicePayload | null>(null);

  const selectedArea = DEMO_AREAS.find((area) => area.id === selectedAreaId) ?? DEMO_AREAS[0];
  const areaOptions = useMemo(
    () => DEMO_AREAS.filter((area) => area.label.toLowerCase().includes(areaQuery.toLowerCase())),
    [areaQuery],
  );

  function handleCategoryChange(nextCategory: IncidentCategory) {
    setCategory(nextCategory);
    setSubtype(SUBTYPE_OPTIONS[nextCategory][0].value);
    setVoiceSummary(null);
  }

  async function handleTranscript(nextTranscript: string) {
    setTranscript(nextTranscript);
    setDescription(nextTranscript);

    const response = await fetch('/api/voice/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: nextTranscript }),
    });
    const parsed = await response.json() as ParsedVoicePayload;
    setCategory(parsed.category);
    setSubtype(parsed.subtype);
    setDescription(parsed.description);
    setVoiceSummary(parsed);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setMedia((current) => [...current, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    startTransition(async () => {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subtype,
          language,
          rawTranscript: transcript,
          description,
          lat: selectedArea.lat,
          lng: selectedArea.lng,
          areaId: selectedArea.id,
          areaLabel: selectedArea.label,
          media,
          source: transcript ? 'voice' : 'text',
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? 'Unable to submit incident right now.');
        return;
      }

      const payload = await response.json();
      router.push(`/track/${payload.incident.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="fb-panel rounded-[2rem] p-6">
          <p className="fb-kicker">Citizen Intake</p>
          <h1 className="fb-heading mt-3 text-4xl font-black text-white">Report a water or sanitation issue</h1>
          <p className="mt-4 max-w-2xl text-white/60">
            Designed for fast civic reporting with voice capture, map-based location selection, and transparent follow-up.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(['water', 'sanitation'] as IncidentCategory[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleCategoryChange(option)}
                className={`rounded-[1.25rem] border p-4 text-left transition-all ${
                  category === option
                    ? 'border-cyan-300/40 bg-cyan-300/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">Category</p>
                <p className="mt-2 text-xl font-black text-white">{CATEGORY_LABELS[option]}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">Subtype</label>
              <select className="fb-select" value={subtype} onChange={(event) => setSubtype(event.target.value)}>
                {SUBTYPE_OPTIONS[category].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">Language</label>
              <select className="fb-select" value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                {LANGUAGES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label} ({option.native})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <VoiceComposer language={language} onTranscript={handleTranscript} />

        {voiceSummary && (
          <div className="fb-panel-soft rounded-[1.5rem] p-5">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles size={16} />
              <p className="text-sm font-bold uppercase tracking-[0.14em]">Voice parse complete</p>
            </div>
            <p className="mt-3 text-sm text-white/65">
              Parsed as <span className="font-bold text-white">{CATEGORY_LABELS[voiceSummary.category]}</span> / {voiceSummary.subtype.replaceAll('_', ' ')} with {voiceSummary.severity} severity.
            </p>
          </div>
        )}

        <div className="fb-panel rounded-[2rem] p-6">
          <label className="mb-2 block text-sm font-semibold text-white/70">Describe what is happening</label>
          <textarea
            className="fb-textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: No water has reached our block since 6 AM and nearby apartments are also affected."
          />

          <div className="mt-5">
            <label className="mb-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/18 bg-white/4 p-4 text-sm text-white/70 transition-all hover:border-white/30">
              <ImagePlus size={18} />
              Add issue photos for operator context or closure proof
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
            </label>
            {media.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {media.map((src, index) => (
                  <img key={`${src}-${index}`} src={src} alt="Uploaded issue media" className="h-28 w-full rounded-2xl border border-white/10 object-cover" />
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="fb-panel-soft flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/8 p-4 text-sm text-rose-200">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <button type="submit" className="fb-button fb-button-primary" disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit Incident'}
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="fb-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="fb-kicker">Location Capture</p>
              <h2 className="fb-heading mt-2 text-2xl font-black text-white">Choose the affected area</h2>
            </div>
            <div className="fb-chip">{selectedArea.zone}</div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="fb-input pl-11"
                value={areaQuery}
                onChange={(event) => setAreaQuery(event.target.value)}
                placeholder="Search area or ward"
              />
            </div>

            <div className="mt-4 max-h-44 space-y-2 overflow-auto pr-1 fb-scroll">
              {areaOptions.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition-all ${
                    selectedAreaId === area.id
                      ? 'border-cyan-300/40 bg-cyan-300/10'
                      : 'border-white/8 bg-black/15 hover:border-white/20'
                  }`}
                >
                  <p className="text-sm font-bold text-white">{area.label}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">{area.zone} • {area.ward}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <CityGridMap areas={DEMO_AREAS} selectedAreaId={selectedAreaId} onSelectArea={setSelectedAreaId} />
          </div>
        </div>

        <div className="fb-panel-soft rounded-[1.5rem] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="mt-0.5 text-emerald-300" />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/40">Demo flow</p>
              <ol className="mt-3 space-y-2 text-sm text-white/65">
                <li>1. Submit a complaint from this screen</li>
                <li>2. Open `/ops` and triage it live</li>
                <li>3. Visit the tracking page and confirm timeline updates</li>
                <li>4. Upload proof from `/verify/[id]` and close the loop</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

