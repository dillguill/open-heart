<!--
Sync Impact Report
- Version change: [none] → 1.0.0 (initial ratification)
- Modified principles: n/a (first adoption)
- Added sections:
  - Core Principles: I. Local-First, Privacy by Default; II. Offline-Capable by Default;
    III. Explicit Consent for Any External Data Transmission; IV. AI Explanations Are
    Informational, Never Diagnostic (NON-NEGOTIABLE); V. User Owns and Controls Their Data
  - Data Handling & Compliance Requirements
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: none
- Deferred/TODO placeholders: none
- Derived from: README.md and specs/001-personal-health-vault/spec.md (Personal Health Vault)
-->

# Open Heart Constitution

## Core Principles

### I. Local-First, Privacy by Default

All user health data and documents MUST be stored locally on the user's device (or other
storage entirely under the user's control) by default. No feature may require a third-party
cloud account or server-side storage of health data to function.

Rationale: privacy is the app's foundational promise. Centralizing protected health information
in vendor-operated infrastructure would violate the core value proposition and create a single
point of compromise for highly sensitive data.

### II. Offline-Capable by Default

Core functionality — data entry, document storage, trend viewing, and the doctor summary view —
MUST work fully without a network connection. Network access MAY be used only for optional,
explicitly opted-in features (e.g., an external AI API).

Rationale: a portable, private health record must not depend on connectivity, which may be
unavailable exactly when it matters most, such as in a clinic or hospital with poor signal.

### III. Explicit Consent for Any External Data Transmission

The system MUST NOT transmit any user health data outside the device unless the user has
explicitly opted in for that specific destination, and MUST disclose what data will be sent
before the first transmission to each newly configured external destination.

Rationale: even well-intentioned integrations, such as a cloud AI provider, create real privacy
risk when handling sensitive health information. Consent must be informed and specific to each
destination, never blanket or implied.

### IV. AI Explanations Are Informational, Never Diagnostic (NON-NEGOTIABLE)

Any AI-generated interpretation of health data MUST be clearly labeled as informational and not
medical advice, MUST NOT present diagnoses or treatment recommendations, and MUST indicate
whether a local or external model produced it.

Rationale: this app helps patients understand and prepare their own records; it is not a
substitute for clinical judgment. Blurring that line is both a safety risk to users and a
liability risk to the project.

### V. User Owns and Controls Their Data

Users MUST be able to view, export, and permanently delete any individual record, document, or
their entire local data store at any time, without contacting a vendor or support channel.

Rationale: a health data vault that cannot be fully exported or purged by its owner is not
actually private or user-owned, regardless of where the data technically resides.

## Data Handling & Compliance Requirements

- Data at rest MUST rely on the device's OS-level encryption plus an app-level passcode or
  biometric lock; any stronger scheme MUST be introduced via a constitution amendment, not
  silently in a feature plan.
- No analytics or telemetry that includes health data content MAY be collected. Aggregate,
  content-free usage metrics (e.g., crash counts) are permitted only if they cannot be
  reconstructed into health information.
- Any external AI API integration MUST use user-supplied credentials and MUST send data only to
  the user's chosen provider directly — never proxied through project-operated servers.
- Multiple profiles on one device (e.g., for a dependent) MUST remain isolated from each other
  such that one profile's data is not visible from another without explicit switching.

## Development Workflow & Quality Gates

- Every feature that touches health data storage, export, or transmission MUST include an
  explicit privacy/security review before merge, checked against the Core Principles above.
- Features MUST be sliced into independently testable, independently valuable user stories, and
  each story MUST be verifiable on its own per the project's spec-driven workflow.
- Trend/chart rendering and AI interpretation features MUST be verified against sample data
  covering sparse, duplicate, and outlier cases before release.
- Any deviation from a Core Principle MUST be explicitly justified in the relevant plan's
  Complexity Tracking section; unjustified deviations block progression to implementation.

## Governance

This constitution supersedes ad hoc practices and prior undocumented conventions. Amendments
require a documented rationale for the change and a version bump according to the policy below,
recorded in a Sync Impact Report at the top of this file.

- **MAJOR**: Backward-incompatible governance changes, or removal/redefinition of a Core
  Principle.
- **MINOR**: A new principle or materially expanded section is added.
- **PATCH**: Clarifications, wording, and non-semantic refinements.

All specs and plans MUST verify compliance with these principles during their Constitution
Check phase. Reviewers MUST treat unjustified complexity or unexplained deviation from a
principle as a blocking issue, not a style preference.

**Version**: 1.0.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-11
