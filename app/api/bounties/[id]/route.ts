import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { db } = await connectToDatabase();

        const bounty = await db.collection('complaints').findOne({ id });

        if (!bounty) {
            return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
        }

        return NextResponse.json(bounty);
    } catch (error) {
        console.error('GET bounty error:', error);
        return NextResponse.json({ error: 'Failed to fetch bounty details' }, { status: 500 });
    }
}
