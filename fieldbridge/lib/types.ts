export type IncidentCategory = "water" | "sanitation";
export type IncidentStatus = "new" | "triaged" | "in_progress" | "resolved" | "verified";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentSource = "text" | "voice";
export type ActorRole = "citizen" | "operator" | "verifier" | "system";
export type VerificationStatus = "pending" | "accepted" | "rejected";
export type RiskLevel = "stable" | "watch" | "elevated" | "critical";
export type LanguageCode = "en" | "ta" | "hi";

export interface Incident {
  id: string;
  category: IncidentCategory;
  subtype: string;
  language: LanguageCode;
  rawTranscript: string;
  description: string;
  lat: number;
  lng: number;
  areaId: string;
  areaLabel: string;
  media: string[];
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: IncidentSource;
  createdAt: number;
  updatedAt: number;
}

export interface IncidentEvent {
  incidentId: string;
  type: string;
  actorRole: ActorRole;
  message: string;
  timestamp: number;
}

export interface ProofSubmission {
  id: string;
  incidentId: string;
  submittedBy: string;
  media: string[];
  note: string;
  verificationStatus: VerificationStatus;
  timestamp: number;
}

export interface AreaSignal {
  areaId: string;
  areaLabel: string;
  openCount: number;
  repeatCount: number;
  trendScore: number;
  riskLevel: RiskLevel;
  x: number;
  y: number;
}

export interface IncidentDetail {
  incident: Incident;
  events: IncidentEvent[];
  proofs: ProofSubmission[];
}

export interface DemoStoreState {
  incidents: Incident[];
  events: IncidentEvent[];
  proofs: ProofSubmission[];
}

export interface IncidentFilters {
  category?: IncidentCategory;
  areaId?: string;
  status?: IncidentStatus;
}

export interface CreateIncidentInput {
  category: IncidentCategory;
  subtype: string;
  language: LanguageCode;
  rawTranscript?: string;
  description: string;
  lat: number;
  lng: number;
  areaId: string;
  areaLabel: string;
  media?: string[];
  source: IncidentSource;
}

export interface UpdateIncidentInput {
  status: IncidentStatus;
  note: string;
  actorRole?: ActorRole;
}

export interface SubmitProofInput {
  note: string;
  media?: string[];
  submittedBy: string;
  decision?: VerificationStatus;
}

export interface ParsedVoicePayload {
  category: IncidentCategory;
  subtype: string;
  description: string;
  severity: IncidentSeverity;
  transcript: string;
}

