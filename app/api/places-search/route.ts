import { NextResponse } from 'next/server';

const SCRAPINGDOG_API_KEY = process.env.SCRAPINGDOG_API_KEY;
const BASE_URL = 'https://api.scrapingdog.com/google_maps';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ results: [] });
        }

        if (!SCRAPINGDOG_API_KEY) {
            return NextResponse.json(
                { error: 'SCRAPINGDOG_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Call ScrapingDog Google Maps Search API
        const url = `${BASE_URL}/?api_key=${SCRAPINGDOG_API_KEY}&query=${encodeURIComponent(query + ' India')}&page=0`;

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            console.error('[places-search] ScrapingDog error:', response.status);
            return NextResponse.json({ results: [] });
        }

        const data = await response.json();
        const searchResults = data?.search_results || [];

        // Transform to a clean format
        const results = searchResults.slice(0, 8).map((item: any) => ({
            title: item.title || '',
            address: item.address || '',
            placeId: item.place_id || '',
            lat: item.gps_coordinates?.latitude || 0,
            lng: item.gps_coordinates?.longitude || 0,
            type: item.type || '',
            rating: item.rating || 0,
        }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error('[places-search] Error:', error);
        return NextResponse.json({ results: [] });
    }
}
