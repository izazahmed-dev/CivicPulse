'use server';

import { connectToDatabase } from '@/lib/mongodb';

export interface ForecastDataPoint {
    date: string;       // e.g., '2026-02-15'
    district: string;   // e.g., 'Mumbai'
    category: string;   // 'water' | 'roads' | 'electricity' | 'sanitation'
    count: number;
}

export async function getForecastData(): Promise<ForecastDataPoint[]> {
    try {
        const { db } = await connectToDatabase();
        
        // 30 days ago in milliseconds
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const pipeline = [
            // 1. Filter records from the last 30 days
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            // 2. Add derived fields: Convert timestamp to a format string 'YYYY-MM-DD'
            //    MongoDB's $dateToString expects a Date object, so $toDate converts the timestamp ms.
            {
                $addFields: {
                    formattedDate: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $toDate: "$timestamp" }
                        }
                    },
                    // Ensure district exists and is not empty, fallback to 'Unknown'
                    safeDistrict: { 
                        $cond: [ 
                            { $and: [ { $ne: ["$district", ""] }, { $ne: [{ $ifNull: ["$district", null] }, null] } ] }, 
                            "$district", 
                            "Unknown" 
                        ] 
                    },
                    // Ensure category exists, fallback to 'unspecified'
                    safeCategory: { $cond: [ { $ifNull: ["$category", false] }, "$category", "unspecified" ] }
                }
            },
            // 3. Group by the derived date, category, and district
            {
                $group: {
                    _id: {
                        date: "$formattedDate",
                        district: "$safeDistrict",
                        category: "$safeCategory"
                    },
                    count: { $sum: 1 }
                }
            },
            // 4. Project into our strongly typed structure
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    district: "$_id.district",
                    category: "$_id.category",
                    count: 1
                }
            },
            // 5. Sort chronologically by date
            {
                $sort: { date: 1 as const }
            }
        ];

        const results = await db.collection('complaints').aggregate(pipeline).toArray();
        
        return results as ForecastDataPoint[];
    } catch (error) {
        console.error('getForecastData error:', error);
        throw new Error('Failed to fetch forecast data from database');
    }
}
