import { NextResponse } from 'next/server';

// Mock data for analytics (used when MongoDB is unavailable)
function getMockAnalytics() {
    return {
        totalComplaints: 1247,
        resolvedCount: 891,
        pendingCount: 298,
        criticalCount: 58,
        byCategory: {
            water: { total: 523, resolved: 387, critical: 24 },
            roads: { total: 312, resolved: 201, critical: 18 },
            electricity: { total: 245, resolved: 178, critical: 12 },
            sanitation: { total: 167, resolved: 125, critical: 4 },
        },
        byIssueType: {
            no_water: 189,
            low_pressure: 134,
            dirty_water: 112,
            leakage: 88,
            pothole: 145,
            broken_road: 98,
            flooding: 69,
            power_outage: 123,
            streetlight: 78,
            voltage_issue: 44,
            garbage: 82,
            drainage: 56,
            open_defecation: 29,
        },
        topAreas: [
            { name: 'Mumbai > Dharavi', count: 89 },
            { name: 'Delhi > Shahdara', count: 72 },
            { name: 'Chennai > Kodambakkam', count: 65 },
            { name: 'Bangalore > Whitefield', count: 58 },
            { name: 'Kolkata > Howrah', count: 51 },
        ],
        recentTrend: [
            { date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], count: 23 },
            { date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], count: 31 },
            { date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], count: 18 },
            { date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], count: 42 },
            { date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], count: 35 },
            { date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], count: 27 },
            { date: new Date().toISOString().split('T')[0], count: 19 },
        ],
        generatedAt: new Date().toISOString(),
    };
}

export async function GET() {
    try {
        // Try to connect to MongoDB for live data
        let clientModule;
        try {
            clientModule = await import('@/lib/mongodb');
        } catch {
            // MongoDB not configured, return mock data
            return NextResponse.json(getMockAnalytics());
        }

        const { db } = await clientModule.connectToDatabase();
        const complaints = db.collection('complaints');

        const totalComplaints = await complaints.countDocuments();

        if (totalComplaints === 0) {
            // No data in DB, return mock
            return NextResponse.json(getMockAnalytics());
        }

        // Aggregate by category
        const byCategoryAgg = await complaints.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: 1 },
                    resolved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0],
                        },
                    },
                    critical: {
                        $sum: {
                            $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0],
                        },
                    },
                },
            },
        ]).toArray();

        const byCategory: Record<string, { total: number; resolved: number; critical: number }> = {};
        for (const cat of byCategoryAgg) {
            byCategory[cat._id || 'water'] = { total: cat.total, resolved: cat.resolved, critical: cat.critical };
        }

        // Aggregate by issue type
        const byIssueTypeAgg = await complaints.aggregate([
            { $group: { _id: '$issueType', count: { $sum: 1 } } },
        ]).toArray();

        const byIssueType: Record<string, number> = {};
        for (const it of byIssueTypeAgg) {
            byIssueType[it._id] = it.count;
        }

        // Top areas
        const topAreasAgg = await complaints.aggregate([
            { $group: { _id: '$areaPath', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]).toArray();

        const topAreas = topAreasAgg.map((a) => ({ name: a._id, count: a.count }));

        // Recent trend (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        const trendAgg = await complaints.aggregate([
            { $match: { timestamp: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]).toArray();

        const recentTrend = trendAgg.map((t) => ({ date: t._id, count: t.count }));

        const resolvedCount = await complaints.countDocuments({ status: 'resolved' });
        const criticalCount = await complaints.countDocuments({ severity: 'critical' });
        const pendingCount = totalComplaints - resolvedCount;

        return NextResponse.json({
            totalComplaints,
            resolvedCount,
            pendingCount,
            criticalCount,
            byCategory,
            byIssueType,
            topAreas,
            recentTrend,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        // Fallback to mock data on any error
        return NextResponse.json(getMockAnalytics());
    }
}
