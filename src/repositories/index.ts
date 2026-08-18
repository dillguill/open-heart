/**
 * Platform-selected StorageRepository. This file (no platform suffix) resolves for iOS/Android;
 * index.web.ts resolves for the web build via Metro's platform-extension resolution — see
 * research.md #10 and contracts/storage-repository.md. Screens must import from here, never
 * directly from nativeStorageRepository.ts, so the same UI code works on both targets.
 */
export * from "./nativeStorageRepository";
