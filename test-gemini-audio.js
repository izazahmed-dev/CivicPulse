const apiKey = process.env.GEMINI_API_KEY || '';

const AUDIO_EXTRACTION_PROMPT = `You are a multilingual complaint extraction AI for India's civic infrastructure platform (WaterGrid).
You will receive audio of a citizen speaking their complaint. The citizen may speak in ANY Indian language.

Your job:
1. DETECT the language spoken (from the audio itself)
2. TRANSCRIBE the speech exactly as spoken, IN THE ORIGINAL SCRIPT AND LANGUAGE. DO NOT translate the "transcript" field to English.
3. EXTRACT structured complaint data`;

async function callGeminiWithAudio(audioBase64, mimeType) {
    console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "NONE");
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
        throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log("Success:", JSON.stringify(data, null, 2));
}

 callGeminiWithAudio('UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA', 'audio/wav').catch(console.error);
