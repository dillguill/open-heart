# Design Direction — Open Heart General Visual Design (new-work)

**Command:** `new-work` · **Scope:** general visual design (replacement world) · **Date:** 2026-08-18
**Status: LOCKED** — the user locked the assigned direction (The Patient Education Pamphlet) via the decision page on 2026-08-18. The build is complete and documented in `DESIGN.md` + `.impeccable/design.json`.

> **Substitution note:** The user was unavailable for the direction lock and asked me to work autonomously and review later. The roll assigned a direction; I weighed the challengers and selected the assigned direction as the working build candidate. The user can re-roll or switch to any alternative on review.

## Seed

- Seed key: `50eeb628` (direction scope, mode: operate)
- Assigned index: 7 of the grounded list
- Grounded list (ordered by resonance): 1 Clinical Chart / Patient File · 2 Vital-Signs Monitor / ECG Trace · 3 Prescription Label / Pharmacy Packaging · 4 Apple Health / Modern Health App (category default) · 5 Clinic Wayfinding · 6 Medical Illustration / Anatomical Plate · 7 Patient Education Pamphlet

## Selected direction — THE PATIENT EDUCATION PAMPHLET

The world of the well-made patient education leaflet: the plain-language, reassuring, carefully structured health information a doctor hands a patient. Everyone in the audience has received one; it is the most trusted, most human artifact in the health world. It is neither the category default (Apple Health clone) nor the predictable opposite (cold clinical/hospital).

### Direction contract

**THESIS** — Open Heart presents the user's health story the way a well-made patient education leaflet does: plain-language, reassuring, structured so anyone — especially a clinician — grasps the whole picture at a glance. It refuses the category default of a generic data-dashboard CRUD shell and the predictable opposite of a cold clinical/hospital aesthetic.

**OWN-WORLD** — Clean paper-white ground with deep green ink (`#0B5D4A`, the committed brand color) as the primary field color; a warm amber accent for highlights and the "not medical advice" disclosure; ruled section rules and callout boxes like a printed leaflet; a humanist sans for body text (plain-language, highly readable) with a confident display face for headings; structured data tables for lab values with tabular numerals (raised from the data-sublime challenger); the AI interpretation presented as a first-class readable transcript (raised from the phosphor-terminal challenger).

**STORY** — The visitor understands immediately that this is a private, trustworthy health vault: their whole story, organized and readable, ready to show a doctor. They believe their data is safe (privacy promise front and center) and that the app speaks plain language, never jargon. They navigate sections like the folds of a well-made leaflet: the summary up front, then records, trends, and settings.

**FIRST VIEWPORT** — The home page opens on the doctor summary as the centerpiece — the patient's story at a glance, structured like the front page of a health leaflet: profile, key vitals and recent labs in a clear table, current medications, a "ready for your visit" note, and the privacy promise as a calm callout. Below: recent activity and a trends preview. Navigation as clear labeled tabs (Home, Records, Trends, Settings).

**FORM** — The Patient Education Pamphlet — position 7 on the grounded list, assigned by the roll (seed key `50eeb628`). Raised by: phosphor-terminal (AI as first-class transcript), data-sublime (tabular monospace numerics for lab values).

**FINISH** — unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

### Raises (from declined challengers)

- **From phosphor-terminal (declined):** AI interpretation is a first-class readable transcript — the explanation reads as a clear, structured conversation, not buried chrome.
- **From data-sublime (declined):** tabular monospace numerics for lab values — precise, aligned data presentation for measurements.

## Challenger verdicts (fused with the product, weighed on audience identification + product clarity)

| Challenger | Verdict | Reasoning |
|---|---|---|
| Tensegrity breathing column | Declined | Engineering force-diagram language is cold and abstract for a health vault; patients don't identify with kinetic sculpture. |
| Alphabet storm | Declined | Surreal typography undermines the calm clarity a health vault requires. |
| Phosphor terminal | Declined | Terminal transcript is intimidating for patients; donated the AI-as-transcript discipline. |
| Data-sublime field | Declined | Dense barcode/sine field is overwhelming for a health vault; donated tabular-numerals discipline. |
| Character goods catalog | Declined | Playful mascot register destroys trust in a health context. |
| Seedbed lobes | **Competitive** | Clean capsule UI holds product clarity, but the bright-green "objects on a lawn" register reads as wellness-app playfulness, weakening audience identification for a serious health vault. Full alternate. |

## Alternatives for the user to consider on review

- **IMPECCABLE'S PICK — The Clinical Chart / Patient File** (my top-ranked grounded candidate): the modern clinical chart with tabbed sections, ruled lines, stamped dates, and a summary sheet on top. The doctor-visit story as a well-organized file. *Honest risk:* the most obvious choice for a patient-file product — familiar and expected.
- **Competitive alternate — Seedbed Lobes:** saturated green field with floating white capsules. *Honest risk:* playful wellness register may undermine the seriousness of a health vault.

## Open decisions (deferred to user review)

- Which direction to lock (assigned pamphlet vs. pick chart vs. competitive lobes vs. re-roll).
- Whether the build proceeds comp-led or code-led (no image generation available in this environment → code-led is the only path; nothing recorded in `.impeccable/config.json`).
- DESIGN.md is written at finish from the built world — not before the build.