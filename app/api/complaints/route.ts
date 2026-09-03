import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Simple auth check — verify user identity from request headers
function getAuthUser(req: NextRequest) {
    const userHeader = req.headers.get('x-user-phone');
    return userHeader || null;
}

// Generate unique complaint ID
function generateComplaintId() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CP-${ts}-${rand}`;
}

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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.issueType || !body.areaPath) {
            return NextResponse.json({ error: 'Issue type and area are required' }, { status: 400 });
        }

        // Sanitize: only allow known fields
        const allowedFields = ['category', 'issueType', 'description', 'areaPath', 'area', 'lat', 'lng', 'image'];
        const sanitized: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }

        const { db } = await connectToDatabase();

        const complaint = {
            id: generateComplaintId(),
            ...sanitized,
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
