/**
 * Static fictional sample data for the GitHub Pages showcase build — never real user data.
 * See specs/001-personal-health-vault/research.md #10 and data-model.md "Web demo fixtures".
 */
import type {
  AiInterpretationRecord,
  DocumentRecord,
  HealthRecord,
  Profile,
} from "../../src/models/types";

export const DEMO_PROFILE: Profile = {
  id: "demo-profile",
  displayName: "Alex Rivera (Demo)",
  relationship: "self",
  dbFileRef: "demo-only, not a real database",
  createdAt: "2025-01-06T09:00:00.000Z",
  lastAccessedAt: new Date().toISOString(),
};

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const DEMO_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: "demo-record-1",
    profileId: DEMO_PROFILE.id,
    category: "vitals",
    metricType: "blood_pressure_systolic",
    value: 118,
    unit: "mmHg",
    recordedAt: daysAgo(2),
    source: "manual",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "demo-record-2",
    profileId: DEMO_PROFILE.id,
    category: "vitals",
    metricType: "blood_pressure_systolic",
    value: 124,
    unit: "mmHg",
    recordedAt: daysAgo(35),
    source: "manual",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "demo-record-3",
    profileId: DEMO_PROFILE.id,
    category: "vitals",
    metricType: "weight",
    value: 71.4,
    unit: "kg",
    recordedAt: daysAgo(1),
    source: "manual",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: "demo-record-4",
    profileId: DEMO_PROFILE.id,
    category: "labs",
    metricType: "ldl_cholesterol",
    value: 96,
    unit: "mg/dL",
    recordedAt: daysAgo(60),
    notes: "Annual physical panel",
    source: "imported",
    relatedDocumentId: "demo-document-1",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(60),
  },
  {
    id: "demo-record-5",
    profileId: DEMO_PROFILE.id,
    category: "medications",
    metricType: "atorvastatin",
    value: "10mg, once daily",
    recordedAt: daysAgo(90),
    source: "manual",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
];

export const DEMO_DOCUMENTS: DocumentRecord[] = [
  {
    id: "demo-document-1",
    profileId: DEMO_PROFILE.id,
    title: "Annual bloodwork panel.pdf",
    category: "labs",
    fileUri: "demo-only, no real file",
    mimeType: "application/pdf",
    originalFileName: "annual-bloodwork-panel.pdf",
    importedAt: daysAgo(60),
    notes: "Full lipid + metabolic panel from annual physical",
  },
  {
    id: "demo-document-2",
    profileId: DEMO_PROFILE.id,
    title: "Chest X-ray report.pdf",
    category: "imaging",
    fileUri: "demo-only, no real file",
    mimeType: "application/pdf",
    originalFileName: "chest-xray-report.pdf",
    importedAt: daysAgo(200),
  },
];

export const DEMO_AI_INTERPRETATIONS: AiInterpretationRecord[] = [
  {
    id: "demo-ai-1",
    profileId: DEMO_PROFILE.id,
    targetType: "health_record",
    targetId: "demo-record-4",
    aiSource: "local",
    requestedAt: daysAgo(59),
    responseText:
      "LDL cholesterol is the 'bad' cholesterol commonly tracked in a lipid panel. A value of 96 mg/dL " +
      "is generally within the desirable range for most adults (under 100 mg/dL). This is general " +
      "information, not a diagnosis — a clinician can put this number in context with the rest of the panel.",
    disclosureAcknowledged: true,
    status: "success",
  },
];
