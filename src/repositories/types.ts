/**
 * Storage Repository contract — see specs/001-personal-health-vault/contracts/storage-repository.md
 *
 * Exactly two implementations exist: the native one (nativeStorageRepository.ts, backed by the
 * per-profile SQLCipher database) and the web demo mock (web-demo/repositories, fixture-backed).
 * Screens must depend only on this interface, never on op-sqlite or the file system directly.
 */
import type {
  DateRange,
  DocumentFilter,
  DocumentRecord,
  HealthRecord,
  MetricSeries,
  NewDocument,
  NewHealthRecord,
  NewProfile,
  Profile,
  RecordFilter,
} from "../models/types";

export interface StorageRepository {
  listProfiles(): Promise<Profile[]>;
  createProfile(input: NewProfile): Promise<Profile>;
  deleteProfile(profileId: string): Promise<void>;

  listHealthRecords(profileId: string, filter?: RecordFilter): Promise<HealthRecord[]>;
  getHealthRecord(profileId: string, recordId: string): Promise<HealthRecord | null>;
  createHealthRecord(profileId: string, input: NewHealthRecord): Promise<HealthRecord>;
  updateHealthRecord(
    profileId: string,
    recordId: string,
    patch: Partial<NewHealthRecord>,
  ): Promise<HealthRecord>;
  deleteHealthRecord(profileId: string, recordId: string): Promise<void>;

  getMetricSeries(profileId: string, metricType: string, range?: DateRange): Promise<MetricSeries>;
  listMetricTypes(profileId: string): Promise<string[]>;

  listDocuments(profileId: string, filter?: DocumentFilter): Promise<DocumentRecord[]>;
  getDocument(profileId: string, documentId: string): Promise<DocumentRecord | null>;
  importDocument(
    profileId: string,
    input: NewDocument,
    fileBytes: Uint8Array,
  ): Promise<DocumentRecord>;
  deleteDocument(profileId: string, documentId: string): Promise<void>;

  wipeProfileData(profileId: string): Promise<void>;
}

export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export class UnsupportedDocumentTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported document type: ${mimeType}`);
    this.name = "UnsupportedDocumentTypeError";
  }
}
