/**
 * Web demo StorageRepository mock — in-memory, fixture-backed. Exports the same function names
 * as src/repositories/nativeStorageRepository.ts so src/repositories/index.web.ts can stand in
 * for the native module on the `web` platform, per contracts/storage-repository.md.
 *
 * Every write is applied only to the in-memory copy for this browser session — nothing persists
 * across a reload, and nothing is ever encrypted or written to disk, because none of it is real.
 */
import { DEMO_DOCUMENTS, DEMO_HEALTH_RECORDS, DEMO_PROFILE } from "../fixtures/data";
import type {
  DocumentFilter,
  DocumentRecord,
  HealthRecord,
  NewDocument,
  NewHealthRecord,
  NewProfile,
  Profile,
  RecordFilter,
} from "../../src/models/types";
import {
  SUPPORTED_DOCUMENT_MIME_TYPES,
  UnsupportedDocumentTypeError,
} from "../../src/repositories/types";

let profiles: Profile[] = [DEMO_PROFILE];
let healthRecords: HealthRecord[] = [...DEMO_HEALTH_RECORDS];
let documents: DocumentRecord[] = [...DEMO_DOCUMENTS];

function demoId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- Profiles (read-only in the demo — creating/deleting profiles is not part of the showcase) ----

export async function listProfiles(): Promise<Profile[]> {
  return profiles;
}

export async function createProfile(input: NewProfile): Promise<Profile> {
  const profile: Profile = {
    id: demoId("demo-profile"),
    displayName: input.displayName,
    relationship: input.relationship,
    dbFileRef: "demo-only, not a real database",
    createdAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  };
  profiles = [...profiles, profile];
  return profile;
}

export async function deleteProfile(profileId: string): Promise<void> {
  profiles = profiles.filter((p) => p.id !== profileId);
}

// ---- Health Records ----

export async function listHealthRecords(
  profileId: string,
  filter?: RecordFilter,
): Promise<HealthRecord[]> {
  return healthRecords
    .filter((r) => r.profileId === profileId)
    .filter((r) => !filter?.category || r.category === filter.category)
    .filter((r) => !filter?.metricType || r.metricType === filter.metricType)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export async function getHealthRecord(
  profileId: string,
  recordId: string,
): Promise<HealthRecord | null> {
  return healthRecords.find((r) => r.profileId === profileId && r.id === recordId) ?? null;
}

export async function createHealthRecord(
  profileId: string,
  input: NewHealthRecord,
): Promise<HealthRecord> {
  const now = new Date().toISOString();
  const record: HealthRecord = {
    id: demoId("demo-record"),
    profileId,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  healthRecords = [...healthRecords, record];
  return record;
}

export async function updateHealthRecord(
  profileId: string,
  recordId: string,
  patch: Partial<NewHealthRecord>,
): Promise<HealthRecord> {
  const existing = await getHealthRecord(profileId, recordId);
  if (!existing) throw new Error(`Demo health record ${recordId} not found`);
  const updated: HealthRecord = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  healthRecords = healthRecords.map((r) => (r.id === recordId ? updated : r));
  return updated;
}

export async function deleteHealthRecord(profileId: string, recordId: string): Promise<void> {
  healthRecords = healthRecords.filter((r) => !(r.profileId === profileId && r.id === recordId));
}

// ---- Documents ----

export async function listDocuments(
  profileId: string,
  filter?: DocumentFilter,
): Promise<DocumentRecord[]> {
  return documents
    .filter((d) => d.profileId === profileId)
    .filter((d) => !filter?.category || d.category === filter.category)
    .sort((a, b) => b.importedAt.localeCompare(a.importedAt));
}

export async function getDocument(
  profileId: string,
  documentId: string,
): Promise<DocumentRecord | null> {
  return documents.find((d) => d.profileId === profileId && d.id === documentId) ?? null;
}

export async function findLikelyDuplicateDocument(
  profileId: string,
  originalFileName: string,
  mimeType: string,
): Promise<DocumentRecord | null> {
  return (
    documents.find(
      (d) =>
        d.profileId === profileId &&
        d.originalFileName === originalFileName &&
        d.mimeType === mimeType,
    ) ?? null
  );
}

export async function importDocument(
  profileId: string,
  input: NewDocument,
  _fileBytes: Uint8Array,
): Promise<DocumentRecord> {
  if (!(SUPPORTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(input.mimeType)) {
    throw new UnsupportedDocumentTypeError(input.mimeType);
  }
  const id = demoId("demo-document");
  const document: DocumentRecord = {
    id,
    profileId,
    fileUri: `demo-only, no real file (${id})`,
    importedAt: new Date().toISOString(),
    ...input,
  };
  documents = [...documents, document];
  return document;
}

export async function deleteDocument(profileId: string, documentId: string): Promise<void> {
  documents = documents.filter((d) => !(d.profileId === profileId && d.id === documentId));
}

export async function wipeProfileData(profileId: string): Promise<void> {
  healthRecords = healthRecords.filter((r) => r.profileId !== profileId);
  documents = documents.filter((d) => d.profileId !== profileId);
}
