const { MongoClient } = require('mongodb');
const fs = require('fs');

// Load env from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
let mongoUri = '';

envFile.split('\n').forEach(line => {
    if (line.startsWith('MONGODB_URI=')) {
        mongoUri = line.replace('MONGODB_URI=', '').trim();
    }
});

if (!mongoUri) {
    console.error("No MONGODB_URI found in .env.local");
    process.exit(1);
}

async function testPipeline() {
    console.log("Connecting to MongoDB...");
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const db = client.db();

        console.log("Running aggregation pipeline...");

        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const pipeline = [
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $addFields: {
                    formattedDate: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $toDate: "$timestamp" }
                        }
                    },
                    safeDistrict: { 
                        $cond: [ 
                            { $and: [ { $ne: ["$district", ""] }, { $ne: [{ $ifNull: ["$district", null] }, null] } ] }, 
                            "$district", 
                            "Unknown" 
                        ] 
                    },
                    safeCategory: { $cond: [ { $ifNull: ["$category", false] }, "$category", "unspecified" ] }
                }
            },
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
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    district: "$_id.district",
                    category: "$_id.category",
                    count: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ];

        const results = await db.collection('complaints').aggregate(pipeline).toArray();
        console.log(`\nFound ${results.length} grouped data points for the last 30 days:`);

        if (results.length > 0) {
            console.log(JSON.stringify(results.slice(0, 5), null, 2));
            if (results.length > 5) {
                console.log(`... and ${results.length - 5} more.`);
            }
        } else {
            console.log("No data found in the last 30 days.");
        }
    } finally {
        await client.close();
        console.log("Connection closed.");
    }
}

testPipeline().catch(console.error);
