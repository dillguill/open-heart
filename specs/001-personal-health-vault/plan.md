# Implementation Plan: Personal Health Vault

**Branch**: `001-personal-health-vault` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-personal-health-vault/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

A React Native (Expo) mobile app that lets a person store health data points and documents
entirely on-device, view trends over time, present a consolidated summary to a doctor, and get
plain-language AI explanations of their data — via a local on-device model by default, or an
opt-in external AI API. Structured data lives in a SQLCipher-encrypted local database; documents
live in the app's OS-protected sandbox; a biometric app lock gates access to both. A separate,
sample-data-only web build is exported for a public GitHub Pages showcase, using mock storage/AI
adapters so no real user data or live AI credentials are ever involved in the public demo.

## Technical Context

**Language/Version**: TypeScript 5.x on React Native (New Architecture), via a current Expo SDK, Node.js 20+ toolchain

**Primary Dependencies**: Expo (Dev Client / prebuild-CNG workflow, not Expo Go), `@op-engineering/op-sqlite` (with its `sqlcipher` package.json config flag enabled) for the encrypted local DB, `expo-file-system` + `expo-document-picker` + `expo-image-picker` for document import/storage, `expo-secure-store` + `expo-local-authentication` for the app lock and DB key protection, `victory-native` (Skia) for trend charts, `expo-print` + `expo-sharing` for the doctor summary export, `llama.rn` for on-device AI inference, a thin direct-to-provider HTTP client for the opt-in external AI API, React Native Web (via Expo's web target) for the GitHub Pages demo build

**Storage**: SQLCipher-encrypted SQLite database per profile (structured Health Records), OS-sandboxed encrypted file storage for Documents; DB encryption key held in Keychain/Keystore via `expo-secure-store`, released only after biometric/passcode app-lock authentication. The web demo build uses static in-memory fixture data instead — no persistence, no encryption needed, since no real data exists there.

**Testing**: Jest + React Native Testing Library for unit/component tests; Maestro (YAML black-box flows) for end-to-end tests of the primary user stories

**Target Platform**: iOS 15+ and Android 10+ for the native app (Expo Dev Client / EAS Build; Expo Go is not supported since required native modules aren't in its fixed module set); a static web build (React Native Web) deployed to GitHub Pages as a sample-data-only showcase

**Project Type**: Single mobile app (Expo/React Native project) with an additional static web export target for the showcase demo — not a separate backend service

**Performance Goals**: New entry creation in well under the 30s target in SC-001; trend chart render in under 1s for a profile's typical multi-year dataset; cold start under 2s; on-device AI responses may take several seconds (acceptable for an explicitly async, non-blocking explanation request) rather than needing sub-second latency

**Constraints**: Core flows (entry, storage, trends, doctor summary) MUST work fully offline (Principle II); zero PHI in logs, crash reports, or analytics; zero PHI transmitted anywhere without explicit, per-destination opt-in (Principle III); on-device model is downloaded on first AI use rather than bundled, to keep the app store binary a reasonable size; the GitHub Pages demo build must never require or expose a real AI API key and must never persist visitor-entered data as if it were real health data

**Scale/Scope**: Single primary user per profile, with a small number of additional dependent profiles per device (not a multi-tenant or server-scale system); a profile may accumulate on the order of tens of thousands of records/documents over years of use

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How this plan satisfies it |
|---|---|---|
| I. Local-First, Privacy by Default | PASS | All structured data and documents are stored on-device (SQLCipher DB + sandboxed files); no server-side storage exists anywhere in this design. |
| II. Offline-Capable by Default | PASS | Entry, storage, trend viewing, and doctor summary generation/export require no network call. Only the opt-in external AI path needs connectivity. |
| III. Explicit Consent for External Data Transmission | PASS | External AI calls go directly from device to the user's chosen provider using a user-supplied key, only after first-use disclosure and opt-in (FR-010); the web demo makes no external AI calls at all. |
| IV. AI Explanations Are Informational, Never Diagnostic (NON-NEGOTIABLE) | PASS | AI Interpretation Response entity carries a source (local/external) and every UI surface for it is required to show the non-medical-advice label (FR-009); enforced in the shared component, not per-screen. |
| V. User Owns and Controls Their Data | PASS | Repository contract (see `contracts/`) includes per-record/document delete and full profile wipe, satisfying FR-007. |
| Data Handling: OS-level encryption + app lock | PASS | SQLCipher key stored in Keychain/Keystore via expo-secure-store, released only after biometric/passcode auth. |
| Data Handling: no PHI telemetry | PASS | No analytics/crash-reporting dependency is introduced in this plan; if one is added later it must be scoped to exclude record/document content. |
| Data Handling: external AI never proxied | PASS | Direct device-to-provider calls only (see research.md #8); no project-operated server is in this design at all. |
| Data Handling: profile isolation | PASS | Each profile gets its own SQLCipher database file and its own secure-store key entry (see data-model.md), so switching profiles requires re-authenticating into a distinct encrypted store. |

No violations requiring justification. Complexity Tracking is not needed for this plan.

## Project Structure

### Documentation (this feature)

```text
specs/001-personal-health-vault/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/                          # Expo Router screens (file-based routing)
├── (tabs)/
│   ├── records.tsx           # Health Record + Document list, entry point for User Story 1
│   ├── trends.tsx            # Trend/Metric Series charts, User Story 2
│   ├── doctor-summary.tsx    # Consolidated doctor-facing view, User Story 3
│   └── settings.tsx          # Profiles, app lock, AI provider configuration
├── record/[id].tsx           # Single Health Record / Document detail + AI explanation, User Story 4
└── _layout.tsx                # Root layout: app-lock gate, profile switcher

src/
├── db/                        # op-sqlite schema, migrations, SQLCipher key lifecycle
├── models/                    # TS types for Health Record, Document, Profile, AI Interpretation, Trend/Metric Series
├── repositories/               # Storage Repository contract + native (op-sqlite) implementation
├── services/
│   ├── ai/                     # AI Interpretation Provider contract + local (llama.rn) and external (HTTP) adapters
│   ├── auth/                   # Biometric/passcode app-lock service
│   └── export/                 # Doctor summary HTML→PDF generation (expo-print/expo-sharing)
├── components/                 # Shared UI, including the non-medical-advice AI disclosure component
├── hooks/
└── lib/

web-demo/
├── fixtures/                   # Static fictional sample data (records, documents, canned AI responses)
├── repositories/                # Mock Storage Repository implementation (in-memory, fixture-backed)
└── services/ai/                 # Mock AI Interpretation Provider implementation (canned responses only)

e2e/                            # Maestro YAML flows, one per primary user story
assets/models/                  # On-device model metadata/config (the GGUF binary itself is downloaded, not bundled)
app.json / app.config.ts        # Expo config, config plugins (op-sqlite, local-authentication), web baseUrl
eas.json                        # EAS Build profiles (development, production)
.github/workflows/gh-pages.yml  # Build web-demo target and publish to GitHub Pages
```

**Structure Decision**: Single Expo/React Native project (Expo Router, file-based). The native
app and the web showcase demo share the same `app/`, `src/models/`, `src/components/` code;
platform divergence is isolated entirely behind the Storage Repository and AI Interpretation
Provider contracts defined in `contracts/`, with `src/repositories`/`src/services/ai` providing
the real (native) implementations and `web-demo/` providing the fixture-backed mock
implementations selected at build time for the `web` platform target. This avoids a parallel app
while keeping the constitution's real-data guarantees scoped to the native build only.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No entries — Constitution Check reported no violations.
