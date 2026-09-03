import { SUBTYPE_OPTIONS } from "@/lib/constants";
import { IncidentCategory, IncidentSeverity } from "@/lib/types";

export function severityFromSubtype(category: IncidentCategory, subtype: string): IncidentSeverity {
  const match = SUBTYPE_OPTIONS[category].find((option) => option.value === subtype);
  return match?.severity ?? "medium";
}

