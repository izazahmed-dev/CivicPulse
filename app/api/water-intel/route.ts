import { NextResponse } from 'next/server';

const GEMINI_ANALYSIS_PROMPT = `You are an expert civic infrastructure intelligence analyst for CivicPulse, an Indian smart city platform.

You will receive scraped news snippets about dams, reservoirs, water supply, electricity, roads, and local infrastructure for a specific city/region.

Your job:
1. ANALYZE the content for civic supply signals (dam levels, releases, pipeline work, shortages, weather impacts, power grid status)
2. PREDICT the supply outlook for the next 48 hours
3. IDENTIFY specific risk factors and positive signals
4. RATE confidence based on how recent and relevant the sources are

Return ONLY valid JSON, no markdown or explanation:
{
  "cityAnalyzed": "<city name>",
  "overallRisk": "low|moderate|high|critical",
  "supplyPrediction": "normal|reduced|intermittent|severe_shortage",
  "confidenceScore": 0.0-1.0,
  "summary": "<2-3 sentence executive summary of supply outlook>",
  "riskFactors": [
    { "factor": "<risk description>", "severity": "low|medium|high", "source": "<which article>" }
  ],
  "positiveSignals": [
    { "signal": "<positive indicator>", "source": "<which article>" }
  ],
  "damStatus": {
    "level": "<percentage or description if found, else 'Unknown'>",
    "trend": "rising|stable|falling|unknown",
    "details": "<any specifics about dam/reservoir>"
  },
  "advisoryMessage": "<actionable advice for citizens>",
  "sourcesUsed": [
    { "title": "<article title>", "snippet": "<key excerpt>", "relevance": "high|medium|low" }
  ]
}

Rules:
- Focus on water supply, dam levels, reservoir status, pipeline infrastructure, and government announcements
- If no relevant news is found, still provide a reasonable prediction based on seasonal patterns
- Be conservative: if uncertain, lean toward "moderate" risk
- Always provide actionable advisory messages
- Rate confidence LOW if news is old or unrelated`;

// ─── Free web search using Google News RSS ───
async function searchGoogleNews(query: string): Promise<string> {
    const encodedQuery = encodeURIComponent(query);
    // Google News RSS feed — no API key needed
    const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`;

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CivicPulse/1.0)',
        },
    });

    if (!response.ok) {
        console.error(`[CivicIntel] Google News RSS error: ${response.status}`);
        return '';
    }

    const xml = await response.text();

    // Parse RSS XML to extract titles and descriptions
    const items: string[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < 8) {
        const itemXml = match[1];
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
        const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.trim() || '';

        if (title) {
            items.push(`### ${title}\nSource: ${source}\nDate: ${pubDate}`);
            count++;
        }
    }

    return items.join('\n\n');
}

// ─── Fallback: DuckDuckGo HTML search ───
async function searchDuckDuckGo(query: string): Promise<string> {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) return '';

        const html = await response.text();
        // Extract result snippets
        const results: string[] = [];
        const resultRegex = /<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        let match;
        let count = 0;

        while ((match = resultRegex.exec(html)) !== null && count < 5) {
            const title = match[1].replace(/<[^>]+>/g, '').trim();
            const snippet = match[2].replace(/<[^>]+>/g, '').trim();
            if (title) {
                results.push(`### ${title}\n${snippet}`);
                count++;
            }
        }

        return results.join('\n\n');
    } catch {
        return '';
    }
}

// ─── Jina AI Search (if key is available) ───
async function searchWithJina(query: string, apiKey: string): Promise<string> {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`https://s.jina.ai/${encodedQuery}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Jina search failed: ${response.status}`);
    }

    const data = await response.json();
    let content = '';
    if (data?.data && Array.isArray(data.data)) {
        content = data.data.map((item: any) => {
            const title = item.title || '';
            const text = item.content || item.description || '';
            const url = item.url || '';
            return `### ${title}\nSource: ${url}\n${text}`;
        }).join('\n\n');
    } else if (typeof data === 'string') {
        content = data;
    } else {
        content = JSON.stringify(data);
    }

    if (!content || content.trim().length < 20) {
        throw new Error('Jina returned empty results');
    }

    return content.slice(0, 6000);
}

// ─── Gemini Analysis (with retry for 429) ───
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

async function analyzeWithGemini(newsContent: string, city: string, geminiKey: string) {
    let lastError: Error | null = null;

    for (const model of GEMINI_MODELS) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    { text: GEMINI_ANALYSIS_PROMPT },
                                    { text: `\n\nCity/Region to analyze: ${city}\n\nHere is the scraped news content:\n\n${newsContent}\n\nAnalyze the above and return your civic supply intelligence as JSON:` },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 2048,
                            topP: 0.8,
                        },
                    }),
                }
            );

            if (response.status === 429) {
                console.warn(`[CivicIntel] Model ${model} quota exceeded, trying next...`);
                lastError = new Error(`${model} quota exceeded`);
                continue;
            }

            if (!response.ok) {
                const errText = await response.text();
                console.error(`[CivicIntel] Gemini ${model} error:`, response.status);
                lastError = new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
                continue;
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Gemini response');
            }

            console.log(`[CivicIntel] Analysis completed with model: ${model}`);
            return JSON.parse(jsonMatch[0]);
        } catch (err: any) {
            lastError = err;
            console.warn(`[CivicIntel] Model ${model} failed:`, err.message);
        }
    }

    throw lastError || new Error('All Gemini models failed');
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const city = url.searchParams.get('city') || 'Chennai';

        const geminiKey = process.env.GEMINI_API_KEY;
        const jinaKey = process.env.JINA_API_KEY; // Optional — falls back to free search

        if (!geminiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
        }

        // 1. Search for news using multiple queries
        const queries = [
            `${city} water supply dam reservoir level today 2026`,
            `${city} water shortage pipeline news`,
            `${city} municipal infrastructure maintenance`,
        ];

        let allNewsContent = '';

        for (const query of queries) {
            try {
                let result = '';

                // Try Jina first (if key available), then Google News RSS, then DuckDuckGo
                if (jinaKey) {
                    try {
                        result = await searchWithJina(query, jinaKey);
                    } catch (jinaErr) {
                        console.warn(`[CivicIntel] Jina failed for "${query}", falling back to free search`);
                    }
                }

                if (!result) {
                    result = await searchGoogleNews(query);
                }

                if (!result) {
                    result = await searchDuckDuckGo(query);
                }

                if (result) {
                    allNewsContent += `\n\n=== Search: "${query}" ===\n${result}`;
                }
            } catch (err) {
                console.error(`[CivicIntel] All search methods failed for "${query}":`, err);
            }
        }

        if (!allNewsContent.trim()) {
            // Generate a reasonable analysis even without news by asking Gemini directly
            allNewsContent = `No recent news articles were found for ${city}. Please provide a general seasonal water supply assessment based on your knowledge of ${city}'s typical water infrastructure, considering the current month (March) and typical weather patterns.`;
        }

        // 2. Analyze with Gemini
        const analysis = await analyzeWithGemini(allNewsContent, city, geminiKey);

        return NextResponse.json({
            success: true,
            analysis,
            scrapedAt: new Date().toISOString(),
            queriesUsed: queries,
        });
    } catch (error: any) {
        console.error('[CivicIntel] Server error:', error);
        let userMessage = 'Failed to generate civic intelligence. Please try again.';
        const msg = error?.message || '';
        if (msg.includes('429') || msg.includes('quota')) {
            userMessage = 'AI analysis quota temporarily exceeded. Please wait 60 seconds and try again.';
        } else if (msg.includes('fetch') || msg.includes('network')) {
            userMessage = 'Could not reach news sources. Please check your internet connection and try again.';
        }
        return NextResponse.json(
            { error: userMessage },
            { status: 500 }
        );
    }
}
