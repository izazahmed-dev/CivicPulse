/**
 * Twilio IVR Recording Callback
 * 
 * Twilio POSTs to this endpoint after the citizen finishes recording their
 * voice complaint. This handler:
 *   1. Downloads the recorded audio from Twilio's servers
 *   2. Sends it to Sarvam AI for native-language Speech-to-Text
 *   3. Sends the transcript to Gemini for structured complaint extraction
 *   4. Saves the complaint to MongoDB (same collection as web complaints)
 *   5. Responds with TwiML confirmation to the caller
 * 
 * The complaint appears instantly on the Authority Dashboard — identical
 * to complaints filed from the web interface.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
    transcribeBufferWithSarvam,
    callGeminiWithText,
    callGeminiWithAudio,
    keywordExtract,
    type ExtractedComplaint,
} from '@/lib/ai-processing';

// Helper to generate TwiML XML response
function twimlResponse(twiml: string): NextResponse {
    return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${twiml}\n</Response>`,
        {
            status: 200,
            headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        }
    );
}

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        // ─── 1. Parse Twilio's POST body ───
        const formData = await req.formData();
        const recordingUrl = formData.get('RecordingUrl')?.toString();
        const recordingSid = formData.get('RecordingSid')?.toString() || '';
        const callSid = formData.get('CallSid')?.toString() || '';
        const recordingDuration = formData.get('RecordingDuration')?.toString() || '0';

        // Query params we attached in the Record action URL
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category') || '';
        const callerPhone = searchParams.get('phone') || 'unknown';

        console.log(`[IVR-Recording] Received recording:`, {
            recordingSid,
            callSid,
            callerPhone,
            category,
            duration: recordingDuration,
            recordingUrl,
        });

        if (!recordingUrl) {
            console.error('[IVR-Recording] No recording URL received from Twilio');
            return twimlResponse(`
    <Say voice="Polly.Aditi" language="en-IN">Sorry, we could not process your recording. Please try again.</Say>
            `);
        }

        // ─── 2. Download the audio from Twilio ───
        // Twilio recordings are available at RecordingUrl.wav or .mp3
        const audioUrl = `${recordingUrl}.wav`;
        console.log(`[IVR-Recording] Downloading audio from: ${audioUrl}`);

        const audioResponse = await fetch(audioUrl, {
            headers: {
                // Twilio requires Basic auth to download recordings
                'Authorization': `Basic ${Buffer.from(
                    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
                ).toString('base64')}`,
            },
        });

        if (!audioResponse.ok) {
            console.error(`[IVR-Recording] Failed to download audio: ${audioResponse.status}`);
            return twimlResponse(`
    <Say voice="Polly.Aditi" language="en-IN">Sorry, we could not retrieve your recording. Please call again.</Say>
            `);
        }

        const audioArrayBuffer = await audioResponse.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);
        const audioBase64 = audioBuffer.toString('base64');

        console.log(`[IVR-Recording] Downloaded ${audioBuffer.length} bytes of audio`);

        // ─── 3. Process through AI pipeline ───
        const apiKey = process.env.GEMINI_API_KEY;
        let extracted: ExtractedComplaint;
        let processingMode = 'unknown';

        // Try Sarvam AI STT first (best for Indian languages)
        let sttTranscript: string | null = null;

        try {
            sttTranscript = await transcribeBufferWithSarvam(audioBuffer, 'audio/wav');
            processingMode = 'sarvam_stt';
            console.log(`[IVR-Recording] Sarvam STT transcript: "${sttTranscript.slice(0, 100)}..."`);
        } catch (sarvamErr: any) {
            console.warn(`[IVR-Recording] Sarvam STT failed:`, sarvamErr.message);
        }

        if (sttTranscript && apiKey) {
            // Sarvam succeeded → send transcript to Gemini for extraction
            try {
                extracted = await callGeminiWithText(apiKey, sttTranscript);
                processingMode = 'sarvam_gemini';
                // Preserve original transcript
                if (!extracted.transcript) {
                    extracted.transcript = sttTranscript;
                }
            } catch (geminiErr: any) {
                console.warn(`[IVR-Recording] Gemini text extraction failed:`, geminiErr.message);
                extracted = keywordExtract(sttTranscript);
                processingMode = 'sarvam_keyword';
            }
        } else if (!sttTranscript && apiKey) {
            // Sarvam failed → try Gemini multimodal with raw audio
            try {
                extracted = await callGeminiWithAudio(apiKey, audioBase64, 'audio/wav');
                processingMode = 'gemini_multimodal';
            } catch (geminiErr: any) {
                console.error(`[IVR-Recording] Both Sarvam and Gemini failed:`, geminiErr.message);
                // Last resort: create a basic complaint with the category from DTMF
                extracted = {
                    detectedLanguage: 'Unknown',
                    detectedLanguageCode: 'und',
                    transcript: '[Audio could not be transcribed]',
                    transcriptEnglish: '[Audio could not be transcribed]',
                    category: category || 'water',
                    issueType: getDefaultIssueType(category),
                    description: `Phone complaint received via IVR call from ${callerPhone}. Audio transcription failed.`,
                    descriptionOriginal: '',
                    confidence: 0.1,
                    locationMentioned: '',
                };
                processingMode = 'fallback';
            }
        } else if (sttTranscript && !apiKey) {
            extracted = keywordExtract(sttTranscript);
            processingMode = 'sarvam_keyword';
        } else {
            extracted = {
                detectedLanguage: 'Unknown',
                detectedLanguageCode: 'und',
                transcript: '[No AI services configured]',
                transcriptEnglish: '[No AI services configured]',
                category: category || 'water',
                issueType: getDefaultIssueType(category),
                description: `Phone complaint received via IVR from ${callerPhone}. No AI services available.`,
                descriptionOriginal: '',
                confidence: 0.1,
                locationMentioned: '',
            };
            processingMode = 'no_ai';
        }

        // Override category if user selected one via DTMF keypad
        if (category && ['water', 'roads', 'electricity', 'sanitation'].includes(category)) {
            extracted.category = category;
        }

        // ─── 4. Save complaint to MongoDB ───
        const { db } = await connectToDatabase();

        const complaint = {
            id: `IVR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            category: extracted.category,
            issueType: extracted.issueType,
            description: extracted.description,
            descriptionOriginal: extracted.descriptionOriginal || '',
            areaPath: extracted.locationMentioned || 'Unknown (IVR Call)',
            area: extracted.locationMentioned || 'Unknown',
            state: '',
            district: '',
            subarea: '',
            lat: 20.5937,  // Default center of India; updated if location is extracted
            lng: 78.9629,
            timestamp: Date.now(),
            status: 'OPEN',

            // ─── IVR-specific metadata ───
            submittedViaIVR: true,
            callerPhone: callerPhone,
            callSid: callSid,
            recordingSid: recordingSid,
            recordingDuration: parseInt(recordingDuration),
            recordingUrl: recordingUrl,
            voiceTranscript: extracted.transcript,
            voiceTranscriptEnglish: extracted.transcriptEnglish || '',
            detectedLanguage: extracted.detectedLanguage,
            detectedLanguageCode: extracted.detectedLanguageCode,
            aiConfidence: extracted.confidence,
            processingMode: processingMode,
            processingTimeMs: Date.now() - startTime,
        };

        await db.collection('complaints').insertOne(complaint);

        console.log(`[IVR-Recording] ✅ Complaint saved:`, {
            id: complaint.id,
            category: complaint.category,
            issueType: complaint.issueType,
            language: complaint.detectedLanguage,
            confidence: complaint.aiConfidence,
            processingMode,
            processingTimeMs: complaint.processingTimeMs,
        });

        // ─── 5. Respond to the caller with confirmation ───
        return twimlResponse(`
    <Say voice="Polly.Aditi" language="hi-IN">
        धन्यवाद! आपकी शिकायत सफलतापूर्वक दर्ज हो गई है।
        आपका ट्रैकिंग नंबर है ${complaint.id.split('').join(' ')}।
        हम जल्द से जल्द कार्रवाई करेंगे। नमस्ते।
    </Say>
    <Say voice="Polly.Aditi" language="en-IN">
        Thank you! Your complaint has been registered successfully.
        Your tracking ID is ${complaint.id.split('').join(' ')}.
        We will take action as soon as possible. Goodbye.
    </Say>
        `);
    } catch (error) {
        console.error('[IVR-Recording] Fatal error:', error);
        return twimlResponse(`
    <Say voice="Polly.Aditi" language="en-IN">
        We encountered an error processing your complaint. Please try calling again.
    </Say>
        `);
    }
}

function getDefaultIssueType(category: string): string {
    const defaults: Record<string, string> = {
        water: 'no_water',
        roads: 'pothole',
        electricity: 'power_outage',
        sanitation: 'garbage',
    };
    return defaults[category] || 'no_water';
}
