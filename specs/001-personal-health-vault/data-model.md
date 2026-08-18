# Data Model: Personal Health Vault

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Entities are derived from the spec's Key Entities section. Each profile owns an isolated
SQLCipher database file (see research.md #2 and #4); no entity is ever shared across profiles.

## Profile

Represents one person's data set on a device (the device owner or a dependent).

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| displayName | string | Required, user-editable |
| relationship | enum: `self`, `dependent` | Determines default UI framing only, no permission difference |
| dbFileRef | string | Path/reference to this profile's SQLCipher database file |
| createdAt | datetime | |
| lastAccessedAt | datetime | Updated on each successful unlock |

**Validation**: `displayName` required, 1–100 chars. Exactly one profile may be marked as the
default shown after app-lock unlock. Deleting a profile deletes its database file and all
documents (FR-007) after a confirmation step.

## Health Record

A discrete data point about a profile's health.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| profileId | UUID | FK → Profile, always the owning profile's own DB, so implicit in practice |
| category | enum: `vitals`, `labs`, `medications`, `conditions`, `imaging`, `notes` | FR-013 |
| metricType | string | e.g., `blood_pressure_systolic`, `weight`, `glucose`, `medication_name` — open vocabulary, not a fixed enum, so new metric types don't require a schema change |
| value | number \| string | Numeric for measurable metrics, string for freeform (e.g., medication name/dose) |
| unit | string, optional | e.g., `mmHg`, `kg`, `mg/dL`; required when `value` is numeric and the metric has a standard unit |
| recordedAt | datetime | When the measurement/event occurred (not necessarily when entered) |
| notes | string, optional | Free text |
| source | enum: `manual`, `imported` | FR-001 vs FR-002 provenance |
| createdAt / updatedAt | datetime | Audit fields |

**Validation**: `recordedAt` required and MUST NOT be in the future. `value` required.
`category` required. A Health Record MAY reference a related Document (see below) via
`relatedDocumentId`, e.g., a `labs` record extracted from an imported lab report PDF.

**Relationships**: One Health Record MAY link to one Document (`relatedDocumentId`, optional,
FK → Document). Many Health Records of the same `metricType` form a Trend/Metric Series (see
below — a query, not a stored entity).

## Document

An imported file representing a health artifact.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| profileId | UUID | Owning profile |
| title | string | User-facing name, defaults to original filename |
| category | enum: `vitals`, `labs`, `medications`, `conditions`, `imaging`, `notes` | Same vocabulary as Health Record for consistent doctor-summary grouping |
| fileUri | string | Reference into the app's sandboxed encrypted file storage (research.md #3) |
| mimeType | string | e.g., `application/pdf`, `image/jpeg` |
| originalFileName | string | |
| importedAt | datetime | |
| notes | string, optional | |

**Validation**: `fileUri` MUST point to a file inside the app's private sandbox — never an
external/shared location, so a Document's protection always inherits the OS-level guarantee.
`mimeType` MUST be one of the supported consumer formats (PDF, JPG, PNG) per the spec's
Assumptions; anything else is rejected at import with a clear message (Edge Case in spec.md).

## Trend / Metric Series

Not a stored entity — a derived view computed by grouping a profile's Health Records by
`metricType` and ordering by `recordedAt`, used to render the trend charts in User Story 2.
Modeled here for clarity of the query contract (see `contracts/storage-repository.md`).

| Field | Type | Notes |
|---|---|---|
| metricType | string | Grouping key |
| points | array of `{ recordedAt, value, unit }` | Chronologically ordered |

**Validation**: A series with fewer than 2 points still renders (single-point display per spec
Acceptance Scenario 2 of User Story 2) rather than erroring.

## AI Interpretation Request/Response

A record of a user's request to interpret a Health Record or Document, and the result.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| profileId | UUID | Owning profile |
| targetType | enum: `health_record`, `document` | What was interpreted |
| targetId | UUID | FK → Health Record or Document depending on `targetType` |
| aiSource | enum: `local`, `external` | Which provider produced the response (FR-008/FR-009) |
| externalProviderName | string, optional | Set only when `aiSource = external` |
| requestedAt | datetime | |
| responseText | string | The plain-language explanation |
| disclosureAcknowledged | boolean | MUST be `true` before an `external` request is ever sent (Principle III / FR-010) |
| status | enum: `success`, `error` | |

**Validation**: `disclosureAcknowledged` MUST be `true` prior to persisting or sending any
`aiSource = external` request — enforced in the AI Interpretation Provider contract itself, not
just the UI, so it can't be bypassed by a future screen. Every `responseText` is rendered behind
the shared non-medical-advice disclosure component (constitution Principle IV) regardless of
`aiSource`.

## Doctor Summary Export

Not a persisted entity by default — a generated, point-in-time rendering of a profile's Health
Records and Documents grouped by category (User Story 3), produced on demand and exported via
the flow in `contracts/export-service.md`. No export history is required by the spec; if a future
iteration wants an export log, it would follow the same shape as AI Interpretation Request above
(id, profileId, generatedAt, format).

## Web demo fixtures (non-production)

The GitHub Pages showcase build (research.md #10) uses static fixture data shaped identically to
Profile / Health Record / Document / AI Interpretation Response above, stored as plain TypeScript
fixtures in `web-demo/fixtures/`, not a database. Fixture AI Interpretation Responses always have
`aiSource: 'local'` with pre-written `responseText` — the demo never sets `aiSource: 'external'`
since it never calls a live provider.
