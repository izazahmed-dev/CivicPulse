import { DEMO_AREAS } from "@/data/areas";
import { AreaSignal, Incident, RiskLevel } from "@/lib/types";

function riskFromScore(score: number): RiskLevel {
  if (score >= 8) return "critical";
  if (score >= 5) return "elevated";
  if (score >= 3) return "watch";
  return "stable";
}

export function buildAreaSignals(incidents: Incident[]): AreaSignal[] {
  const openStatuses = new Set(["new", "triaged", "in_progress", "resolved"]);

  return DEMO_AREAS.map((area) => {
    const areaIncidents = incidents.filter((incident) => incident.areaId === area.id);
    const openCount = areaIncidents.filter((incident) => openStatuses.has(incident.status)).length;
    const repeatCount = areaIncidents.length;
    const trendScore = openCount * 2 + Math.max(repeatCount - 1, 0);

    return {
      areaId: area.id,
      areaLabel: area.label,
      openCount,
      repeatCount,
      trendScore,
      riskLevel: riskFromScore(trendScore),
      x: area.x,
      y: area.y,
    };
  }).sort((a, b) => b.trendScore - a.trendScore);
}

