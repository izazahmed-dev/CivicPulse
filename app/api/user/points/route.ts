import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({ userId });

        return NextResponse.json({
            civicPoints: user?.civicPoints || 0
        });
    } catch (error) {
        console.error('GET user points error:', error);
        return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
    }
}
