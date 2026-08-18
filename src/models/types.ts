/**
 * Shared domain types for the Personal Health Vault feature.
 * See specs/001-personal-health-vault/data-model.md for the authoritative field-by-field spec.
 */

export type Category = "vitals" | "labs" | "medications" | "conditions" | "imaging" | "notes";

export type Relationship = "self" | "dependent";

export interface Profile {
  id: string;
  displayName: string;
  relationship: Relationship;
  dbFileRef: string;
  createdAt: string; // ISO datetime
  lastAccessedAt: string; // ISO datetime
}

export type NewProfile = Pick<Profile, "displayName" | "relationship">;

export type RecordSource = "manual" | "imported";

export interface HealthRecord {
  id: string;
  profileId: string;
  category: Category;
  metricType: string;
  value: number | string;
  unit?: string;
  recordedAt: string; // ISO datetime, must not be in the future
  notes?: string;
  source: RecordSource;
  relatedDocumentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type NewHealthRecord = Pick<
  HealthRecord,
  "category" | "metricType" | "value" | "recordedAt" | "source"
> &
  Partial<Pick<HealthRecord, "unit" | "notes" | "relatedDocumentId">>;

export type SupportedDocumentMimeType = "application/pdf" | "image/jpeg" | "image/png";

export interface DocumentRecord {
  id: string;
  profileId: string;
  title: string;
  category: Category;
  fileUri: string;
  mimeType: SupportedDocumentMimeType;
  originalFileName: string;
  importedAt: string;
  notes?: string;
}

export type NewDocument = Pick<
  DocumentRecord,
  "title" | "category" | "mimeType" | "originalFileName"
> &
  Partial<Pick<DocumentRecord, "notes">>;

export interface MetricSeriesPoint {
  recordedAt: string;
  value: number | string;
  unit?: string;
}

export interface MetricSeries {
  metricType: string;
  points: MetricSeriesPoint[];
}

export interface DateRange {
  from: string; // ISO date, inclusive
  to: string; // ISO date, inclusive
}

export type AiSource = "local" | "external";

export type AiTargetType = "health_record" | "document";

export type AiInterpretationStatus = "success" | "error";

export interface AiInterpretationRecord {
  id: string;
  profileId: string;
  targetType: AiTargetType;
  targetId: string;
  aiSource: AiSource;
  externalProviderName?: string;
  requestedAt: string;
  responseText: string;
  disclosureAcknowledged: boolean;
  status: AiInterpretationStatus;
}

export interface RecordFilter {
  category?: Category;
  metricType?: string;
  range?: DateRange;
}

export interface DocumentFilter {
  category?: Category;
}
