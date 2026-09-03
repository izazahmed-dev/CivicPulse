/**
 * Shared AI Processing Utilities
 * Used by both the web voice-complaint API and the IVR webhook pipeline.
 */

// ─── Prompts ───

export const AUDIO_EXTRACTION_PROMPT = `You are a multilingual complaint extraction AI for India's civic infrastructure platform (CivicPulse).
You will receive audio of a citizen speaking their complaint. The citizen may speak in ANY Indian language.

Your job:
1. DETECT the language spoken (from the audio itself)
2. TRANSCRIBE the speech exactly as spoken, IN THE ORIGINAL SCRIPT AND LANGUAGE. DO NOT translate the "transcript" field to English.
3. EXTRACT structured complaint data

Supported languages: Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, Assamese, Konkani, Sanskrit, Maithili, Dogri, Bodo, Santali, Kashmiri, Sindhi, Nepali, Manipuri, or any mix of these.

Categories: water, roads, electricity, sanitation
Issue types per category:
- water: no_water, low_pressure, dirty_water, leakage
- roads: pothole, broken_road, flooding
- electricity: power_outage, streetlight, voltage_issue
- sanitation: garbage, drainage, open_defecation

Return ONLY valid JSON, no markdown or explanation:
{
  "detectedLanguage": "<language name in English, e.g. Hindi, Tamil, English>",
  "detectedLanguageCode": "<ISO 639-1 code, e.g. hi, ta, en>",
  "transcript": "<exact transcription of what was spoken IN THE ORIGINAL LANGUAGE SCRIPT (e.g. Devanagari for Hindi). DO NOT TRANSLATE.>",
  "transcriptEnglish": "<English translation of the transcript if not in English>",
  "category": "water|roads|electricity|sanitation",
  "issueType": "<one of the issue types above>",
  "description": "<cleaned up summarization in English>",
  "descriptionOriginal": "<cleaned up summarization in the original spoken language>",
  "confidence": 0.0-1.0,
  "locationMentioned": "<any location/area/city mentioned, or empty string>"
}

Rules:
- Auto-detect the language — do NOT assume any language
- The "transcript" MUST be in the spoken language's native script.
- Handle code-switching (e.g. Hindi-English mix) — mark as the dominant language
- If the complaint doesn't match any category, pick the CLOSEST one
- Clean up speech-to-text errors and filler words
- Rate your confidence from 0.0 to 1.0`;

export const TEXT_EXTRACTION_PROMPT = `You are a multilingual complaint extraction AI for India's civic infrastructure platform (CivicPulse).
You receive a text transcription from a citizen describing their complaint. It may be in any Indian language.

Your job:
1. DETECT the language spoken.
2. Maintain the transcript EXACTLY in its original language and script. DO NOT translate the "transcript" field to English.
3. EXTRACT structured data. Return ONLY valid JSON, no markdown.

Categories: water, roads, electricity, sanitation
Issue types per category:
- water: no_water, low_pressure, dirty_water, leakage
- roads: pothole, broken_road, flooding
- electricity: power_outage, streetlight, voltage_issue
- sanitation: garbage, drainage, open_defecation

Return this exact JSON format:
{
  "detectedLanguage": "<language name in English>",
  "detectedLanguageCode": "<ISO 639-1 code>",
  "transcript": "<original text IN ITS ORIGINAL LANGUAGE SCRIPT. DO NOT TRANSLATE.>",
  "transcriptEnglish": "<English translation if not already English>",
  "category": "water|roads|electricity|sanitation",
  "issueType": "<one of the issue types above>",
  "description": "<cleaned up summarization in English>",
  "descriptionOriginal": "<cleaned up summarization in the original language>",
  "confidence": 0.0-1.0,
  "locationMentioned": "<any location/area mentioned, or empty string>"
}

Rules:
- Auto-detect the language — do NOT assume any language
- The "transcript" MUST be in the native language/script of the speaker.
- Handle code-switching (e.g. Hindi-English mix) — mark as the dominant language
- If the complaint doesn't match any category, pick the CLOSEST one
- Rate your confidence from 0.0 to 1.0`;


// ─── Extracted Complaint type ───
export interface ExtractedComplaint {
    detectedLanguage: string;
    detectedLanguageCode: string;
    transcript: string;
    transcriptEnglish: string;
    category: string;
    issueType: string;
    description: string;
    descriptionOriginal: string;
    confidence: number;
    locationMentioned: string;
}


// ─── Sarvam AI Speech-to-Text ───
export async function transcribeWithSarvam(audioBase64: string, mimeType: string): Promise<string> {
    const sarvamKey = process.env.SARVAM_API_KEY;
    if (!sarvamKey) throw new Error('SARVAM_API_KEY not configured');

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : 'wav';
    const filename = `recording.${extension}`;

    const file = new File([audioBuffer], filename, { type: mimeType });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'saaras:v3');
    formData.append('language_code', 'unknown');
    formData.append('mode', 'transcribe');
    formData.append('with_timestamps', 'false');

    console.log(`[AI-Processing] Calling Sarvam STT: ${audioBuffer.length} bytes, mime=${mimeType}`);

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
            'api-subscription-key': sarvamKey,
        },
        body: formData,
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`[AI-Processing] Sarvam error ${response.status}:`, errText.slice(0, 300));
        throw new Error(`Sarvam STT error ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = await response.json();
    const transcript = data?.transcript;
    if (!transcript || transcript.trim().length === 0) {
        throw new Error('Sarvam returned empty transcript');
    }

    console.log(`[AI-Processing] Sarvam STT success: lang=${data.language_code}, transcript="${transcript.slice(0, 80)}..."`);
    return transcript;
}


// ─── Sarvam AI STT from raw audio buffer (for IVR) ───
export async function transcribeBufferWithSarvam(audioBuffer: Buffer, mimeType: string): Promise<string> {
    const sarvamKey = process.env.SARVAM_API_KEY;
    if (!sarvamKey) throw new Error('SARVAM_API_KEY not configured');

    const extension = mimeType.includes('webm') ? 'webm'
        : mimeType.includes('mp4') ? 'mp4'
            : mimeType.includes('mp3') ? 'mp3'
                : 'wav';
    const filename = `ivr-recording.${extension}`;

    const file = new File([new Uint8Array(audioBuffer)], filename, { type: mimeType });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'saaras:v3');
    formData.append('language_code', 'unknown');
    formData.append('mode', 'transcribe');
    formData.append('with_timestamps', 'false');

    console.log(`[AI-Processing] IVR Sarvam STT: ${audioBuffer.length} bytes, mime=${mimeType}`);

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
            'api-subscription-key': sarvamKey,
        },
        body: formData,
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`[AI-Processing] Sarvam IVR error ${response.status}:`, errText.slice(0, 300));
        throw new Error(`Sarvam STT error ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = await response.json();
    const transcript = data?.transcript;
    if (!transcript || transcript.trim().length === 0) {
        throw new Error('Sarvam returned empty transcript');
    }

    console.log(`[AI-Processing] IVR Sarvam success: lang=${data.language_code}, transcript="${transcript.slice(0, 80)}..."`);
    return transcript;
}


// ─── Gemini multimodal call (audio) ───
const GEMINI_AUDIO_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

export async function callGeminiWithAudio(apiKey: string, audioBase64: string, mimeType: string): Promise<ExtractedComplaint> {
    let lastError: Error | null = null;

    for (const model of GEMINI_AUDIO_MODELS) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    { text: AUDIO_EXTRACTION_PROMPT },
                                    {
                                        inlineData: {
                                            mimeType: mimeType,
                                            data: audioBase64,
                                        },
                                    },
                                    { text: '\n\nAnalyze the audio above. Detect the language, transcribe, and extract complaint data as JSON:' },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 1024,
                            topP: 0.8,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errText = await response.text();
                if (response.status === 429) {
                    console.warn(`[AI-Processing] Gemini ${model} quota exceeded, trying next...`);
                    lastError = new Error(`${model} quota exceeded`);
                    continue;
                }
                throw new Error(`Gemini API error ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Gemini response');
            }

            console.log(`[AI-Processing] Gemini audio analysis completed with model: ${model}`);
            return JSON.parse(jsonMatch[0]);
        } catch (err: any) {
            lastError = err;
            console.warn(`[AI-Processing] Gemini model ${model} failed:`, err.message);
        }
    }

    throw lastError || new Error('All Gemini models failed for audio');
}


// ─── Gemini text-only call ───
export async function callGeminiWithText(apiKey: string, transcript: string): Promise<ExtractedComplaint> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: TEXT_EXTRACTION_PROMPT }],
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Understood. I will detect the language, transcribe, and extract structured complaint data, returning only valid JSON.' }],
                    },
                    {
                        role: 'user',
                        parts: [{ text: `Transcript: "${transcript}"\n\nExtract the complaint data as JSON:` }],
                    },
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 512,
                    topP: 0.8,
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
    }

    return JSON.parse(jsonMatch[0]);
}


// ─── Keyword fallback ───
export function keywordExtract(transcript: string): ExtractedComplaint {
    const t = transcript.toLowerCase();

    let category = 'water';
    let issueType = 'no_water';

    if (t.includes('road') || t.includes('सड़क') || t.includes('pothole') || t.includes('गड्ढ')) {
        category = 'roads';
        issueType = 'pothole';
        if (t.includes('flood') || t.includes('बाढ़')) issueType = 'flooding';
        if (t.includes('broken') || t.includes('टूट')) issueType = 'broken_road';
    } else if (t.includes('electric') || t.includes('बिजली') || t.includes('power') || t.includes('voltage')) {
        category = 'electricity';
        issueType = 'power_outage';
        if (t.includes('street') || t.includes('lamp') || t.includes('बत्ती')) issueType = 'streetlight';
        if (t.includes('voltage') || t.includes('fluctuat')) issueType = 'voltage_issue';
    } else if (t.includes('garbage') || t.includes('कचर') || t.includes('drain') || t.includes('नाल') || t.includes('sanit')) {
        category = 'sanitation';
        issueType = 'garbage';
        if (t.includes('drain') || t.includes('नाल') || t.includes('गटर')) issueType = 'drainage';
    } else {
        if (t.includes('pressure') || t.includes('दबाव')) issueType = 'low_pressure';
        else if (t.includes('dirty') || t.includes('गंद') || t.includes('दूषित')) issueType = 'dirty_water';
        else if (t.includes('leak') || t.includes('रिसाव') || t.includes('pipe')) issueType = 'leakage';
    }

    const hasDevanagari = /[\u0900-\u097F]/.test(transcript);
    const hasTamil = /[\u0B80-\u0BFF]/.test(transcript);
    const hasTelugu = /[\u0C00-\u0C7F]/.test(transcript);
    const hasBengali = /[\u0980-\u09FF]/.test(transcript);

    let lang = 'English';
    let langCode = 'en';
    if (hasDevanagari) { lang = 'Hindi'; langCode = 'hi'; }
    else if (hasTamil) { lang = 'Tamil'; langCode = 'ta'; }
    else if (hasTelugu) { lang = 'Telugu'; langCode = 'te'; }
    else if (hasBengali) { lang = 'Bengali'; langCode = 'bn'; }

    return {
        detectedLanguage: lang,
        detectedLanguageCode: langCode,
        transcript: transcript,
        transcriptEnglish: transcript,
        category,
        issueType,
        description: transcript,
        descriptionOriginal: transcript,
        confidence: 0.4,
        locationMentioned: '',
    };
}
