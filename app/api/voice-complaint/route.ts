import { NextResponse } from 'next/server';
import {
    transcribeWithSarvam,
    callGeminiWithAudio,
    callGeminiWithText,
    keywordExtract,
} from '@/lib/ai-processing';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { audio, mimeType, transcript } = body;

        if (!audio && !transcript) {
            return NextResponse.json(
                { error: 'No audio or transcript provided' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let extracted;
        let mode = 'text';

        if (audio) {
            // Primary path: Sarvam AI STT → Gemini text extraction
            let sttTranscript: string | null = null;

            // Step 1: Try Sarvam AI for speech-to-text
            try {
                sttTranscript = await transcribeWithSarvam(audio, mimeType || 'audio/webm');
                mode = 'sarvam_stt';
            } catch (sarvamErr: any) {
                console.warn('[VoiceComplaint] Sarvam STT failed, trying Gemini multimodal:', sarvamErr.message);
            }

            if (sttTranscript && apiKey) {
                // Step 2: Use Gemini to extract complaint from transcript
                try {
                    extracted = await callGeminiWithText(apiKey, sttTranscript);
                    // Preserve the Sarvam transcript
                    if (extracted && !extracted.transcript) {
                        extracted.transcript = sttTranscript;
                    }
                } catch (geminiErr: any) {
                    console.warn('[VoiceComplaint] Gemini text extraction failed after Sarvam:', geminiErr.message);
                    extracted = keywordExtract(sttTranscript);
                    mode = 'sarvam_keyword';
                }
            } else if (!sttTranscript && apiKey) {
                // Fallback: Gemini multimodal (audio directly)
                try {
                    extracted = await callGeminiWithAudio(apiKey, audio, mimeType || 'audio/webm');
                    mode = 'gemini_multimodal';
                } catch (geminiErr: any) {
                    console.error('[VoiceComplaint] Both Sarvam and Gemini audio failed:', geminiErr.message);
                    return NextResponse.json(
                        { error: 'Speech processing failed. Please type your complaint instead.' },
                        { status: 503 }
                    );
                }
            } else if (sttTranscript && !apiKey) {
                // No Gemini key, use keyword fallback on Sarvam transcript
                extracted = keywordExtract(sttTranscript);
                mode = 'sarvam_keyword';
            } else {
                return NextResponse.json(
                    { error: 'Speech AI is not configured. Please add API keys or type your complaint.' },
                    { status: 503 }
                );
            }
        } else {
            // Text transcript provided (e.g. from Web Speech API)
            if (apiKey) {
                try {
                    extracted = await callGeminiWithText(apiKey, transcript);
                } catch (err: any) {
                    console.error('[VoiceComplaint] Gemini text call failed:', err.message);
                    extracted = keywordExtract(transcript || '');
                }
            } else {
                extracted = keywordExtract(transcript || '');
            }
        }

        return NextResponse.json({
            success: true,
            extracted,
            mode,
        });
    } catch (error) {
        console.error('[VoiceComplaint] Server error:', error);
        return NextResponse.json(
            { error: 'Failed to process voice complaint' },
            { status: 500 }
        );
    }
}
