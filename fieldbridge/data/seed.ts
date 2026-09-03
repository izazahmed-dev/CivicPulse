import { DEMO_AREAS } from "@/data/areas";
import { createId } from "@/lib/id";
import { DemoStoreState, Incident, IncidentEvent, ProofSubmission } from "@/lib/types";

function makeIncident(partial: Partial<Incident> & Pick<Incident, "category" | "subtype" | "description" | "areaId" | "areaLabel" | "lat" | "lng" | "severity" | "status" | "source" | "language" | "rawTranscript">, ageHours: number): Incident {
  const now = Date.now();
  const createdAt = now - ageHours * 60 * 60 * 1000;
  return {
    id: createId("FB"),
    media: [],
    createdAt,
    updatedAt: createdAt,
    ...partial,
  };
}

const adyar = DEMO_AREAS.find((area) => area.id === "adyar")!;
const velachery = DEMO_AREAS.find((area) => area.id === "velachery")!;
const besantNagar = DEMO_AREAS.find((area) => area.id === "besant_nagar")!;
const tNagar = DEMO_AREAS.find((area) => area.id === "t_nagar")!;

const incidents: Incident[] = [
  makeIncident({
    category: "water",
    subtype: "no_supply",
    description: "No water has reached our apartment block since early morning.",
    areaId: adyar.id,
    areaLabel: adyar.label,
    lat: adyar.lat,
    lng: adyar.lng,
    severity: "critical",
    status: "new",
    source: "voice",
    language: "ta",
    rawTranscript: "காலை முதல் தண்ணீர் வரவில்லை",
  }, 2),
  makeIncident({
    category: "water",
    subtype: "dirty_water",
    description: "Brown water is coming from taps near the bus depot.",
    areaId: besantNagar.id,
    areaLabel: besantNagar.label,
    lat: besantNagar.lat,
    lng: besantNagar.lng,
    severity: "critical",
    status: "triaged",
    source: "text",
    language: "en",
    rawTranscript: "Brown water from taps near the bus depot",
  }, 6),
  makeIncident({
    category: "sanitation",
    subtype: "drain_overflow",
    description: "Storm drain is overflowing into the street after last night rain.",
    areaId: velachery.id,
    areaLabel: velachery.label,
    lat: velachery.lat,
    lng: velachery.lng,
    severity: "critical",
    status: "in_progress",
    source: "text",
    language: "en",
    rawTranscript: "Storm drain overflowing into the street",
  }, 10),
  makeIncident({
    category: "sanitation",
    subtype: "garbage_pileup",
    description: "Garbage pile has not been cleared for three collection cycles.",
    areaId: tNagar.id,
    areaLabel: tNagar.label,
    lat: tNagar.lat,
    lng: tNagar.lng,
    severity: "high",
    status: "resolved",
    source: "text",
    language: "hi",
    rawTranscript: "कचरे का ढेर तीन दिन से पड़ा है",
  }, 16),
];

const events: IncidentEvent[] = incidents.flatMap((incident) => {
  const created = {
    incidentId: incident.id,
    type: "created",
    actorRole: "citizen" as const,
    message: "Incident submitted through FieldBridge.",
    timestamp: incident.createdAt,
  };

  if (incident.status === "new") return [created];
  if (incident.status === "triaged") {
    return [
      created,
      {
        incidentId: incident.id,
        type: "triaged",
        actorRole: "operator",
        message: "Issue reviewed and grouped into the current response queue.",
        timestamp: incident.createdAt + 30 * 60 * 1000,
      },
    ];
  }

  if (incident.status === "in_progress") {
    return [
      created,
      {
        incidentId: incident.id,
        type: "triaged",
        actorRole: "operator",
        message: "Issue marked for field dispatch after cluster review.",
        timestamp: incident.createdAt + 20 * 60 * 1000,
      },
      {
        incidentId: incident.id,
        type: "in_progress",
        actorRole: "operator",
        message: "A field response team has been assigned.",
        timestamp: incident.createdAt + 80 * 60 * 1000,
      },
    ];
  }

  return [
    created,
    {
      incidentId: incident.id,
      type: "triaged",
      actorRole: "operator",
      message: "Operator confirmed route and sanitation contractor coverage.",
      timestamp: incident.createdAt + 45 * 60 * 1000,
    },
    {
      incidentId: incident.id,
      type: "in_progress",
      actorRole: "operator",
      message: "Crew dispatched for on-ground clearance.",
      timestamp: incident.createdAt + 90 * 60 * 1000,
    },
    {
      incidentId: incident.id,
      type: "resolved",
      actorRole: "operator",
      message: "Initial cleanup completed and site marked for proof confirmation.",
      timestamp: incident.createdAt + 4 * 60 * 60 * 1000,
    },
  ];
});

const resolvedIncident = incidents.find((incident) => incident.status === "resolved")!;
const proofs: ProofSubmission[] = [
  {
    id: createId("PF"),
    incidentId: resolvedIncident.id,
    submittedBy: "Ward volunteer",
    media: [],
    note: "Street view looks cleared. Waiting for final operator sign-off.",
    verificationStatus: "pending",
    timestamp: resolvedIncident.updatedAt + 30 * 60 * 1000,
  },
];

export const INITIAL_STORE_STATE: DemoStoreState = {
  incidents,
  events,
  proofs,
};

