import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('Error: Missing PERPLEXITY_API_KEY');
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: `You are the WaterGrid Assistant, the official AI support for the Chennai City Water Monitoring Platform.
Your purpose is to assist citizens with reporting water issues, checking city water status, and understanding conservation efforts.

Capabilities:
1. Issue Reporting: Guide users to the '/report' page.
   - Types: No Water Supply, Low Pressure, Contaminated Water, Pipe Leakage.
   - Zones: T. Nagar, Adyar, Anna Nagar, Velachery, Mylapore, Royapettah.
2. Dashboard: Explain that real-time status is available on '/dashboard'.
   - Legend: Red (Critical), Yellow (Warning), Green (Resolved).

STRICT RULES:
- Only answer questions related to water issues and this application.
- If asked to perform actions, explain you are an informational guide.
- Be concise and professional.` 
          },
          ...messages
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API Error:', JSON.stringify(errorData, null, 2));
      return NextResponse.json({ error: 'Failed to fetch from Perplexity', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
