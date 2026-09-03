import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the CivicPulse Assistant, the official AI support for the India Water Monitoring Platform.
Your purpose is to assist citizens with reporting water issues, checking city water status, and understanding conservation efforts.

Capabilities:
1. Issue Reporting: Guide users to the '/report' page.
   - Types: No Water Supply, Low Pressure, Contaminated Water, Pipe Leakage.
   - Zones: Any area across India - users can search and select their area.
2. Dashboard: Explain that real-time status is available on '/dashboard'.
   - Legend: Red (Critical), Yellow (Warning), Green (Resolved).
3. Water Scanner: Users can scan their tap water at '/scan' using their camera.
4. Community: Users can discuss issues with others at '/community'.
5. Analytics: Area-wise data and trends at '/analytics'.

STRICT RULES:
- Only answer questions related to water issues and this application.
- If asked about unrelated topics, redirect politely to water-related topics.
- Be concise, helpful, and professional.
- Use emojis sparingly for friendliness.
- Format responses with short paragraphs for readability.`;

async function callGeminiWithRetry(apiKey: string, geminiContents: unknown[], retries = 3): Promise<Response> {
    for (let attempt = 0; attempt < retries; attempt++) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: geminiContents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                        topP: 0.9,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                    ],
                }),
            }
        );

        if (response.status === 429 && attempt < retries - 1) {
            const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            console.log(`[CivicPulse Chat] Rate limited (429). Retrying in ${Math.round(waitMs)}ms (attempt ${attempt + 1}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
            continue;
        }

        return response;
    }

    // Should never reach here, but TypeScript wants a return
    throw new Error('All retries exhausted');
}

// Smart fallback responses for when the API is unavailable
function getSmartFallback(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    if (msg.includes('report') || msg.includes('complaint') || msg.includes('issue')) {
        return `📝 **How to Report a Water Issue:**

1. Go to the **Report** page at \`/report\`
2. Select your **area** from the search
3. Pin your **exact location** on the map
4. Choose the **issue type** (No Water, Dirty Water, Low Pressure, Pipe Leakage)
5. Add a **description** and submit

Your complaint will be tracked with a unique ID. You can monitor it on the **Dashboard**.`;
    }

    if (msg.includes('dashboard') || msg.includes('heatmap') || msg.includes('map')) {
        return `📊 **Dashboard & Heatmap:**

The CivicPulse Dashboard at \`/dashboard\` shows real-time water status across your city:

- 🔴 **Red** — Critical issue (no water / contamination)
- 🟡 **Yellow** — Warning (low pressure / leakage)
- 🟢 **Green** — Resolved or normal

Click on any marker to see complaint details. You can filter by area using the sidebar.`;
    }

    if (msg.includes('scan') || msg.includes('quality') || msg.includes('test') || msg.includes('water quality')) {
        return `🔬 **Water Quality Scanner:**

Use the scanner at \`/scan\` to check your tap water:

1. Fill a **clear glass** with tap water
2. Place it against a **white background** with good lighting
3. **Take a photo** or upload one
4. Our AI will analyze **turbidity**, **color**, and **contaminant risk**

Results include a safety rating: Clean ✅, Suspicious ⚠️, or Hazardous 🚨.`;
    }

    if (msg.includes('community') || msg.includes('chat') || msg.includes('discuss')) {
        return `💬 **Community Forum:**

Join the discussion at \`/community\`! You can:

- **Post** about water issues in your area
- **Upvote** important reports to raise visibility
- **Reply** to share solutions or updates
- **Filter** by city and sort by recent or popular

It's a great way to coordinate with neighbors about shared water problems.`;
    }

    if (msg.includes('analytics') || msg.includes('data') || msg.includes('stats') || msg.includes('insight')) {
        return `📈 **Analytics & Insights:**

Visit \`/analytics\` for detailed data visualization:

- **Total reports**, critical issues, and resolution rates
- **Donut chart** breakdown by issue type
- **7-day trend** sparkline
- **Top reported areas** bar chart
- **Quick insights** on peak hours and resolution trends

All data is sourced from citizen reports and updated in real-time.`;
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('help')) {
        return `👋 Hello! I'm the **CivicPulse AI Assistant**.

I can help you with:

- 📝 **Reporting** water issues in your area
- 📊 **Dashboard** — real-time city water status
- 🔬 **Scanning** your tap water quality
- 💬 **Community** discussions
- 📈 **Analytics** and data insights

What would you like to know about?`;
    }

    return `💧 I'm the **CivicPulse Assistant** and I can help you with water-related issues!

Here's what I can assist with:
- **Report an issue** → Go to \`/report\`
- **Check area status** → Visit \`/dashboard\`
- **Scan water quality** → Try \`/scan\`
- **Discuss with others** → Join \`/community\`

Could you tell me more specifically what you need help with?`;
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[CivicPulse Chat] Missing GEMINI_API_KEY');
            return NextResponse.json({
                reply: 'The AI service is not configured yet. Please add your GEMINI_API_KEY to .env.local.'
            });
        }

        // Build Gemini-compatible conversation
        const geminiContents = [];

        // System instruction as first exchange
        geminiContents.push({
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }],
        });
        geminiContents.push({
            role: 'model',
            parts: [{ text: "Understood! I'm the CivicPulse Assistant. I'll help citizens with water issues, reporting, dashboard info, and the platform features. How can I assist you today? 💧" }],
        });

        // Add conversation history
        for (const msg of messages) {
            geminiContents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            });
        }

        try {
            const response = await callGeminiWithRetry(apiKey, geminiContents);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[CivicPulse Chat] Gemini API error:', response.status, errorText);

                // Use smart fallback for rate limits or other API errors
                const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').pop();
                return NextResponse.json({
                    reply: getSmartFallback(lastUserMsg?.content || '')
                });
            }

            const data = await response.json();

            const text =
                data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "I couldn't process that. Could you rephrase your question about water issues?";

            return NextResponse.json({ reply: text });

        } catch (retryError) {
            console.error('[CivicPulse Chat] All retries failed:', retryError);
            const lastUserMsg = messages.filter((m: { role: string }) => m.role === 'user').pop();
            return NextResponse.json({
                reply: getSmartFallback(lastUserMsg?.content || '')
            });
        }

    } catch (error) {
        console.error('[CivicPulse Chat] Server error:', error);
        return NextResponse.json({
            reply: 'A network error occurred. Please check your connection and try again.'
        });
    }
}
