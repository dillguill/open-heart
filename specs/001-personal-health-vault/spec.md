# Feature Specification: Personal Health Vault

**Feature Branch**: `001-personal-health-vault`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "the idea of the app is similar to another project called \"open health\". the scope of the project is a apple health-like application that allows for people to privately and locally store their healthcare data and documents as well as track and view trends with their data. it is meant to be a portable store of healthcare information that emphasizes privacy and meant to be shown to a doctor so the doctor can have a comprehensive view of the patients history and data at a glance. also with ai integration (api or local) to interpret that data and give non-medical advice explanations of the information"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Store health data and documents locally (Priority: P1)

A person adds their health records — data points (vitals, labs, conditions, medications) and documents (lab reports, imaging, prescriptions, discharge summaries) — into the app, which are all stored locally on their device rather than in a third-party cloud service.

**Why this priority**: This is the foundational capability. Without local, private storage, no other feature (trends, doctor view, AI interpretation) has data to operate on.

**Independent Test**: Can be fully tested by adding a data entry and a document, restarting the app, and confirming the data persists and is accessible only on-device.

**Acceptance Scenarios**:

1. **Given** no existing records, **When** a user manually enters a health data point (e.g., a blood pressure reading) with a date, **Then** the entry is saved locally and appears in the record list.
2. **Given** no existing records, **When** a user imports a document (e.g., a PDF lab report), **Then** the document is stored locally and associated with a date and category.
3. **Given** the device has no network connection, **When** a user adds or views health data, **Then** all functionality works fully offline.

---

### User Story 2 - Track and view trends (Priority: P1)

A person views trends over time for repeated measurements (e.g., weight, blood pressure, glucose) presented as charts, so they can understand how their health is changing.

**Why this priority**: Trend visualization is a core differentiator from being just a document store and is central to the product's "Apple Health-like" value proposition. It ties for top priority with storage since it's a primary reason to use the app day-to-day.

**Independent Test**: Can be fully tested by entering the same metric type at three different dates and confirming a trend view renders a chronological chart.

**Acceptance Scenarios**:

1. **Given** at least two data points of the same metric type recorded on different dates, **When** the user opens the trend view for that metric, **Then** a chronological chart is displayed showing the values over time.
2. **Given** a metric with only one recorded data point, **When** the user opens its trend view, **Then** the app shows the single point without error and indicates more data is needed for a trend.

---

### User Story 3 - Present a comprehensive view for a doctor visit (Priority: P2)

A person shows or shares a consolidated, at-a-glance view of their relevant health history and current data with a doctor during a visit.

**Why this priority**: This is a key stated purpose of the app — portability for care visits. It depends on Story 1 (data must exist) and benefits from Story 2 (trends), so it follows them, but it's the primary way the app's value is delivered outward to a clinician.

**Independent Test**: Can be tested by populating several records across categories, opening the doctor-facing summary view, and confirming it presents an organized snapshot without requiring the doctor to have the app installed.

**Acceptance Scenarios**:

1. **Given** a person has multiple records across categories (conditions, medications, labs, vitals), **When** they open the doctor summary view, **Then** they see a single consolidated view organized by category with recent trends highlighted.
2. **Given** a person wants to share the summary with a doctor who does not have the app, **When** they export or present the summary, **Then** the doctor can view it (e.g., on-screen handoff or an exported file) without needing an account or internet access.

---

### User Story 4 - AI-assisted interpretation of health data (Priority: P3)

A person asks the app to explain a piece of their health data (e.g., "what does this lab value mean?") and receives a plain-language, non-medical-advice explanation, using either a local AI model or a configured external AI API.

**Why this priority**: Adds significant value but is additive on top of the data being present and organized. The app is usable and valuable without it (Stories 1-2 stand alone), which makes it appropriate for a later increment.

**Independent Test**: Can be tested by selecting a stored data point or document and requesting an explanation, then confirming the response is informational rather than diagnostic and clearly labeled as not medical advice.

**Acceptance Scenarios**:

1. **Given** a stored lab result, **When** the user requests an AI explanation, **Then** the app returns a plain-language description of what the value/metric generally means, labeled as informational and not medical advice.
2. **Given** the user has not configured any external AI API, **When** they request an explanation, **Then** the app uses a local model (if available) or clearly informs the user that AI interpretation is unavailable, without silently sending data anywhere.
3. **Given** the user configures an external AI API, **When** they request an explanation for the first time, **Then** the app informs them what data will be sent externally and requires explicit opt-in before sending anything.

---

### Edge Cases

- What happens when a user imports a document in an unsupported file format?
- How does the system handle duplicate entries (e.g., the same lab result imported twice)?
- What happens when local storage runs low on space?
- What happens when a user wants to delete a single record or their entire data store?
- How does the trend view handle data with irregular/sparse intervals or outlier values?
- What happens if the external AI API is unreachable or returns an error during an interpretation request?
- How does the system handle multiple profiles on one device (e.g., a parent tracking a dependent's records)?
- What happens when a user tries to view the doctor summary or add data while the app-level lock is engaged and they fail to authenticate?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to manually enter structured health data points (e.g., vitals, lab values, medications, conditions) with an associated date/time.
- **FR-002**: System MUST allow users to import and store health-related documents (e.g., PDFs, images) associated with a date and category.
- **FR-003**: System MUST store all health data and documents locally on the user's device by default, without requiring transmission to a third-party server for storage.
- **FR-004**: System MUST allow users to view historical trends for repeated metrics as charts over a selectable time range.
- **FR-005**: System MUST provide a consolidated summary view that organizes a user's health history and current data by category for presentation to a doctor.
- **FR-006**: System MUST allow users to export or present the summary view to a doctor without requiring the doctor to install the app or have an account.
- **FR-007**: System MUST allow users to delete individual records/documents and to delete their entire local data store.
- **FR-008**: System MUST provide an AI-assisted interpretation feature that explains selected health data in plain, non-diagnostic language.
- **FR-009**: System MUST clearly label all AI-generated explanations as informational and not medical advice.
- **FR-010**: System MUST NOT transmit user health data to an external AI API unless the user has explicitly opted in, and MUST disclose what data will be sent before the first such transmission.
- **FR-011**: System MUST support at least one local (on-device) AI interpretation option that requires no external network transmission of health data.
- **FR-012**: System MUST remain fully functional for data entry, storage, and trend viewing without a network connection.
- **FR-013**: System MUST allow users to categorize/tag health data and documents (e.g., vitals, labs, medications, imaging, notes).
- **FR-014**: System MUST protect locally stored health data at rest by relying on the device's OS-level storage encryption and MUST require an app-level lock (passcode or biometric) before health data can be viewed within the app.
- **FR-015**: System MUST support multiple profiles on a single device so a user can track records for a dependent separately from their own.

### Key Entities *(include if feature involves data)*

- **Health Record**: A discrete data point about a user's health (metric type, value, unit, date/time, optional notes, category).
- **Document**: An imported file (e.g., PDF, image) representing a health artifact (lab report, imaging result, prescription, discharge summary), with associated date and category metadata.
- **Trend/Metric Series**: A collection of Health Records of the same metric type over time, used to render charts.
- **Doctor Summary View**: A generated, consolidated presentation of a user's Health Records and Documents, organized for external (in-visit) review.
- **AI Interpretation Request/Response**: A record of a user's request to interpret a specific Health Record or Document and the resulting explanation, including which AI source (local or external) was used.
- **Profile**: Represents one person's data set on the device; a device may hold multiple profiles (e.g., self and a dependent).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add a new health data entry in under 30 seconds.
- **SC-002**: A user can locate and view a trend chart for any tracked metric in 3 or fewer taps/clicks from the home screen.
- **SC-003**: 100% of previously stored health data and documents remain accessible with the device fully offline.
- **SC-004**: A user can open a doctor-ready summary view in under 1 minute.
- **SC-005**: Zero instances of health data being sent to an external AI API without explicit prior user opt-in, verified in testing.
- **SC-006**: A first-time user can, within 5 minutes of first use and without external help, successfully add a record and locate the doctor summary view.

## Assumptions

- "Locally" means data is stored on the user's own device (or a storage location entirely under the user's control) rather than a vendor-operated cloud service; a future sync/backup feature is out of scope for this spec.
- Data-at-rest protection relies on the device's OS-level encryption plus an app-level passcode/biometric lock, consistent with how the referenced Apple Health app protects data, rather than introducing separate app-managed encryption keys.
- The app targets one primary user per profile, with optional additional profiles for dependents; full multi-user collaboration or sharing between separate people's own accounts is out of scope.
- The doctor summary view is read-only and presentation-oriented; it does not include two-way messaging or integration with clinical EHR systems in this scope.
- Supported document types are common consumer formats (PDF, JPG/PNG); structured data import from wearables or EHR export files is out of scope for this initial spec.
- AI interpretation explicitly excludes diagnosis, treatment recommendations, or any actionable medical advice — it is limited to explaining what data/terms generally mean.
- No account creation or login is required to use the app; any external AI API credentials are configured and stored locally by the user.
