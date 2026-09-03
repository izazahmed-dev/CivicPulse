import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

interface NeighborhoodScore {
    name: string;
    city: string;
    litersSaved: number;
    reportsCount: number;
    resolvedCount: number;
    activeUsers: number;
    rank: number;
    weeklyChange: number;
    badges: string[];
}

const BADGE_DEFINITIONS = [
    { id: 'hydro_hero', name: 'Hydro Hero', emoji: '🦸', minReports: 10 },
    { id: 'leak_detective', name: 'Leak Detective', emoji: '🔍', minReports: 5 },
    { id: 'rain_guardian', name: 'Rain Guardian', emoji: '🌧️', minReports: 3 },
    { id: 'water_warrior', name: 'Water Warrior', emoji: '⚔️', minReports: 15 },
    { id: 'pipe_protector', name: 'Pipe Protector', emoji: '🛡️', minReports: 8 },
];

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const complaints = await db
            .collection('complaints')
            .find({ timestamp: { $gte: weekAgo } })
            .toArray();

        // Aggregate by area
        const areaData: Record<string, { reports: number; resolved: number; users: Set<string> }> = {};

        complaints.forEach((c: any) => {
            const area = c.area || c.selectedAreaName || 'Unknown';
            if (!areaData[area]) {
                areaData[area] = { reports: 0, resolved: 0, users: new Set() };
            }
            areaData[area].reports++;
            if (c.status === 'RESOLVED') areaData[area].resolved++;
            if (c.userPhone) areaData[area].users.add(c.userPhone);
        });

        // Demo data if not enough
        const demoNeighborhoods = [
            { name: 'Kasturba Nagar', city: 'Chennai' },
            { name: 'Gandhi Nagar', city: 'Chennai' },
            { name: 'Anna Nagar East', city: 'Chennai' },
            { name: 'T. Nagar', city: 'Chennai' },
            { name: 'Besant Nagar', city: 'Chennai' },
            { name: 'Velachery', city: 'Chennai' },
            { name: 'Mylapore', city: 'Chennai' },
            { name: 'Chromepet', city: 'Chennai' },
            { name: 'Lokhandwala', city: 'Mumbai' },
            { name: 'Saket', city: 'New Delhi' },
        ];

        const leaderboard: NeighborhoodScore[] = demoNeighborhoods.map((n, i) => {
            const data = areaData[n.name] || { reports: 0, resolved: 0, users: new Set() };
            const seed = (n.name.charCodeAt(0) * 13 + i * 7) % 100;
            const reportsCount = data.reports || Math.floor(seed / 5) + 3;
            const resolvedCount = data.resolved || Math.floor(reportsCount * 0.7);
            const activeUsers = data.users.size || Math.floor(seed / 8) + 5;
            const litersSaved = Math.floor((resolvedCount * 2000) + (seed * 500));

            // Assign badges based on activity
            const badges: string[] = [];
            BADGE_DEFINITIONS.forEach(badge => {
                if (reportsCount >= badge.minReports) badges.push(badge.id);
            });

            return {
                name: n.name,
                city: n.city,
                litersSaved,
                reportsCount,
                resolvedCount,
                activeUsers,
                rank: 0,
                weeklyChange: Math.floor(Math.random() * 5) - 2,
                badges,
            };
        });

        // Sort by liters saved and assign ranks
        leaderboard.sort((a, b) => b.litersSaved - a.litersSaved);
        leaderboard.forEach((n, i) => { n.rank = i + 1; });

        return NextResponse.json({
            leaderboard,
            totalLitersSaved: leaderboard.reduce((s, n) => s + n.litersSaved, 0),
            totalReports: leaderboard.reduce((s, n) => s + n.reportsCount, 0),
            badges: BADGE_DEFINITIONS,
        });
    } catch (error) {
        console.error('GET leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
