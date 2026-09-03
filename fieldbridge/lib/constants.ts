import { IncidentCategory, IncidentSeverity, IncidentStatus, LanguageCode } from "@/lib/types";

export const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  water: "Water",
  sanitation: "Sanitation",
};

export const SUBTYPE_OPTIONS: Record<IncidentCategory, { value: string; label: string; severity: IncidentSeverity }[]> = {
  water: [
    { value: "no_supply", label: "No water supply", severity: "critical" },
    { value: "dirty_water", label: "Dirty or unsafe water", severity: "critical" },
    { value: "leakage", label: "Leakage / pipeline burst", severity: "high" },
    { value: "low_pressure", label: "Low pressure", severity: "medium" },
  ],
  sanitation: [
    { value: "garbage_pileup", label: "Garbage pile-up", severity: "high" },
    { value: "drain_overflow", label: "Drainage overflow", severity: "critical" },
    { value: "public_bin_missed", label: "Missed collection", severity: "medium" },
    { value: "sewage_smell", label: "Sewage smell / leak", severity: "high" },
  ],
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  new: "Submitted",
  triaged: "Being Reviewed",
  in_progress: "Team Dispatched",
  resolved: "Resolved",
  verified: "Verified",
};

export const STATUS_ORDER: IncidentStatus[] = ["new", "triaged", "in_progress", "resolved", "verified"];

