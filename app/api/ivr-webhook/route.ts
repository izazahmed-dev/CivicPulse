/**
 * Twilio IVR Webhook — Incoming Call Handler
 * 
 * This endpoint is configured as the Twilio phone number's webhook URL.
 * When a citizen dials the toll-free number, Twilio sends a POST here.
 * We respond with TwiML instructions to:
 *   1. Greet the caller in Hindi + English
 *   2. Present a DTMF menu (Press 1 for Water, 2 for Roads, etc.)
 *   3. Record their voice complaint
 *   4. Send the recording to our /api/ivr-webhook/recording callback
 * 
 * Twilio Docs: https://www.twilio.com/docs/voice/twiml
 */

import { NextResponse } from 'next/server';

// Helper to generate TwiML XML response
function twimlResponse(twiml: string): NextResponse {
    return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n${twiml}\n</Response>`,
        {
            status: 200,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
            },
        }
    );
}

// ─── Handle incoming call from Twilio ───
export async function POST(req: Request) {
    try {
        // Parse Twilio's form-urlencoded POST body
        const formData = await req.formData();
        const digits = formData.get('Digits')?.toString() || '';
        const callSid = formData.get('CallSid')?.toString() || 'unknown';
        const callerPhone = formData.get('From')?.toString() || 'unknown';

        console.log(`[IVR] Incoming call: CallSid=${callSid}, From=${callerPhone}, Digits=${digits}`);

        // Determine the base URL for callbacks
        const url = new URL(req.url);
        const baseUrl = `${url.protocol}//${url.host}`;

        // ─── No digits pressed yet → Play the main menu ───
        if (!digits) {
            return twimlResponse(`
    <Say voice="Polly.Aditi" language="hi-IN">
        नमस्ते, वॉटर ग्रिड हेल्पलाइन में आपका स्वागत है।
        कृपया अपनी शिकायत का विषय चुनें।
        पानी के लिए 1 दबाएं।
        सड़क के लिए 2 दबाएं।
        बिजली के लिए 3 दबाएं।
        सफाई के लिए 4 दबाएं।
    </Say>
    <Say voice="Polly.Aditi" language="en-IN">
        Welcome to CivicPulse helpline.
        Press 1 for Water.
        Press 2 for Roads.
        Press 3 for Electricity.
        Press 4 for Sanitation.
    </Say>
    <Gather numDigits="1" action="${baseUrl}/api/ivr-webhook" method="POST" timeout="10">
        <Say voice="Polly.Aditi" language="en-IN">Please press a number now.</Say>
    </Gather>
    <Say voice="Polly.Aditi" language="en-IN">We did not receive your input. Goodbye.</Say>
            `);
        }

        // ─── Digit pressed → Map to category and start recording ───
        const categoryMap: Record<string, string> = {
            '1': 'water',
            '2': 'roads',
            '3': 'electricity',
            '4': 'sanitation',
        };

        const selectedCategory = categoryMap[digits];

        if (!selectedCategory) {
            return twimlResponse(`
    <Say voice="Polly.Aditi" language="en-IN">Invalid selection. Please try again.</Say>
    <Redirect method="POST">${baseUrl}/api/ivr-webhook</Redirect>
            `);
        }

        // Record the citizen's voice complaint
        // The recording callback will receive the audio and process it
        const categoryNames: Record<string, { hi: string; en: string }> = {
            water: { hi: 'पानी', en: 'Water' },
            roads: { hi: 'सड़क', en: 'Roads' },
            electricity: { hi: 'बिजली', en: 'Electricity' },
            sanitation: { hi: 'सफाई', en: 'Sanitation' },
        };

        const catName = categoryNames[selectedCategory];

        return twimlResponse(`
    <Say voice="Polly.Aditi" language="hi-IN">
        आपने ${catName.hi} चुना है।
        कृपया बीप के बाद अपनी शिकायत बोलें।
        अपनी शिकायत में अपना इलाका और समस्या का विवरण बताएं।
        बोलने के बाद हैश दबाएं या चुप रहें।
    </Say>
    <Say voice="Polly.Aditi" language="en-IN">
        You selected ${catName.en}.
        Please describe your complaint after the beep.
        Mention your area and the problem clearly.
        Press hash or stay silent when done.
    </Say>
    <Record
        action="${baseUrl}/api/ivr-webhook/recording?category=${selectedCategory}&phone=${encodeURIComponent(callerPhone)}&callSid=${callSid}"
        method="POST"
        maxLength="120"
        playBeep="true"
        timeout="5"
        finishOnKey="#"
        transcribe="false"
    />
    <Say voice="Polly.Aditi" language="en-IN">We did not receive your recording. Goodbye.</Say>
        `);
    } catch (error) {
        console.error('[IVR] Error handling call:', error);
        return twimlResponse(`
    <Say voice="Polly.Aditi" language="en-IN">We are experiencing technical difficulties. Please try again later.</Say>
        `);
    }
}

// Also handle GET for Twilio webhook verification
export async function GET() {
    return NextResponse.json({
        status: 'active',
        service: 'CivicPulse IVR Webhook',
        description: 'Twilio IVR endpoint for offline complaint submission via phone call',
        capabilities: [
            'Hindi + English bilingual voice menu',
            'DTMF category selection (1=Water, 2=Roads, 3=Electricity, 4=Sanitation)',
            'Voice recording → Sarvam AI STT → Gemini extraction → MongoDB',
        ],
    });
}
