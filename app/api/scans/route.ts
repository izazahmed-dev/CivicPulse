import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const scans = await db
            .collection('scans')
            .find({})
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json(scans);
    } catch (error) {
        console.error('GET scans error:', error);
        return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { db } = await connectToDatabase();

        const scan = {
            ...body,
            timestamp: Date.now(),
        };

        await db.collection('scans').insertOne(scan);

        return NextResponse.json({ success: true, scan });
    } catch (error) {
        console.error('POST scan error:', error);
        return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 });
    }
}
