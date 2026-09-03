import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Demo seed data — inserted when the collection is empty
const DEMO_POSTS = [
    {
        id: 'cp-1001',
        author: { name: 'Priya Sharma', avatar: 'PS', phone: '9876543210' },
        area: 'Adyar, Gandhi Nagar',
        city: 'Chennai',
        message: "No water supply since 6 AM today. Multiple houses in our street are affected. The tanker hasn't arrived either. Anyone else facing this?",
        timestamp: Date.now() - 3600000,
        upvotes: 24,
        upvotedBy: ['a', 'b', 'c'],
        replies: [
            { id: 'cr-1', author: { name: 'Rajesh Kumar', avatar: 'RK', phone: '9876543211' }, message: "Same here, 2nd Main Road. I've already filed a complaint on CivicPulse. Complaint ID: WC-4821.", timestamp: Date.now() - 3200000 },
            { id: 'cr-2', author: { name: 'Lakshmi V', avatar: 'LV', phone: '9876543212' }, message: "Update: Municipal office said supply will resume by 2 PM. Pipeline repair underway near Elliot's Beach.", timestamp: Date.now() - 1800000 },
        ],
        tag: 'issue',
    },
    {
        id: 'cp-1002',
        author: { name: 'Amit Patel', avatar: 'AP', phone: '9876543220' },
        area: 'T. Nagar, Pondy Bazaar',
        city: 'Chennai',
        message: "Water quality has significantly improved after last week's pipe replacement. The CivicPulse scan shows clean results now! Great work by the civic team. 💧✅",
        timestamp: Date.now() - 86400000,
        upvotes: 31,
        upvotedBy: ['d', 'e', 'f'],
        replies: [
            { id: 'cr-3', author: { name: 'Sunitha R', avatar: 'SR', phone: '9876543221' }, message: 'Confirmed! My scan also shows turbidity at 8. Finally safe water after months. 🎉', timestamp: Date.now() - 72000000 },
        ],
        tag: 'update',
    },
    {
        id: 'cp-1003',
        author: { name: 'Kavitha M', avatar: 'KM', phone: '9876543230' },
        area: 'Andheri West, Lokhandwala',
        city: 'Mumbai',
        message: 'Pro tip: If your water pressure is low in the morning, check if your building motor is running. Many societies have scheduled timings. You can ask your maintenance for the exact hours.',
        timestamp: Date.now() - 172800000,
        upvotes: 18,
        upvotedBy: ['g', 'h'],
        replies: [],
        tag: 'tip',
    },
    {
        id: 'cp-1004',
        author: { name: 'Deepak Raj', avatar: 'DR', phone: '9876543240' },
        area: 'Saket',
        city: 'New Delhi',
        message: "Does anyone know the schedule for tanker delivery in Saket area? We've been getting irregular supply for 3 days now.",
        timestamp: Date.now() - 259200000,
        upvotes: 9,
        upvotedBy: ['i'],
        replies: [
            { id: 'cr-4', author: { name: 'Neha Gupta', avatar: 'NG', phone: '9876543241' }, message: 'Call the DJB helpline at 1916. They can give you the exact schedule for your zone.', timestamp: Date.now() - 240000000 },
        ],
        tag: 'question',
    },
    {
        id: 'cp-1005',
        author: { name: 'Arun S', avatar: 'AS', phone: '9876543250' },
        area: 'Adyar, Kasturba Nagar',
        city: 'Chennai',
        message: "⚠️ WARNING: Brown water coming from taps in Canal Bank Road area. Water scan showed turbidity of 72 and hazardous rating. Do NOT drink this water. I've filed complaint WC-7283.",
        timestamp: Date.now() - 7200000,
        upvotes: 42,
        upvotedBy: ['j', 'k', 'l', 'm'],
        replies: [
            { id: 'cr-5', author: { name: 'Meena K', avatar: 'MK', phone: '9876543251' }, message: 'Thank you for the alert! I was about to use it for cooking. Filing my complaint now too.', timestamp: Date.now() - 5400000 },
            { id: 'cr-6', author: { name: 'Srinivas P', avatar: 'SP', phone: '9876543252' }, message: 'Metro construction might have damaged the pipeline. Same thing happened on LB Road last month.', timestamp: Date.now() - 3600000 },
        ],
        tag: 'issue',
    },
];

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('community_posts');

        // Seed demo data if empty
        const count = await collection.countDocuments();
        if (count === 0) {
            await collection.insertMany(DEMO_POSTS);
        }

        const posts = await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('GET community error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.message || !body.area || !body.author) {
            return NextResponse.json({ error: 'Message, area, and author are required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        const post = {
            id: `cp-${Date.now()}`,
            author: { 
                name: body.author.name, 
                avatar: body.author.avatar, 
                phone: body.author.phone,
                badges: body.author.badges || [] 
            },
            area: body.area,
            city: body.area.split(',')[0]?.trim() || 'Unknown',
            message: body.message,
            image: body.image || null,
            timestamp: Date.now(),
            upvotes: 0,
            upvotedBy: [],
            replies: [],
            tag: body.tag || 'issue',
        };

        await db.collection('community_posts').insertOne(post);
        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error('POST community error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
