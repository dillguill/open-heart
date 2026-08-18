/**
 * Sandboxed document file storage — writes/reads/deletes imported Documents inside the app's
 * private, OS-protected directory (Paths.document). Never writes outside this sandbox, so every
 * stored file inherits the OS-level data-protection guarantee the constitution requires.
 *
 * See specs/001-personal-health-vault/research.md #3 and contracts/storage-repository.md.
 */
import { Directory, File, Paths } from "expo-file-system";

import {
  SUPPORTED_DOCUMENT_MIME_TYPES,
  UnsupportedDocumentTypeError,
} from "../../repositories/types";
import type { SupportedDocumentMimeType } from "../../models/types";

const DOCUMENTS_SUBDIR = "documents";

/** Minimum free space required before we'll write a new document (spec Edge Case: low storage). */
const MIN_FREE_BYTES_FOR_IMPORT = 20 * 1024 * 1024; // 20 MB headroom

export class InsufficientStorageError extends Error {
  constructor(availableBytes: number) {
    super(
      `Not enough free space to import this document (${Math.round(availableBytes / 1024 / 1024)}MB available).`,
    );
    this.name = "InsufficientStorageError";
  }
}

function documentsDirectory(profileId: string): Directory {
  const dir = new Directory(Paths.document, DOCUMENTS_SUBDIR, profileId);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

function assertSupportedMimeType(mimeType: string): asserts mimeType is SupportedDocumentMimeType {
  if (!(SUPPORTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new UnsupportedDocumentTypeError(mimeType);
  }
}

function assertSufficientStorage(): void {
  const available = Paths.availableDiskSpace;
  if (typeof available === "number" && available < MIN_FREE_BYTES_FOR_IMPORT) {
    throw new InsufficientStorageError(available);
  }
}

/**
 * Writes `bytes` into the profile's private documents sandbox and returns the resulting file's
 * URI. Rejects unsupported mime types and low-storage conditions before writing anything.
 */
export function writeDocumentFile(
  profileId: string,
  documentId: string,
  originalFileName: string,
  mimeType: string,
  bytes: Uint8Array,
): string {
  assertSupportedMimeType(mimeType);
  assertSufficientStorage();

  const extension = originalFileName.includes(".")
    ? originalFileName.slice(originalFileName.lastIndexOf("."))
    : "";
  const file = new File(documentsDirectory(profileId), `${documentId}${extension}`);
  file.create({ overwrite: false });
  file.write(bytes);
  return file.uri;
}

export async function readDocumentFile(fileUri: string): Promise<Uint8Array> {
  return new File(fileUri).bytes();
}

export function deleteDocumentFile(fileUri: string): void {
  const file = new File(fileUri);
  if (file.exists) {
    file.delete();
  }
}

/** Deletes every document file for a profile — used by wipeProfileData (FR-007). */
export function deleteAllDocumentFilesForProfile(profileId: string): void {
  const dir = documentsDirectory(profileId);
  if (dir.exists) {
    dir.delete();
  }
}
