import type { SupportedDocumentMimeType } from "../models/types";

const EXTENSION_TO_MIME: Record<string, SupportedDocumentMimeType> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** Best-effort mime type inference for pickers (like expo-image-picker) that don't return one. */
export function inferMimeType(fileName: string, reportedMimeType?: string | null): string {
  if (reportedMimeType) return reportedMimeType;
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_MIME[extension] ?? "application/octet-stream";
}

export function isSupportedDocumentMimeType(
  mimeType: string,
): mimeType is SupportedDocumentMimeType {
  return mimeType === "application/pdf" || mimeType === "image/jpeg" || mimeType === "image/png";
}
