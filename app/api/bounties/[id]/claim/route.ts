import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        if (!body.userId) {
            return NextResponse.json({ error: 'User ID is required to claim a bounty' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // Check if bounty is still available
        const bounty = await db.collection('complaints').findOne({ id });

        if (!bounty) {
            return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
        }

        if (bounty.status !== 'OPEN' || bounty.claimedBy) {
            return NextResponse.json({ error: 'Bounty is already claimed or not open' }, { status: 400 });
        }

        // Claim the bounty
        await db.collection('complaints').updateOne(
            { id },
            {
                $set: {
                    status: 'IN_PROGRESS',
                    claimedBy: body.userId,
                    claimedAt: Date.now()
                }
            }
        );

        return NextResponse.json({ success: true, message: 'Bounty claimed successfully' });
    } catch (error) {
        console.error('POST claim bounty error:', error);
        return NextResponse.json({ error: 'Failed to claim bounty' }, { status: 500 });
    }
}
