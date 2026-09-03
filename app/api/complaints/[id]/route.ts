import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

interface StatusHistory {
    status: string;
    timestamp: number;
    note: string;
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { db } = await connectToDatabase();

        const complaint = await db.collection('complaints').findOne({ id });

        if (!complaint) {
            // Return a demo complaint for showcase
            return NextResponse.json({
                id,
                area: 'Adyar, Gandhi Nagar',
                areaPath: 'Tamil Nadu > Chennai > Adyar > Gandhi Nagar',
                lat: 13.0067,
                lng: 80.2574,
                issueType: 'no_water',
                description: 'No water supply since morning. Multiple houses affected.',
                timestamp: Date.now() - 3600000,
                status: 'VERIFIED',
                verifications: 5,
                statusHistory: [
                    { status: 'REPORTED', timestamp: Date.now() - 3600000, note: 'Issue submitted by citizen' },
                    { status: 'VERIFIED', timestamp: Date.now() - 2400000, note: 'Confirmed by 5 neighbors' },  
                ],
            });
        }

        return NextResponse.json(complaint);
    } catch (error) {
        console.error('GET complaint by ID error:', error);
        return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { db } = await connectToDatabase();

        if (body.action === 'verify') {
            // Increment verification count
            const newHistory: StatusHistory = {
                status: 'VERIFIED',
                timestamp: Date.now(),
                note: `Verified by neighbor (${body.userName || 'Anonymous'})`,
            };

            await db.collection('complaints').updateOne(
                { id },
                {
                    $inc: { verifications: 1 },
                    $set: { status: 'VERIFIED' },
                    $push: {
                        statusHistory: newHistory as any, // MongoDB types sometimes need this or proper generic, but using a typed variable is better
                    },
                }
            );
            return NextResponse.json({ success: true });
        }

        if (body.action === 'updateStatus') {
            const newHistory: StatusHistory = {
                status: body.status,
                timestamp: Date.now(),
                note: body.note || '',
            };

            await db.collection('complaints').updateOne(
                { id },
                {
                    $set: { status: body.status },
                    $push: {
                        statusHistory: newHistory as any,
                    },
                }
            );
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        console.error('PATCH complaint error:', error);
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
    }
}
