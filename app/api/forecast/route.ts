import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

interface AreaForecast {
    area: string;
    riskScore: number; // 0-100
    prediction: 'full_supply' | 'low_pressure' | 'intermittent' | 'dry_taps';
    probability: number;
    complaintCount: number;
    recentReports: number;
    schedule: string;
    forecast5Day: DayForecast[];
}

interface DayForecast {
    day: string;
    date: string;
    prediction: 'full_supply' | 'low_pressure' | 'intermittent' | 'dry_taps';
    probability: number;
    reason: string;
}

const MUNICIPAL_SCHEDULES: Record<string, string[]> = {
    'Reservoir Cleaning': ['Monday', 'Thursday'],
    'Pipeline Maintenance': ['Wednesday'],
    'Pump Station Service': ['Saturday'],
};

function getDayName(offset: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return days[d.getDay()];
}

function getDateStr(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function computePrediction(riskScore: number): 'full_supply' | 'low_pressure' | 'intermittent' | 'dry_taps' {
    if (riskScore >= 75) return 'dry_taps';
    if (riskScore >= 50) return 'intermittent';
    if (riskScore >= 25) return 'low_pressure';
    return 'full_supply';
}

function getMaintenanceReason(dayName: string): string | null {
    for (const [reason, days] of Object.entries(MUNICIPAL_SCHEDULES)) {
        if (days.includes(dayName)) return reason;
    }
    return null;
}

export async function GET() {
    try {
        const { db } = await connectToDatabase();

        // Get complaints from last 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const complaints = await db
            .collection('complaints')
            .find({ timestamp: { $gte: weekAgo } })
            .toArray();

        // Aggregate complaints by area
        const areaCounts: Record<string, { total: number; recent: number; types: Record<string, number> }> = {};

        complaints.forEach((c: any) => {
            const area = c.area || c.selectedAreaName || c.areaPath || 'Unknown';
            if (!areaCounts[area]) {
                areaCounts[area] = { total: 0, recent: 0, types: {} };
            }
            areaCounts[area].total++;
            // Last 24 hours
            if (c.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
                areaCounts[area].recent++;
            }
            const type = c.issueType || 'unknown';
            areaCounts[area].types[type] = (areaCounts[area].types[type] || 0) + 1;
        });

        // If no real data, generate demo areas
        const demoAreas = [
            'Adyar, Gandhi Nagar', 'T. Nagar, Pondy Bazaar', 'Anna Nagar East',
            'Velachery Main Road', 'Besant Nagar', 'Mylapore', 'Chromepet',
            'Tambaram West', 'Kodambakkam', 'Guindy Industrial'
        ];

        if (Object.keys(areaCounts).length < 3) {
            demoAreas.forEach((area, i) => {
                if (!areaCounts[area]) {
                    const seed = (area.charCodeAt(0) * 7 + i * 13) % 100;
                    areaCounts[area] = {
                        total: Math.floor(seed / 10),
                        recent: Math.floor(seed / 25),
                        types: {
                            no_water: Math.floor(seed / 20),
                            low_pressure: Math.floor(seed / 30),
                            dirty_water: Math.floor(seed / 40),
                        }
                    };
                }
            });
        }

        // Build forecasts
        const forecasts: AreaForecast[] = Object.entries(areaCounts).map(([area, data]) => {
            // Base risk from complaint density
            const baseRisk = Math.min(100, (data.total * 8) + (data.recent * 15));
            // Higher risk for no_water and dirty_water complaints
            const criticalBoost = ((data.types['no_water'] || 0) + (data.types['dirty_water'] || 0)) * 10;
            const riskScore = Math.min(100, baseRisk + criticalBoost);

            // Generate 5-day forecast
            const forecast5Day: DayForecast[] = [];
            for (let i = 0; i < 5; i++) {
                const dayName = getDayName(i + 1);
                const maintenanceReason = getMaintenanceReason(dayName);
                // Add variance per day + maintenance schedule impact
                const dayVariance = ((area.charCodeAt(0) * (i + 1) * 17) % 30) - 15;
                const maintenanceImpact = maintenanceReason ? 20 : 0;
                const dayRisk = Math.max(0, Math.min(100, riskScore + dayVariance + maintenanceImpact));

                forecast5Day.push({
                    day: dayName,
                    date: getDateStr(i + 1),
                    prediction: computePrediction(dayRisk),
                    probability: Math.round(dayRisk),
                    reason: maintenanceReason
                        ? `${maintenanceReason} scheduled`
                        : dayRisk > 60
                            ? `${data.recent} recent reports in area`
                            : 'Normal supply expected',
                });
            }

            return {
                area,
                riskScore: Math.round(riskScore),
                prediction: computePrediction(riskScore),
                probability: Math.round(riskScore),
                complaintCount: data.total,
                recentReports: data.recent,
                schedule: 'Normal',
                forecast5Day,
            };
        });

        // Sort by risk score descending
        forecasts.sort((a, b) => b.riskScore - a.riskScore);

        return NextResponse.json(forecasts);
    } catch (error) {
        console.error('GET forecast error:', error);
        return NextResponse.json({ error: 'Failed to compute forecast' }, { status: 500 });
    }
}
