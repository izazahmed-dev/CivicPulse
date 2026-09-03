import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const { db } = await connectToDatabase();

        // Fetch complaints that are OPEN and not yet claimed
        const bounties = await db
            .collection('complaints')
            .find({
                status: 'OPEN',
                claimedBy: { $exists: false }
            })
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        // Add a mock 'reward' field to each bounty if it doesn't have one
        const enrichedBounties = bounties.map(b => ({
            ...b,
            reward: b.reward || 10 + Math.floor(Math.random() * 40) // Random reward between 10 and 50 points
        }));

        return NextResponse.json(enrichedBounties);
    } catch (error) {
        console.error('GET bounties error:', error);
        return NextResponse.json({ error: 'Failed to fetch bounties' }, { status: 500 });
    }
}
