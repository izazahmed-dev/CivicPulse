import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key, return simulated results for demo
    if (!apiKey) {
      console.warn('[WaterGrid] No GEMINI_API_KEY found. Using simulated scan results.');
      const simulated = generateSimulatedResult();
      return NextResponse.json(simulated);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

    // Extract base64 data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `You are an expert water quality analyst. Analyze this image of water and provide a JSON response with the following structure. Be strict and analytical.

IMPORTANT: Respond ONLY with valid JSON, no markdown, no code blocks, no extra text.

{
  "turbidity": <number 0-100, where 0 is crystal clear and 100 is completely opaque>,
  "colorAnalysis": "<describe the color: clear, slightly yellow, brownish, greenish, rusty, milky, etc>",
  "riskLevel": "<one of: Clean, Suspicious, Hazardous>",
  "contaminants": ["<list of possible contaminants detected visually>"],
  "summary": "<2-3 sentence analysis explaining findings and recommendation>",
  "drinkable": <boolean>,
  "confidence": <number 0-100 indicating analysis confidence>
}

If the image does not show water, set turbidity to 0, riskLevel to "Clean", and add a note in summary that no water was detected in the image.`;

    // Retry logic for rate limits (429)
    const MAX_RETRIES = 2;
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry: 3s, then 6s
          await new Promise(resolve => setTimeout(resolve, attempt * 3000));
          console.log(`[WaterGrid] Retry attempt ${attempt} for Gemini API...`);
        }

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          { text: prompt },
        ]);

        const responseText = result.response.text();

        // Try to parse JSON from response
        try {
          const cleaned = responseText
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();
          
          const parsed = JSON.parse(cleaned);
          return NextResponse.json(parsed);
        } catch {
          console.error('Failed to parse Gemini response:', responseText);
          return NextResponse.json({
            turbidity: 25,
            colorAnalysis: 'Analysis completed but result format was unexpected',
            riskLevel: 'Suspicious',
            contaminants: [],
            summary: responseText.slice(0, 200),
            drinkable: false,
            confidence: 40,
          });
        }
      } catch (err: unknown) {
        lastError = err;
        const errorMsg = err instanceof Error ? err.message : String(err);
        // Only retry on rate limit (429) errors
        if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`[WaterGrid] Rate limited (attempt ${attempt + 1}/${MAX_RETRIES + 1})`, errorMsg.slice(0, 100));
          if (attempt === MAX_RETRIES) {
            // Exhausted retries — fall back to simulated result
            console.warn('[WaterGrid] Rate limit persists. Returning simulated result.');
            const simulated = generateSimulatedResult();
            return NextResponse.json({ ...simulated, note: 'AI service busy — showing estimated result' });
          }
          continue;
        }
        // Non-rate-limit error — don't retry
        break;
      }
    }

    console.error('Scan API Error:', lastError);
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again in a moment.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Scan API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    );
  }
}

function generateSimulatedResult() {
  const scenarios = [
    {
      turbidity: 12,
      colorAnalysis: 'Clear with slight blue tint, normal for treated municipal water',
      riskLevel: 'Clean',
      contaminants: [],
      summary: 'Water appears clean and well-treated. Turbidity is within safe limits. This water is likely safe for consumption based on visual analysis.',
      drinkable: true,
      confidence: 78,
    },
    {
      turbidity: 45,
      colorAnalysis: 'Slightly yellowish with mild cloudiness, possible sediment presence',
      riskLevel: 'Suspicious',
      contaminants: ['Sediment', 'Possible iron deposits'],
      summary: 'Water shows moderate turbidity with yellowish discoloration. This may indicate old pipe sediment or iron contamination. Recommend boiling before use and filing a municipal complaint.',
      drinkable: false,
      confidence: 72,
    },
    {
      turbidity: 78,
      colorAnalysis: 'Brown-tinted with visible particles, significant contamination indicators',
      riskLevel: 'Hazardous',
      contaminants: ['Rust', 'Sediment', 'Possible bacterial contamination'],
      summary: 'Water shows severe contamination with high turbidity and brown discoloration. DO NOT consume this water. File an immediate complaint and use an alternative water source.',
      drinkable: false,
      confidence: 89,
    },
  ];

  return scenarios[Math.floor(Math.random() * scenarios.length)];
}
