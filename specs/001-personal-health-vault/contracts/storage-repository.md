# Contract: Storage Repository

**Feature**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md)

This is the seam between the app's screens/business logic and where data actually lives. Exactly
two implementations exist:

- **Native** (`src/repositories/`): backed by the per-profile SQLCipher database (op-sqlite) and
  the sandboxed encrypted file store, used by the iOS/Android app.
- **Web demo mock** (`web-demo/repositories/`): backed by static in-memory fixtures, used only by
  the GitHub Pages showcase build. Every write method is a no-op that resolves successfully
  against an in-memory copy for the session, so the demo UI behaves normally without ever
  persisting anything or touching real storage.

Every screen depends only on this interface, never on op-sqlite or the file system directly, so
the platform swap in the web build requires no screen-level changes.

## Interface

```ts
interface StorageRepository {
  // Profiles
  listProfiles(): Promise<Profile[]>;
  createProfile(input: NewProfile): Promise<Profile>;
  deleteProfile(profileId: string): Promise<void>; // cascades: all records, documents, AI history

  // Health Records
  listHealthRecords(profileId: string, filter?: RecordFilter): Promise<HealthRecord[]>;
  getHealthRecord(profileId: string, recordId: string): Promise<HealthRecord | null>;
  createHealthRecord(profileId: string, input: NewHealthRecord): Promise<HealthRecord>;
  updateHealthRecord(profileId: string, recordId: string, patch: Partial<NewHealthRecord>): Promise<HealthRecord>;
  deleteHealthRecord(profileId: string, recordId: string): Promise<void>;

  // Trend/Metric Series (derived — read-only)
  getMetricSeries(profileId: string, metricType: string, range?: DateRange): Promise<MetricSeries>;
  listMetricTypes(profileId: string): Promise<string[]>;

  // Documents
  listDocuments(profileId: string, filter?: DocumentFilter): Promise<Document[]>;
  getDocument(profileId: string, documentId: string): Promise<Document | null>;
  importDocument(profileId: string, input: NewDocument, fileBytes: Uint8Array): Promise<Document>;
  deleteDocument(profileId: string, documentId: string): Promise<void>;

  // Full data wipe (FR-007)
  wipeProfileData(profileId: string): Promise<void>; // deletes all records, documents, AI history; keeps the empty profile
}
```

## Behavioral requirements (apply to the native implementation; the mock satisfies these trivially)

- All methods scoped to a `profileId` MUST only ever read/write that profile's own SQLCipher
  database file — never another profile's, enforced by opening a distinct DB connection per
  profile session (constitution Data Handling: profile isolation).
- `deleteProfile` and `wipeProfileData` MUST be irreversible once confirmed by the caller (the UI
  layer is responsible for the confirmation step; the repository does not prompt).
- `importDocument` MUST write `fileBytes` only into the app's private sandbox directory and MUST
  reject (without partially writing) any `mimeType` outside the supported set.
- `getMetricSeries` MUST return a series (possibly with a single point) rather than throwing when
  fewer than 2 records exist for a `metricType` (spec User Story 2, Acceptance Scenario 2).
- No method in this interface may perform network I/O. Any implementation that does violates
  Principle II (Offline-Capable by Default).
