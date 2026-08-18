/**
 * Native StorageRepository implementation, backed by each profile's SQLCipher database
 * (src/db/connection.ts, src/db/schema.ts) and sandboxed file storage (src/services/storage).
 *
 * Implements the contract in specs/001-personal-health-vault/contracts/storage-repository.md
 * incrementally, in the order the tasks.md phases build it: profile/record/document CRUD here
 * (User Story 1), getMetricSeries/listMetricTypes in User Story 2, wipeProfileData in Polish.
 * Exported as a plain object rather than declaring `implements StorageRepository` until every
 * method lands, so the type system doesn't lie about what's implemented yet.
 */
import * as Crypto from "expo-crypto";

import { deleteProfileDatabase, openProfileDatabase } from "../db/connection";
import * as ProfilesRegistry from "../db/profilesRegistry";
import type {
  Category,
  DocumentFilter,
  DocumentRecord,
  HealthRecord,
  NewDocument,
  NewHealthRecord,
  NewProfile,
  Profile,
  RecordFilter,
  RecordSource,
} from "../models/types";
import {
  deleteAllDocumentFilesForProfile,
  deleteDocumentFile,
  writeDocumentFile,
} from "../services/storage/fileStorage";

// ---- Profiles ----------------------------------------------------------------

export async function listProfiles(): Promise<Profile[]> {
  return ProfilesRegistry.listProfiles();
}

export async function createProfile(input: NewProfile): Promise<Profile> {
  return ProfilesRegistry.createProfile(input);
}

export async function deleteProfile(profileId: string): Promise<void> {
  await deleteProfileDatabase(profileId);
  deleteAllDocumentFilesForProfile(profileId);
  await ProfilesRegistry.removeProfile(profileId);
}

// ---- Health Records -----------------------------------------------------------

interface HealthRecordRow {
  id: string;
  category: Category;
  metric_type: string;
  value_number: number | null;
  value_text: string | null;
  unit: string | null;
  recorded_at: string;
  notes: string | null;
  source: RecordSource;
  related_document_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToHealthRecord(profileId: string, row: HealthRecordRow): HealthRecord {
  return {
    id: row.id,
    profileId,
    category: row.category,
    metricType: row.metric_type,
    value: row.value_number ?? row.value_text ?? "",
    unit: row.unit ?? undefined,
    recordedAt: row.recorded_at,
    notes: row.notes ?? undefined,
    source: row.source,
    relatedDocumentId: row.related_document_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listHealthRecords(
  profileId: string,
  filter?: RecordFilter,
): Promise<HealthRecord[]> {
  const db = await openProfileDatabase(profileId);
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter?.category) {
    clauses.push("category = ?");
    params.push(filter.category);
  }
  if (filter?.metricType) {
    clauses.push("metric_type = ?");
    params.push(filter.metricType);
  }
  if (filter?.range) {
    clauses.push("recorded_at >= ? AND recorded_at <= ?");
    params.push(filter.range.from, filter.range.to);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const { rows } = await db.execute(
    `SELECT * FROM health_records ${where} ORDER BY recorded_at DESC`,
    params,
  );
  return (rows as unknown as HealthRecordRow[]).map((row) => rowToHealthRecord(profileId, row));
}

export async function getHealthRecord(
  profileId: string,
  recordId: string,
): Promise<HealthRecord | null> {
  const db = await openProfileDatabase(profileId);
  const { rows } = await db.execute("SELECT * FROM health_records WHERE id = ?", [recordId]);
  const row = (rows as unknown as HealthRecordRow[])[0];
  return row ? rowToHealthRecord(profileId, row) : null;
}

function assertNotFuture(recordedAt: string): void {
  if (new Date(recordedAt).getTime() > Date.now()) {
    throw new Error("recordedAt must not be in the future");
  }
}

export async function createHealthRecord(
  profileId: string,
  input: NewHealthRecord,
): Promise<HealthRecord> {
  assertNotFuture(input.recordedAt);
  const db = await openProfileDatabase(profileId);
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const valueNumber = typeof input.value === "number" ? input.value : null;
  const valueText = typeof input.value === "string" ? input.value : null;

  await db.execute(
    `INSERT INTO health_records
      (id, category, metric_type, value_number, value_text, unit, recorded_at, notes, source, related_document_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.category,
      input.metricType,
      valueNumber,
      valueText,
      input.unit ?? null,
      input.recordedAt,
      input.notes ?? null,
      input.source,
      input.relatedDocumentId ?? null,
      now,
      now,
    ],
  );

  const created = await getHealthRecord(profileId, id);
  if (!created) throw new Error("Failed to read back created health record");
  return created;
}

export async function updateHealthRecord(
  profileId: string,
  recordId: string,
  patch: Partial<NewHealthRecord>,
): Promise<HealthRecord> {
  const existing = await getHealthRecord(profileId, recordId);
  if (!existing) throw new Error(`Health record ${recordId} not found`);
  if (patch.recordedAt) assertNotFuture(patch.recordedAt);

  const merged: NewHealthRecord = {
    category: patch.category ?? existing.category,
    metricType: patch.metricType ?? existing.metricType,
    value: patch.value ?? existing.value,
    unit: patch.unit ?? existing.unit,
    recordedAt: patch.recordedAt ?? existing.recordedAt,
    notes: patch.notes ?? existing.notes,
    source: patch.source ?? existing.source,
    relatedDocumentId: patch.relatedDocumentId ?? existing.relatedDocumentId,
  };

  const db = await openProfileDatabase(profileId);
  const valueNumber = typeof merged.value === "number" ? merged.value : null;
  const valueText = typeof merged.value === "string" ? merged.value : null;

  await db.execute(
    `UPDATE health_records SET
      category = ?, metric_type = ?, value_number = ?, value_text = ?, unit = ?,
      recorded_at = ?, notes = ?, source = ?, related_document_id = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.category,
      merged.metricType,
      valueNumber,
      valueText,
      merged.unit ?? null,
      merged.recordedAt,
      merged.notes ?? null,
      merged.source,
      merged.relatedDocumentId ?? null,
      new Date().toISOString(),
      recordId,
    ],
  );

  const updated = await getHealthRecord(profileId, recordId);
  if (!updated) throw new Error("Failed to read back updated health record");
  return updated;
}

export async function deleteHealthRecord(profileId: string, recordId: string): Promise<void> {
  const db = await openProfileDatabase(profileId);
  await db.execute("DELETE FROM health_records WHERE id = ?", [recordId]);
}

// ---- Documents -----------------------------------------------------------------

interface DocumentRow {
  id: string;
  title: string;
  category: Category;
  file_uri: string;
  mime_type: DocumentRecord["mimeType"];
  original_file_name: string;
  imported_at: string;
  notes: string | null;
}

function rowToDocument(profileId: string, row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    profileId,
    title: row.title,
    category: row.category,
    fileUri: row.file_uri,
    mimeType: row.mime_type,
    originalFileName: row.original_file_name,
    importedAt: row.imported_at,
    notes: row.notes ?? undefined,
  };
}

export async function listDocuments(
  profileId: string,
  filter?: DocumentFilter,
): Promise<DocumentRecord[]> {
  const db = await openProfileDatabase(profileId);
  const where = filter?.category ? "WHERE category = ?" : "";
  const params = filter?.category ? [filter.category] : [];
  const { rows } = await db.execute(
    `SELECT * FROM documents ${where} ORDER BY imported_at DESC`,
    params,
  );
  return (rows as unknown as DocumentRow[]).map((row) => rowToDocument(profileId, row));
}

export async function getDocument(
  profileId: string,
  documentId: string,
): Promise<DocumentRecord | null> {
  const db = await openProfileDatabase(profileId);
  const { rows } = await db.execute("SELECT * FROM documents WHERE id = ?", [documentId]);
  const row = (rows as unknown as DocumentRow[])[0];
  return row ? rowToDocument(profileId, row) : null;
}

/**
 * Detects an already-imported document with the same original filename + mime type for this
 * profile, so callers can warn about likely duplicate imports (spec Edge Case).
 */
export async function findLikelyDuplicateDocument(
  profileId: string,
  originalFileName: string,
  mimeType: string,
): Promise<DocumentRecord | null> {
  const db = await openProfileDatabase(profileId);
  const { rows } = await db.execute(
    "SELECT * FROM documents WHERE original_file_name = ? AND mime_type = ? LIMIT 1",
    [originalFileName, mimeType],
  );
  const row = (rows as unknown as DocumentRow[])[0];
  return row ? rowToDocument(profileId, row) : null;
}

export async function importDocument(
  profileId: string,
  input: NewDocument,
  fileBytes: Uint8Array,
): Promise<DocumentRecord> {
  const db = await openProfileDatabase(profileId);
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  // Validates mime type + available storage, and throws before any DB row is written.
  const fileUri = writeDocumentFile(
    profileId,
    id,
    input.originalFileName,
    input.mimeType,
    fileBytes,
  );

  await db.execute(
    `INSERT INTO documents
      (id, title, category, file_uri, mime_type, original_file_name, imported_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.title,
      input.category,
      fileUri,
      input.mimeType,
      input.originalFileName,
      now,
      input.notes ?? null,
    ],
  );

  const created = await getDocument(profileId, id);
  if (!created) throw new Error("Failed to read back imported document");
  return created;
}

export async function deleteDocument(profileId: string, documentId: string): Promise<void> {
  const existing = await getDocument(profileId, documentId);
  const db = await openProfileDatabase(profileId);
  await db.execute("DELETE FROM documents WHERE id = ?", [documentId]);
  if (existing) {
    deleteDocumentFile(existing.fileUri);
  }
}
