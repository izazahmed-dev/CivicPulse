'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Mic, Sparkles, Square } from 'lucide-react';

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    SpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

export function VoiceComposer({
  language,
  onTranscript,
}: {
  language: string;
  onTranscript: (transcript: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const supported = useMemo(() => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition), []);

  function startRecognition() {
    if (!supported) return;

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ').trim();
      if (transcript) onTranscript(transcript);
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopRecognition() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  if (!supported) {
    return (
      <div className="fb-panel-soft rounded-2xl p-4 text-sm text-white/55">
        Browser voice capture is unavailable here. You can still paste a transcript and use mock AI parsing.
      </div>
    );
  }

  return (
    <div className="fb-panel-soft rounded-2xl p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="fb-kicker">Voice Intake</p>
          <p className="mt-2 text-sm text-white/55">
            Record a natural complaint and let FieldBridge pre-fill category and subtype.
          </p>
        </div>
        {recording ? (
          <button type="button" onClick={stopRecognition} className="fb-button fb-button-secondary">
            <Square size={16} />
            Stop Recording
          </button>
        ) : (
          <button type="button" onClick={startRecognition} className="fb-button fb-button-secondary">
            <Mic size={16} />
            Start Voice Capture
          </button>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/35">
        <Sparkles size={14} />
        FieldBridge will parse the transcript using mock or live AI mode
      </div>
    </div>
  );
}

