/**
 * Web build of the StorageRepository facade — see index.ts for why this split exists.
 * Backed entirely by fixture data; nothing here touches op-sqlite (which has no web build).
 */
export * from "../../web-demo/repositories/mockStorageRepository";
