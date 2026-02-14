import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
    try {
        const { phone, name, avatar, joinedAt } = await req.json();

        if (!phone || !name) {
            return NextResponse.json({ error: 'Phone and name are required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const users = db.collection('users');

        // Upsert — update if exists, insert if new
        const result = await users.updateOne(
            { phone },
            {
                $set: { phone, name, avatar, joinedAt, updatedAt: Date.now() },
                $setOnInsert: { createdAt: Date.now() },
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, upserted: result.upsertedCount > 0 });
    } catch (error) {
        console.error('Auth register error:', error);
        return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
    }
}
