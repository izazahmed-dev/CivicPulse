import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const complaints = await db
            .collection('complaints')
            .find({})
            .sort({ timestamp: -1 })
            .limit(200)
            .toArray();

        return NextResponse.json(complaints);
    } catch (error) {
        console.error('GET complaints error:', error);
        return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.issueType || !body.areaPath) {
            return NextResponse.json({ error: 'Issue type and area are required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        const complaint = {
            id: `WC-${Math.floor(Math.random() * 10000)}`,
            ...body,
            timestamp: Date.now(),
            status: 'OPEN',
        };

        await db.collection('complaints').insertOne(complaint);

        return NextResponse.json({ success: true, complaint });
    } catch (error) {
        console.error('POST complaint error:', error);
        return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 });
    }
}
