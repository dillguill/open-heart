# Shape Brief — Homepage Restructure (Open Heart Web Demo)

**Command:** `shape` · **Scope:** homepage restructure only · **Date:** 2026-08-18
**Status:** CONFIRMED — user answered the discovery questions on 2026-08-18. Remaining open items are marked `[OPEN]`.

## 1. Job and audience

- **Who arrives:** Two audiences on the web demo.
  - **Portfolio viewer** (first-time visitor evaluating the product): needs to "get it" in seconds — what Open Heart is, why it matters, and the privacy promise.
  - **Primary user** (individual tracking their own health): uses the app day-to-day, preparing for a doctor visit; wants the at-a-glance story of their health.
- **Their context:** Portfolio viewer — evaluating craft and concept, short attention, skeptical of health apps. Primary user — managing sensitive data, high-stakes moment (doctor visit) is the product's reason for existing.
- **Visitor mode:** Operate (the visitor completes a task — app UI), with a persuasive first impression for portfolio viewers.

## 2. Outcome and proof

- **Primary task/action:** On home, the visitor sees the at-a-glance doctor summary (the product's hero moment) and can navigate to Records, Trends, and Settings. Portfolio viewers understand "private health vault for a doctor visit" within seconds.
- **Success:** A first-time visitor can describe what Open Heart is and its privacy promise after one viewport; the doctor summary section is the visual anchor; navigation to records/trends is obvious; the walkthrough is dismissible and never forced.
- **Real evidence:** The demo fixtures (`web-demo/fixtures/data.ts` — fictional, never real data) power the summary section. No fabricated claims.

## 3. Selected direction

- **Structural thesis:** Home opens with a **doctor summary callout button at the top** — the clear, prominent entry to the at-a-glance doctor view — and the **rest of the homepage acts as a summary** of the user's health story (recent activity, trends preview). This directly answers the critique's core finding: the demo currently leads with its most painful chore (the entry form) while the doctor-visit story is a placeholder.
- **Sequence:** Home (doctor-summary callout → recent activity → trends preview) → Records (entry + import) → Trends (charts) → Settings (profiles, lock, AI config).
- **Focal moment:** The doctor summary callout — the single most prominent element on home, leading to the at-a-glance view a clinician could read in a visit.
- **Implementation consequence:** New home screen; doctor-summary callout component; full-screen doctor summary route (pushed, not a tab); tab restructure.

## 4. Scope and boundaries

- **Fidelity:** production-ready screen for the web demo.
- **Breadth:** home page restructure only. Portfolio walkthrough **skipped for now** (user decision) — out of scope.
- **Interactivity:** full navigation; doctor-summary callout opens the full-screen summary route.
- **Named target:** new `app/(tabs)/home.tsx`; restructure of `app/(tabs)/_layout.tsx` (remove Doctor Summary tab); doctor-summary callout component; full-screen doctor summary route (moved out of tabs).
- **What remains untouched:** product truth, data model, privacy constraints, existing Records/Trends/Settings functionality, the compliance banner.
- **Anti-goals:** no forced onboarding, no fabricated claims, no real health data in the demo, no diagnosis/treatment language.

## 5. States and ranges

- **Content ranges:** demo fixtures (5 records, 2 documents, 1 AI interpretation); realistic summary range: 3–10 items per category.
- **Material states:** populated (fixtures), empty (no data), loading, error. (No first-run walkthrough in scope.)

## 6. Interaction and layout

- **Hierarchy:** the doctor-summary callout is the visual anchor at the top (largest, most prominent); the rest of home reads as a summary — recent activity secondary, trends preview tertiary.
- **Topology:** single scrollable home page; callout pinned at top, summary sections stacked in reading order below.
- **Responsiveness:** desktop and mobile widths (web demo).
- **Affordances:** clear navigation to Records/Trends; doctor-summary callout is an obvious tap target opening the full-screen summary; summary route carries a print/share affordance `[OPEN]`.
- **Feedback:** navigation feedback; no silent state changes.
- **Transitions:** subtle, purposeful; no gratuitous animation.

## 7. Constraints and open decisions

- **Platform:** web (demo), Expo/React Native; GitHub Pages static export.
- **Accessibility:** contrast, visible focus, logical tab order, screen-reader names.
- **Reusable components:** doctor-summary callout component — promote to shared components.
- **Open decisions (deferred):** exact visual treatment → owned by `new-work` (general design); whether the summary route includes print/share in this scope `[OPEN]`.

## Confirmed decisions (from user, 2026-08-18)

- The doctor summary is a **callout button at the top** of home — not an embedded section, not a separate tab.
- The **rest of the homepage acts like a summary** (recent activity, trends preview).
- **Remove the Doctor Summary tab**; tabs become Home, Records, Trends, Settings.
- **Skip the portfolio walkthrough for now** — out of scope.
- Home is the main entry to the app.
- `shape` owns the homepage restructure; `new-work` owns the general visual design.