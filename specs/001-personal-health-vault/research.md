# Research: Personal Health Vault

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Consolidates the technology decisions needed to resolve the Technical Context unknowns before
Phase 1 design. Each entry follows Decision / Rationale / Alternatives Considered.

## 1. Mobile framework & build workflow

**Decision**: React Native via Expo, using a custom Dev Client / prebuild (Continuous Native
Generation) workflow — not Expo Go.

**Rationale**: The constitution requires OS-level encryption, a biometric app lock, and an
on-device AI runtime. Every one of those depends on native modules (op-sqlite/SQLCipher,
expo-local-authentication's FaceID entitlement, llama.rn) that Expo Go does not support, since
Expo Go ships a fixed set of pre-built native modules. Expo's Dev Client / CNG workflow keeps
the managed-workflow developer experience (TypeScript, Expo SDK APIs, `expo-build-properties`
config plugins, EAS Build) while allowing these specific native modules to be compiled in.
[Expo Dev Client vs Expo Go: 2026 Migration Guide](https://www.72technologies.com/blog/expo-dev-client-vs-expo-go-2026),
[Expo or bare React Native in 2026](https://silpho.com/blog/expo-or-bare-react-native-2026)

**Alternatives considered**: Bare React Native CLI — gives full native control but discards
Expo's build/update tooling (EAS Build/Update, config plugins) for no benefit here, since the
Dev Client path already unlocks the native modules this app needs. Expo Go — rejected outright;
cannot load the required native modules.

## 2. Encrypted local structured storage

**Decision**: `@op-engineering/op-sqlite` (single package, actively maintained — v18.1.1 as of
this writing) with SQLCipher enabled via its `package.json` build config, as the primary database
for structured Health Records.

**Rationale**: op-sqlite is a JSI-based SQLite binding with substantially better throughput and
memory use than `expo-sqlite`/`react-native-quick-sqlite`. SQLCipher is a **compile-time config
flag on the main package**, not a separate package: adding a top-level `"op-sqlite": { "sqlcipher":
true }` block to `package.json` swaps the underlying SQLite implementation for SQLCipher, which
encrypts the entire database file with a caller-supplied key, directly satisfying the
constitution's data-at-rest requirement. No Expo config plugin is required — only
`expo prebuild` (Dev Client / CNG, consistent with #1) and correctly set up CocoaPods on iOS.
**Correction from an earlier research pass**: a separate npm package, `@op-engineering/op-sqlcipher`,
also exists but was last published in 2024 (v2.0.x) against a much older op-sqlite baseline — it
is effectively unmaintained and was not used. The current, correct path is the config flag on the
actively maintained package, confirmed directly against the current installation docs.
[OP-SQLite installation docs](https://op-engineering.github.io/op-sqlite/docs/installation/),
[OP-SQLite README](https://github.com/OP-Engineering/op-sqlite)

**Alternatives considered**: `expo-sqlite` (plain) — no encryption. WatermelonDB/Realm — add an
ORM/sync layer this app doesn't need. `@op-engineering/op-sqlcipher` (the standalone fork) —
rejected once verified as stale/unmaintained relative to the config-flag approach in the
actively maintained package.

## 3. Document (file) storage

**Decision**: `expo-file-system` for storing imported documents in the app's private sandboxed
directory, combined with `expo-document-picker` and `expo-image-picker` for import.

**Rationale**: Files placed in the app's sandboxed container inherit the OS's per-app data
protection (iOS Data Protection / Android app-private storage), matching the constitution's
"OS-level encryption" default without inventing a separate file-encryption scheme. This keeps
the trust boundary consistent with how the database key is protected (see #4).
[Expo FileSystem docs](https://docs.expo.dev/versions/latest/sdk/filesystem/),
[expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)

**Alternatives considered**: `react-native-fs` — largely superseded by `expo-file-system` in the
Expo ecosystem; no material advantage for this use case.

## 4. Secure key storage & app-level biometric lock

**Decision**: `expo-secure-store` (iOS Keychain / Android Keystore-backed Encrypted
SharedPreferences) to hold the per-profile database encryption key, gated by
`expo-local-authentication` (Face ID / Touch ID / Android Biometric Prompt) before the key is
released and the database is opened.

**Rationale**: This directly implements the constitution's "OS-level encryption plus app-level
passcode/biometric lock" requirement: the biometric prompt is the gate, and the platform
Keychain/Keystore is the vault for the key that unlocks SQLCipher. `expo-secure-store` has a
known ~2048-byte practical limit on iOS but a symmetric encryption key comfortably fits.
[SecureStore docs](https://docs.expo.dev/versions/latest/sdk/securestore/),
[LocalAuthentication docs](https://docs.expo.dev/versions/latest/sdk/local-authentication/)

**Alternatives considered**: `react-native-keychain` — offers finer-grained access-group control
but expo-secure-store's simpler cross-platform API is sufficient since this app has no
Keychain-sharing-across-apps requirement.

## 5. Trend charting

**Decision**: Victory Native (Skia-backed rendering).

**Rationale**: Skia-backed rendering draws on the native side rather than through the JS bridge,
which keeps trend charts smooth even as a profile accumulates years of data, and Victory's API
is well documented for time-series line/scatter charts, which is the primary trend visualization
this app needs.
[Victory Native Charts Tutorial 2026](https://reactnativerelay.com/article/react-native-charts-victory-native-interactive-data-visualizations-expo)

**Alternatives considered**: `react-native-gifted-charts` — very polished defaults but less
suited to the axis/range customization trend views need. `react-native-chart-kit` — simplest API
but not Skia-backed and less maintained for large datasets.

## 6. Doctor summary export

**Decision**: `expo-print` to render the summary (built from HTML/CSS) to a PDF, and
`expo-sharing` to hand it off (AirDrop, email, on-screen, printer) without any server involved.

**Rationale**: This is a fully on-device, no-network path from structured data to a
doctor-presentable artifact, satisfying both the offline-capable and local-first principles.
[Expo Print docs](https://docs.expo.dev/versions/latest/sdk/print/)

**Alternatives considered**: A native PDF-generation library — unnecessary complexity; HTML→PDF
via expo-print is sufficient for a formatted, printable summary document.

## 7. On-device AI interpretation

**Decision**: `llama.rn` (a React Native binding of `llama.cpp`) running a small quantized GGUF
model, downloaded on first use rather than bundled into the app binary.

**Rationale**: llama.rn is an actively maintained binding purpose-built for on-device GGUF
inference in React Native, with GPU acceleration on supported devices, and is used in shipping
apps for exactly this offline-chat-style use case. It requires React Native's New Architecture
and a custom Dev Client — consistent with the workflow decision in #1. Downloading the model on
first run (rather than bundling multiple GBs into the app binary) keeps the app store download
size reasonable and lets the user skip AI features entirely if they choose.
[llama.rn](https://github.com/mybigday/llama.rn),
[Guide to Running AI Models Locally on Mobile with llama.rn](https://medium.com/godel-technologies/guide-to-running-ai-models-locally-on-mobile-devices-using-react-native-and-llama-rn-fcd41adbc597)

**Alternatives considered**: MLC-LLM / ExecuTorch — viable but less mature RN bindings and
smaller community track record than llama.rn for this specific integration. Cloud-only AI —
rejected; the constitution requires a local option that needs no external network transmission
(Principle III/IV).

## 8. External AI API integration pattern

**Decision**: When a user opts in, the app calls the user's chosen AI provider directly from the
device using a user-supplied API key stored via `expo-secure-store`. No project-operated server
is in the request path.

**Rationale**: Directly required by the constitution's Data Handling section ("external AI API
integration MUST use user-supplied credentials and MUST send data only to the user's chosen
provider directly — never proxied through project-operated servers").

**Alternatives considered**: A thin backend proxy to normalize provider APIs — rejected; it would
put the project in the path of PHI transmission, which the constitution explicitly forbids.

## 9. End-to-end testing

**Decision**: Jest + React Native Testing Library for unit/component tests; Maestro for E2E
flows (YAML-defined black-box flows against the running app).

**Rationale**: Maestro's black-box, accessibility-layer approach reports materially lower
flakiness than Detox in current comparisons and has a much smaller CI/build configuration burden
tools like Detox require, and its YAML flows are easy to keep alongside the app in the repo for
anyone who wants to see (and verify) the demo scenarios in the success criteria.
[Detox vs. Maestro: Reducing Flakiness in React Native](https://maestro.dev/insights/detox-vs-maestro-reducing-flakiness-react-native)

**Alternatives considered**: Detox — deeper native/JS-thread synchronization but a heavier setup
and build-tooling burden not justified for a single-app project.

## 10. GitHub Pages showcase demo

**Decision**: A separate, sample-data-only web build exported via Expo's web target
(`expo export --platform web`, backed by React Native Web) and deployed to GitHub Pages. The web
build swaps in mock implementations of the Storage Repository and AI Interpretation Provider
contracts (see `contracts/`) that serve fixed fictional demo data and pre-canned AI explanation
text — it never persists real user input and never calls a live AI provider, so no API key needs
to be exposed in a public static deployment.

**Rationale**: The native app's core trust model (SQLCipher-encrypted DB, Keychain-backed key,
biometric lock, on-device inference) is not reproducible in a browser, and the constitution's
data-at-rest/consent principles apply to *real* user health data, not to fixture data that never
leaves a public demo bundle. Building the app around the Storage/AI provider interfaces (see
`contracts/`) means the web target only needs alternate implementations of those two seams, not a
parallel app. GitHub Pages serves static files from a repo path, so the build needs
`expo.experiments.baseUrl` set to `/<repo-name>` in the Expo app config and a `.nojekyll` file in
the exported `dist/` directory,
since GitHub Pages' default Jekyll processing otherwise strips the `_expo` output directory
(leading underscore).
[Expo: Publish websites](https://docs.expo.dev/guides/publishing-websites/),
[Expo: Publish your web app](https://docs.expo.dev/deploy/web/)

**Alternatives considered**: A fully interactive web build with real (browser-persisted) user
data — rejected per user decision; it would misrepresent the app's actual security guarantees on
a public URL. No live demo, README-only — rejected; a sample-data walkthrough was preferred over
skipping a hosted demo entirely.

## Open items resolved

All Technical Context unknowns are resolved above; none remain marked NEEDS CLARIFICATION.
