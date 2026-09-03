import {
  AreaSignal,
  CreateIncidentInput,
  Incident,
  IncidentDetail,
  IncidentFilters,
  SubmitProofInput,
  UpdateIncidentInput,
} from "@/lib/types";

export interface IncidentRepository {
  listIncidents(filters?: IncidentFilters): Promise<Incident[]>;
  getIncident(id: string): Promise<IncidentDetail | null>;
  createIncident(input: CreateIncidentInput): Promise<IncidentDetail>;
  updateIncident(id: string, input: UpdateIncidentInput): Promise<IncidentDetail | null>;
  submitProof(id: string, input: SubmitProofInput): Promise<IncidentDetail | null>;
  getAreaSignals(): Promise<AreaSignal[]>;
}

