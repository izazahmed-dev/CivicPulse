import { DEMO_AREAS } from "@/data/areas";
import { buildAreaSignals } from "@/lib/signals";
import { createId } from "@/lib/id";
import { readStore, writeStore } from "@/lib/demo-store";
import { IncidentRepository } from "@/lib/repository";
import {
  CreateIncidentInput,
  Incident,
  IncidentDetail,
  IncidentFilters,
  IncidentEvent,
  ProofSubmission,
  SubmitProofInput,
  UpdateIncidentInput,
} from "@/lib/types";
import { severityFromSubtype } from "@/lib/severity";

function matchesFilters(incident: Incident, filters?: IncidentFilters) {
  if (!filters) return true;
  if (filters.category && incident.category !== filters.category) return false;
  if (filters.areaId && incident.areaId !== filters.areaId) return false;
  if (filters.status && incident.status !== filters.status) return false;
  return true;
}

function createStatusEvent(incidentId: string, status: string, note: string, actorRole: IncidentEvent["actorRole"]): IncidentEvent {
  return {
    incidentId,
    type: status,
    actorRole,
    message: note,
    timestamp: Date.now(),
  };
}

export class DemoRepository implements IncidentRepository {
  async listIncidents(filters?: IncidentFilters) {
    const store = await readStore();
    return store.incidents
      .filter((incident) => matchesFilters(incident, filters))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getIncident(id: string): Promise<IncidentDetail | null> {
    const store = await readStore();
    const incident = store.incidents.find((entry) => entry.id === id);
    if (!incident) return null;

    return {
      incident,
      events: store.events.filter((entry) => entry.incidentId === id).sort((a, b) => a.timestamp - b.timestamp),
      proofs: store.proofs.filter((entry) => entry.incidentId === id).sort((a, b) => b.timestamp - a.timestamp),
    };
  }

  async createIncident(input: CreateIncidentInput): Promise<IncidentDetail> {
    const store = await readStore();
    const now = Date.now();

    const incident: Incident = {
      id: createId("FB"),
      category: input.category,
      subtype: input.subtype,
      language: input.language,
      rawTranscript: input.rawTranscript ?? "",
      description: input.description,
      lat: input.lat,
      lng: input.lng,
      areaId: input.areaId,
      areaLabel: input.areaLabel,
      media: input.media ?? [],
      severity: severityFromSubtype(input.category, input.subtype),
      status: "new",
      source: input.source,
      createdAt: now,
      updatedAt: now,
    };

    const event: IncidentEvent = {
      incidentId: incident.id,
      type: "created",
      actorRole: "citizen",
      message: "Citizen submitted a new incident through FieldBridge.",
      timestamp: now,
    };

    store.incidents.unshift(incident);
    store.events.push(event);
    await writeStore(store);

    return {
      incident,
      events: [event],
      proofs: [],
    };
  }

  async updateIncident(id: string, input: UpdateIncidentInput): Promise<IncidentDetail | null> {
    const store = await readStore();
    const incident = store.incidents.find((entry) => entry.id === id);
    if (!incident) return null;

    incident.status = input.status;
    incident.updatedAt = Date.now();

    store.events.push(
      createStatusEvent(
        incident.id,
        input.status,
        input.note || `Incident moved to ${input.status.replace("_", " ")}.`,
        input.actorRole ?? "operator",
      ),
    );

    await writeStore(store);
    return this.getIncident(id);
  }

  async submitProof(id: string, input: SubmitProofInput): Promise<IncidentDetail | null> {
    const store = await readStore();
    const incident = store.incidents.find((entry) => entry.id === id);
    if (!incident) return null;

    const proof: ProofSubmission = {
      id: createId("PF"),
      incidentId: id,
      submittedBy: input.submittedBy,
      media: input.media ?? [],
      note: input.note,
      verificationStatus: input.decision ?? "pending",
      timestamp: Date.now(),
    };

    store.proofs.unshift(proof);
    store.events.push({
      incidentId: id,
      type: "proof_submitted",
      actorRole: input.decision ? "operator" : "verifier",
      message: input.decision === "accepted"
        ? "Proof accepted and incident verified."
        : input.decision === "rejected"
          ? "Proof reviewed and rejected pending stronger evidence."
          : "Proof submitted for closure review.",
      timestamp: proof.timestamp,
    });

    if (input.decision === "accepted") {
      incident.status = "verified";
      incident.updatedAt = proof.timestamp;
      store.events.push(createStatusEvent(id, "verified", "Issue marked as verified after proof review.", "operator"));
    }

    if (input.decision === "rejected") {
      incident.updatedAt = proof.timestamp;
    }

    await writeStore(store);
    return this.getIncident(id);
  }

  async getAreaSignals() {
    const store = await readStore();
    const signals = buildAreaSignals(store.incidents);

    return signals.map((signal) => {
      const fallbackArea = DEMO_AREAS.find((area) => area.id === signal.areaId);
      return {
        ...signal,
        x: fallbackArea?.x ?? signal.x,
        y: fallbackArea?.y ?? signal.y,
      };
    });
  }
}

export const demoRepository = new DemoRepository();
