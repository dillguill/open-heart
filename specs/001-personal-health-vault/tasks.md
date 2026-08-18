---
description: "Task list template for feature implementation"
---

# Tasks: Personal Health Vault

**Input**: Design documents from `/specs/001-personal-health-vault/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Not explicitly requested as TDD in the spec; automated tests appear as their own tasks
in the Polish phase (Jest/RNTL unit tests, Maestro E2E flows), matching the tooling committed to
in plan.md and quickstart.md, rather than as blocking pre-implementation tasks per story.

**Organization**: Tasks are grouped by user story (spec.md priorities P1/P1/P2/P3) to enable
independent implementation and testing of each story, plus a Web Showcase Demo phase for the
GitHub Pages build the user requested during planning.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- File paths reference the structure in plan.md's Project Structure section

## Path Conventions

Single Expo/React Native project at the repo root: `app/` (Expo Router screens), `src/`
(models/repositories/services/components), `web-demo/` (web-only mock adapters + fixtures),
`e2e/` (Maestro flows), `__tests__/` (Jest).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize the Expo (TypeScript) project at the repo root with Expo Router, matching the `app/` structure in plan.md
- [X] T002 [P] Configure ESLint + Prettier for TypeScript/React Native in `.eslintrc.js` / `.prettierrc`
- [X] T003 [P] Create `app.config.ts` with the app identity, required permissions (camera/photo library for document import, Face ID usage description), and a placeholder `baseUrl` for the future GitHub Pages path (research.md #10)
- [~] T004 Set up the Expo Dev Client / prebuild (CNG) workflow — `npx expo prebuild`, verify `npx expo run:ios` and `npx expo run:android` boot a blank app (research.md #1) — **partial**: `npx expo prebuild` runs clean (verified twice, including after the deploymentTarget/minSdkVersion change) and generates ios/+android/ with the expected config plugins applied; `run:ios`/`run:android` were not verified — this dev environment has no Xcode and no Android SDK/emulator, so the actual native build/boot step needs to happen on a Mac (iOS) and with Android SDK + emulator or device (Android)
- [X] T005 [P] Create EAS Build profiles (`development`, `production`) in `eas.json`
- [X] T006 [P] Configure Jest + React Native Testing Library in `jest.config.js`
- [X] T007 [P] Configure Maestro for E2E: create the empty `e2e/` directory for flow files and a project-root `config.yaml` (Maestro only reads workspace config from the repo root or `.maestro/`, not `e2e/`) pointing its `flows` glob at `e2e/*.yaml`

**Checkpoint**: Blank Expo app boots on iOS/Android via Dev Client; tooling is in place.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Install `@op-engineering/op-sqlite` and enable SQLCipher via the `"op-sqlite": { "sqlcipher": true }` block in `package.json` (no separate package or Expo config plugin needed) per research.md #2
- [X] T009 [P] Install and configure `expo-secure-store` and `expo-local-authentication` (config plugin + iOS `NSFaceIDUsageDescription`) per research.md #4
- [X] T010 [P] Define shared TypeScript types for Profile, Health Record, Document, Metric Series, and AI Interpretation Request/Response in `src/models/types.ts` per data-model.md
- [X] T011 Implement per-profile SQLCipher database lifecycle (open/create/close, key retrieval from `expo-secure-store`) in `src/db/connection.ts`
- [X] T012 Implement database schema/migrations for `profiles`, `health_records`, `documents`, and `ai_interpretations` tables in `src/db/schema.ts` (depends on T011) — plus `src/db/profilesRegistry.ts`, an addition not called out by name in the original task text: a small secure-store-backed profile registry, needed because a profile must be listed before its own SQLCipher database can be opened
- [X] T013 [P] Define the `StorageRepository` TypeScript interface in `src/repositories/types.ts` per contracts/storage-repository.md
- [X] T014 [P] Define the `AiInterpretationProvider` TypeScript interface in `src/services/ai/types.ts` per contracts/ai-interpretation-provider.md
- [X] T015 Implement the biometric/passcode app-lock service (gates DB key release on successful auth) in `src/services/auth/appLock.ts` (depends on T009)
- [X] T016 Implement the root layout app-lock gate and profile switcher in `app/_layout.tsx` (depends on T015)
- [X] T017 [P] Implement the shared non-medical-advice AI disclosure component in `src/components/AiDisclosure.tsx` (constitution Principle IV)
- [X] T018 [P] Implement sandboxed document file storage helpers (write/read/delete inside the app's private directory) in `src/services/storage/fileStorage.ts` per research.md #3

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Store health data and documents locally (Priority: P1) 🎯 MVP

**Goal**: A person can manually enter health data points and import documents, all stored
locally and available fully offline.

**Independent Test**: quickstart.md scenario 1 — add a manual entry and import a document, force
quit/relaunch, confirm both persist; repeat in Airplane Mode.

### Implementation for User Story 1

- [X] T019 [P] [US1] Implement profile CRUD (`listProfiles`, `createProfile`, `deleteProfile`) on the native `StorageRepository` in `src/repositories/nativeStorageRepository.ts` (depends on T012, T013)
- [X] T020 [P] [US1] Implement Health Record CRUD (`listHealthRecords`, `getHealthRecord`, `createHealthRecord`, `updateHealthRecord`, `deleteHealthRecord`) in `src/repositories/nativeStorageRepository.ts`
- [X] T021 [P] [US1] Implement Document methods (`listDocuments`, `getDocument`, `importDocument`, `deleteDocument`) in `src/repositories/nativeStorageRepository.ts`, writing files via `src/services/storage/fileStorage.ts` (depends on T018)
- [X] T022 [US1] Build the Records list screen in `app/(tabs)/records.tsx` (depends on T020, T021)
- [X] T023 [US1] Build the manual Health Record entry form in `app/record/[id].tsx` (create mode), including category/tag selection per FR-013
- [X] T024 [US1] Wire the document import flow (`expo-document-picker` + `expo-image-picker`) into `app/(tabs)/records.tsx`, calling `importDocument`
- [X] T025 [US1] Add unsupported-file-type rejection and duplicate-import detection/handling per spec Edge Cases, surfaced as clear in-app messages

**Checkpoint**: User Story 1 is fully functional and independently testable (quickstart.md scenario 1).

---

## Phase 4: User Story 2 - Track and view trends (Priority: P1)

**Goal**: A person can view chronological trend charts for any repeated metric.

**Independent Test**: quickstart.md scenario 2 — enter the same metric on three dates, open
Trends, confirm a chart renders in 3 or fewer taps from the home screen.

**Note**: Builds on User Story 1's data-entry capability to have data to chart, but its own
repository methods and screen are independent additions.

### Implementation for User Story 2

- [ ] T026 [P] [US2] Implement `getMetricSeries` and `listMetricTypes` on the native `StorageRepository` in `src/repositories/nativeStorageRepository.ts` (depends on T020)
- [ ] T027 [US2] Build the Trends screen with a metric-type picker in `app/(tabs)/trends.tsx` (depends on T026)
- [ ] T028 [US2] Implement the trend chart component (Victory Native/Skia) in `src/components/TrendChart.tsx`
- [ ] T029 [US2] Handle single-point series (render without error, show "more data needed") per spec Acceptance Scenario 2
- [ ] T030 [US2] Handle sparse/irregular-interval and outlier data in the chart axis/scaling per spec Edge Cases

**Checkpoint**: User Stories 1 and 2 both work independently (quickstart.md scenarios 1-2).

---

## Phase 5: User Story 3 - Present a comprehensive view for a doctor visit (Priority: P2)

**Goal**: A person can open a consolidated, category-grouped summary and export/share it without
the doctor needing the app.

**Independent Test**: quickstart.md scenario 3 — open the doctor summary with records across 3+
categories, export to PDF, share, confirm it opens outside the app.

### Implementation for User Story 3

- [ ] T031 [P] [US3] Implement `DoctorSummaryService.buildSummary` (groups records/documents by category with trend highlights) in `src/services/export/doctorSummary.ts` per contracts/export-service.md (depends on T020, T021, T026)
- [ ] T032 [US3] Implement `exportToPdf` (HTML template rendered via `expo-print`) in `src/services/export/doctorSummary.ts`
- [ ] T033 [US3] Implement `share` via `expo-sharing` in `src/services/export/doctorSummary.ts`
- [ ] T034 [US3] Build the Doctor Summary screen (category sections + trend highlights + export/share buttons) in `app/(tabs)/doctor-summary.tsx` (depends on T031)
- [ ] T035 [US3] Add category and date-range filtering controls to the summary screen per `SummaryOptions`

**Checkpoint**: User Stories 1-3 all work independently (quickstart.md scenarios 1-3).

---

## Phase 6: User Story 4 - AI-assisted interpretation of health data (Priority: P3)

**Goal**: A person can request a plain-language, non-diagnostic explanation of a record or
document, from a local model by default or an opted-in external API.

**Independent Test**: quickstart.md scenario 4 — request an explanation with no external AI
configured (local model or clear unavailability message), then configure an external provider
and confirm the disclosure/opt-in gate appears before the first request.

### Implementation for User Story 4

- [ ] T036 [P] [US4] Implement the local `AiInterpretationProvider` (llama.rn), including the on-first-use model download flow, in `src/services/ai/local.ts` per contracts/ai-interpretation-provider.md
- [ ] T037 [P] [US4] Implement the external `AiInterpretationProvider` (direct-to-provider HTTP call, user-supplied API key from `expo-secure-store`) in `src/services/ai/external.ts`
- [ ] T038 [US4] Implement AI Interpretation Request/Response persistence, including the `disclosureAcknowledged` enforcement gate, in `src/repositories/nativeStorageRepository.ts` (depends on T013, T037)
- [ ] T039 [US4] Build the AI explanation UI (request button + response rendered behind `AiDisclosure`) in `app/record/[id].tsx` (depends on T017, T036, T037)
- [ ] T040 [US4] Build the AI provider settings screen (external opt-in disclosure text, API key entry) in `app/(tabs)/settings.tsx`
- [ ] T041 [US4] Enforce the `disclosureAcknowledged` gate inside `src/services/ai/external.ts` itself, not only the UI, per contracts/ai-interpretation-provider.md
- [ ] T042 [US4] Handle external API unreachable/error responses with a clear in-app message per spec Edge Cases

**Checkpoint**: All four user stories are independently functional (quickstart.md scenarios 1-4).

---

## Phase 7: Web Showcase Demo (GitHub Pages)

**Goal**: A public, sample-data-only web build of the same screens, deployed to GitHub Pages,
per the user's mid-plan request and research.md #10.

**Independent Test**: quickstart.md "Web demo validation" — deployed URL loads with visibly
labeled fixture data, no AI network requests occur, demo labeling is present.

- [X] T043 [P] Create fixture data (sample Profile, Health Records, Documents, canned AI responses) in `web-demo/fixtures/`
- [X] T044 [P] Implement the mock `StorageRepository` (in-memory, fixture-backed, writes are no-ops) in `web-demo/repositories/mockStorageRepository.ts` per contracts/storage-repository.md (depends on T013)
- [X] T045 [P] Implement the mock `AiInterpretationProvider` (canned `responseText`, always `aiSource: 'local'`, artificial delay) in `web-demo/services/ai/mockAiProvider.ts` per contracts/ai-interpretation-provider.md (depends on T014)
- [X] T046 Add a platform-based factory that selects native vs. mock implementations in `src/repositories/index.ts`/`index.web.ts` (depends on T044, T045) — implemented via Metro's `.web.ts` platform-extension resolution rather than a runtime `Platform.OS` check, so the native module (op-sqlite etc.) is never even bundled for web; the same split was also needed one layer up, in `src/hooks/useAppSession.tsx`/`useAppSession.web.tsx`, since the app-lock/session logic itself was native-only — confirmed by grepping the exported web bundle for "op-sqlite"/"SQLCipher" (zero matches)
- [X] T047 Add a persistent "Demo — not for real health data" banner to the web build in `app/_layout.tsx` (web-only rendering path)
- [X] T048 Set `expo.experiments.baseUrl` in `app.config.ts` to the GitHub repository path per research.md #10
- [X] T049 Add `.github/workflows/gh-pages.yml`: run `npx expo export --platform web`, add `dist/.nojekyll`, and publish `dist/` to GitHub Pages — plus `app/index.tsx` (a `Redirect` to `/records`), not called out by name in the original task text but required so the site root (`/`) has an `index.html` at all under static export

**Checkpoint**: `npx expo export --platform web` produces a deployable demo build with zero real
data and zero live AI calls.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T050 [P] Implement full profile data wipe (`wipeProfileData`) with an explicit confirmation step per FR-007, in `src/repositories/nativeStorageRepository.ts` and the Settings screen
- [ ] T051 [P] Implement multi-profile creation/switching with re-authentication per FR-015, in `app/(tabs)/settings.tsx` and `src/services/auth/appLock.ts`
- [ ] T052 Audit all logging/crash-reporting call sites to confirm no record/document/AI content is ever logged, per constitution's "no PHI telemetry" requirement
- [ ] T053 [P] Write Jest unit tests for the native and mock `StorageRepository` and `AiInterpretationProvider` implementations' contract conformance in `__tests__/repositories/` and `__tests__/services/ai/`
- [ ] T054 [P] Write Maestro E2E flows, one per user story, in `e2e/us1-store-data.yaml`, `e2e/us2-trends.yaml`, `e2e/us3-doctor-summary.yaml`, `e2e/us4-ai-interpretation.yaml`
- [ ] T055 Write the repository README (screenshots/GIFs, clone-and-run instructions, EAS downloadable build links, GitHub Pages demo link) at `README.md`
- [ ] T056 Run all quickstart.md validation scenarios end-to-end on both iOS and Android Dev Client builds and record results
- [ ] T057 [P] Implement first-run onboarding: a brief guided walkthrough (or annotated empty states) on `app/(tabs)/records.tsx` and `app/(tabs)/doctor-summary.tsx` pointing a first-time user to "add a record" and "doctor summary," per SC-006 (analyze finding G4)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — no dependency on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational — reuses US1's record data to have
  something to chart, but its own repository/screen work is independent
- **User Story 3 (Phase 5)**: Depends on Foundational — reads data written by US1 and trend
  queries added in US2, but its build/export logic is independent
- **User Story 4 (Phase 6)**: Depends on Foundational — needs a record/document (from US1) as an
  interpretation target, but its provider implementations are independent modules
- **Web Showcase Demo (Phase 7)**: Depends on Foundational (contracts) and reuses the screens
  built in Phases 3-6, since it swaps only the repository/AI provider implementations
- **Polish (Phase 8)**: Depends on all desired user stories (and the web demo, for T055) being complete

### Within Each User Story

- Repository/service methods before the screens that call them
- Story complete and checkpoint-validated before moving to the next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational completes, User Stories 1-4 can be staffed in parallel if team capacity allows
- The Web Showcase Demo phase's [P] tasks (fixtures, mock repository, mock AI provider) can run
  in parallel with each other, and with Polish tasks, once the contracts (Phase 2) and the
  screens they reuse (Phases 3-6) exist

---

## Parallel Example: User Story 1

```bash
# Launch the independent repository slices for User Story 1 together:
Task: "Implement profile CRUD in src/repositories/nativeStorageRepository.ts"
Task: "Implement Health Record CRUD in src/repositories/nativeStorageRepository.ts"
Task: "Implement Document methods in src/repositories/nativeStorageRepository.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run quickstart.md scenario 1 independently
5. This is the smallest deployable/demoable increment — local, private, offline record + document storage

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → validate → MVP
3. Add User Story 2 (Trends) → validate
4. Add User Story 3 (Doctor Summary) → validate
5. Add User Story 4 (AI Interpretation) → validate
6. Add the Web Showcase Demo → deploy to GitHub Pages
7. Polish: tests, README, full quickstart pass

### Parallel Team Strategy

With multiple developers, after Foundational completes: one developer per user story (US1-US4)
in parallel, then a developer picks up the Web Showcase Demo once contracts and at least one
story's screens exist, converging in Polish.

---

## Notes

- [P] tasks = different files/methods, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability; Setup, Foundational, Web
  Showcase Demo, and Polish phases intentionally carry no [Story] label
- Every task references the exact file path it touches, per plan.md's Project Structure
- The Web Showcase Demo (Phase 7) is not a spec.md user story — it was added mid-planning at the
  user's request and is tracked separately so it never gets confused with real-data guarantees
- Commit after each task or logical group; stop at any checkpoint to validate a story independently
