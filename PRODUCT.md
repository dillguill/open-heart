# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary — individuals tracking their own health: a person who keeps a private, portable record of their own health data and documents on their own device, so they can understand their health over time and share a comprehensive view with a clinician during a visit. No account or login; the data is theirs alone.

Secondary — the clinician reviewing the doctor summary during a visit: a viewer, not an app user; they see an organized snapshot without installing the app, logging in, or needing internet. Caregivers tracking a dependent are served by the multiple-profiles capability (confirmed feature), not a separate primary audience.

## Product Purpose

A private, local-first personal health vault in the spirit of Apple Health: store health data points (vitals, labs, medications, conditions) and documents (lab reports, imaging, prescriptions, discharge summaries) entirely on-device; view trends over time as charts; present a consolidated at-a-glance summary to a doctor; and get plain-language, non-diagnostic AI explanations of a record or document (on-device model by default, opt-in external API). Success means the user's health history is private by default, fully usable offline, and presentable to a clinician at a glance.

## Positioning

A portable store of the user's own health information that is private by default: data lives only on the device (encrypted at rest behind a biometric/passcode app lock), there is no account and no server, and nothing leaves the device unless the user explicitly opts in (external AI) or exports. Neighboring products sync to the cloud or require accounts; Open Heart's differentiator is that the whole story of a patient's data can be handed to a doctor during a visit — without the doctor needing the app, an account, or a connection — while never residing anywhere but the user's device.

## Operating Context

- The current primary surface is the sample-data-only static web build on GitHub Pages, powered by the mock storage/AI adapters in `web-demo/` with fictional fixtures (never real user data). The product is an Expo/React Native app planned to ship natively on iOS 15+ and Android 10+ (EAS / Dev Client; Expo Go unsupported); design work today targets the web surface.
- Core workflows: entering measurements (e.g., blood pressure, weight, labs) with date/time; importing documents (PDF, JPG, PNG) via file picker or camera, tagged with a category; reviewing trends over a selectable time range; preparing and presenting the doctor summary before/during a visit; requesting an AI explanation of a stored record or document.
- Fully offline-capable for entry, storage, trends, and doctor summary; no account, no login, no cloud sync (out of scope).
- Performance targets (spec SC-001…SC-006): new entry < 30 s; trend chart < 1 s for a multi-year dataset; cold start < 2 s; AI responses are async and may take seconds.
- Security model: per-profile SQLCipher-encrypted SQLite database; documents in the OS-protected sandbox; encryption key in Keychain/Keystore via `expo-secure-store`; app-level passcode/biometric lock before health data is viewable; zero PHI in logs, crash reports, or analytics.
- The product is a personal/portfolio project — a showcase of craft and engineering, not a commercial release.

## Capabilities and Constraints

Confirmed capabilities (spec FR-001…FR-015):
- Manual entry of structured health data points (category, metric, value, unit, date/time, notes).
- Document import and camera capture (PDF, JPG, PNG), associated with a date and category.
- Trend charts for repeated metrics over selectable time ranges.
- Consolidated doctor summary organized by category, presentable/exportable without the doctor installing the app.
- Delete individual records/documents and wipe the entire local store.
- Multiple profiles per device (self + dependents), each with its own encrypted database.
- AI interpretation: on-device local model by default; opt-in external API with first-use disclosure of exactly what will be sent; every explanation labeled informational, not medical advice.
- App lock (biometric or passcode) gating access to health data.

Non-negotiable constraints:
- Local-first, privacy by default: no server-side storage anywhere in the design.
- Offline-capable for all core flows.
- Zero PHI transmitted without explicit per-destination opt-in (FR-010); zero PHI in logs/telemetry.
- AI explanations are informational, never diagnostic (FR-009; non-negotiable).
- The user owns and can delete their data (per-record and full wipe).
- The GitHub Pages demo must never require or expose a real AI key and must never persist visitor-entered data as real health data.

Explicitly out of scope: cloud sync/backup, structured import from wearables/EHR exports, multi-user sharing between separate people's accounts, EHR system integration, two-way messaging, and any diagnosis or treatment advice from AI.

## Brand Commitments

- Name: "Open Heart" (Expo app name, repo `open-heart`, URL scheme `openheart`).
- Primary brand color: `#0B5D4A` (deep green) — used as the tab accent, splash background, and adaptive icon background.
- Voice and stance: plain-language and measured; health data is treated as serious and sensitive; AI output is always labeled as informational, never diagnostic.
- The "open" in the name reflects the user's ownership of their data, not open sharing.

## Evidence on Hand

- Feature specification, implementation plan, data model, research, and contracts: `specs/001-personal-health-vault/` (`spec.md`, `plan.md`, `data-model.md`, `research.md`, `contracts/`).
- Fictional demo fixtures in `web-demo/fixtures/data.ts` — explicitly never real user data; no real testimonials, users, press, or clinical validation exist, and future work must not fabricate them.
- Working implementation: Expo app with Records, Trends, Doctor Summary, and Settings surfaces; mock storage/AI adapters power the web demo.
- Success criteria and performance targets in the spec (SC-001…SC-006).

## Product Principles

1. Privacy by default — data stays on the device unless the user explicitly opts in; every external transmission is disclosed before it happens.
2. Offline is a first-class state — entry, storage, trends, and the doctor summary never require a network.
3. The doctor visit is a primary moment — the data must be comprehensible at a glance by someone who does not have the app.
4. AI explains, never diagnoses — interpretations are informational and always labeled as such.
5. The user owns their data — per-record delete and full wipe, no lock-in.

## Accessibility & Inclusion

- Unlock supports biometrics (Face ID, fingerprint) with a passcode fallback.
- No product-specific formal accessibility standard has been established; that remains an open item for future work.
