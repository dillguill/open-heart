---
name: Open Heart
description: A private, local-first personal health vault — plain-language, reassuring, ready to show a doctor.
colors:
  paper: "#FDFCF8"
  paper-deep: "#F4F1E8"
  ink: "#1F2A26"
  ink-muted: "#5C6B64"
  green: "#0B5D4A"
  green-deep: "#0A4A3B"
  green-soft: "#E3EFEA"
  amber: "#E8A33D"
  amber-soft: "#FBF1DC"
  rule: "#D8D2C4"
  error: "#B23A2E"
  error-soft: "#F9E9E7"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif'
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif'
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
  heading:
    fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif'
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    fontSize: "15px"
    lineHeight: 1.4
  label:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  xxxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.green}"
    rounded: "{rounded.md}"
    padding: "13px 20px"
  chip:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  chip-active:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.rule}"
  callout-green:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green-deep}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.green}"
  callout-amber:
    backgroundColor: "{colors.amber-soft}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.amber}"
---

# Design System: Open Heart

## Overview

**Creative North Star: "The Patient Education Pamphlet"**

Open Heart presents the user's health story the way a well-made patient education leaflet does: plain-language, reassuring, and structured so anyone — especially a clinician — grasps the whole picture at a glance. The page is paper, not glass: a warm paper-white ground with deep green ink, ruled section lines, callout boxes, and tabular numerals for measurements. It deliberately refuses the generic data-dashboard CRUD shell — no floating glass cards, no neon accents, no sparklines standing in for content.

The system is flat and tonal. Depth comes from paper layering and hairline rules, never from shadows. The interface reads like the folds of a well-organized leaflet: the summary up front, then records, trends, and settings, each section separated by a printed rule. Calm is a feature — this is health data, treated with the seriousness and quiet care of a clinic brochure, while the brand green carries the moments of trust: the privacy promise, the doctor-summary callout, the primary actions.

**Key Characteristics:**
- Paper-white ground with deep green ink (`#0B5D4A`) — one committed accent, used on whole regions, never scattered
- Ruled section headers and hairline dividers instead of shadows
- Callout boxes (green for privacy/positive, amber for disclosures, red for destructive)
- Tabular numerals for all measurements and lab values
- Humanist sans body paired with a warm editorial serif display (Source Serif 4)
- Authored SVG icons in one consistent 1.8px stroke — no glyphs, no emoji

## Colors

The palette is restrained: warm paper neutrals plus one committed deep green. Color commits at region scale — fields and callouts own whole areas rather than scattering accents over a neutral ground.

### Primary
- **Deep Leaf Green** (`#0B5D4A`): the committed brand accent. Owns the primary buttons, the doctor-summary callout, the privacy callout border, active chips, the demo banner, and the tab bar's active state. White text on it reads ~7:1.
- **Deep Ink Green** (`#0A4A3B`): darker green for text on the soft green tint.
- **Soft Mint** (`#E3EFEA`): the green-tinted callout ground and icon wells — positive/privacy surfaces.

### Neutral
- **Warm Paper** (`#FDFCF8`): the page ground. Slightly warm white, like the paper of a printed leaflet.
- **Cream Stock** (`#F4F1E8`): inset panels, unselected chips, icon wells, the profile card.
- **Ink** (`#1F2A26`): near-black, green-tinted body text.
- **Muted Ink** (`#5C6B64`): secondary text — tinted from the green hue, never neutral gray.
- **Hairline Rule** (`#D8D2C4`): warm borders and dividers — the leaflet's printed rules.
- **White** (`#FFFFFF`): card and table surfaces.

### Secondary
- **Amber** (`#E8A33D`): the disclosure accent — "not medical advice" and information callouts (amber-soft `#FBF1DC`).
- **Stamp Red** (`#B23A2E`): destructive actions and errors (error-soft `#F9E9E7`).

### Named Rules
**The Paper Rule.** Text never sits on glass or gradient; every surface is a flat paper tone with a hairline rule. If a surface needs separation, layer a cream or white sheet, never a shadow.

## Typography

**Display Font:** Source Serif 4 (with Georgia, Times New Roman, serif fallback — loaded on web via Google Fonts)
**Body Font:** System sans stack (`-apple-system`, BlinkMacSystemFont, Segoe UI, Roboto)
**Label/Mono Font:** none distinct — tabular numerals via `fontVariant: ['tabular-nums']` on the body font

**Character:** A warm editorial serif for the voice of headings — the type a well-printed health pamphlet sets its titles in — paired with a highly readable humanist sans for body. The pairing is calm and trustworthy, never clinical-cold and never playful.

### Hierarchy
- **Display** (700, 34px, 1.15): page and screen titles — "Open Heart", surface headings.
- **Title** (700, 22px, 1.2): card and callout titles, chart stat values.
- **Heading** (600, 17px, 1.3): section headers, tab-bar header titles.
- **Body** (400, 15px, 1.4): primary reading text, list rows, table labels. Max line length ~65ch via the 720px content column.
- **Label** (600, 12–13px): field labels, callout titles (uppercase, 0.02em tracking), muted metadata.

### Named Rules
**The Measure Rule.** All measurement values — lab results, vitals, chart stats — render with `fontVariant: ['tabular-nums']` so columns and comparisons align. Numbers are data, and data is tabular.

## Layout

Content sits in a centered column: `maxWidth: 720px` (surfaces) or 520px (auth screens), `alignSelf: center`, full-width on small screens. The spacing rhythm: `4 / 8 / 12 / 16 / 24 / 32 / 48` (xs–xxxl). Tight groups use 8–12px; sections separate by 24–32px with a ruled section header between them. More space sits above a heading than below it. On desktop the page never stretches full-bleed — a leaflet has a readable column, and so does the app.

## Elevation & Depth

**The system is flat. There are no shadows.** Depth is conveyed by tonal paper layering (paper → cream → white cards) and by 1px hairline rules (`#D8D2C4`). The pressed state of an interactive element is a slight opacity dim (`opacity: 0.85`), not a lift. The only exception is the modal backdrop, a 50% dark tint over the page — a sheet laid over the paper, not a shadow.

## Shapes

The form language is gently rounded print: small radii (`8px` icon wells, `12px` buttons/cards/callouts, `16px` large callouts and the summary card) and full pills (`999px`) reserved for small controls — category chips and status badges. One border style: the 1px hairline rule. No hard offset shadows, no clipped geometry, no bevels — surfaces are flat paper sheets with a printed edge.

## Components

### Buttons
- **Shape:** radius 12px, generous padding (primary 14/20, secondary 13/20).
- **Primary:** deep green fill, white 600 text, optional leading icon. The single dominant action per screen.
- **Secondary:** paper fill, green 600 text, 1px green border — used for import actions and profile management.
- **State:** pressed dims to 0.85 opacity; disabled drops to 0.5.

### Chips
- **Style:** pill (999px), cream stock fill with a hairline border, green 500 text.
- **State:** selected flips to deep green fill with white 600 text — the active filter or category is unambiguous at a glance.

### Cards / Containers
- **Corner Style:** radius 12px; the doctor-summary callout and modal use 16px.
- **Background:** white cards over the paper ground; cream for inset panels and icon wells.
- **Shadow Strategy:** none — hairline border + tonal layering.
- **Border:** 1px `#D8D2C4`.
- **Internal Padding:** 16–24px.

### Inputs / Fields
- **Style:** paper/white fill, 1px hairline border, radius 12px, 12px padding, 15px text.
- **Focus:** default platform focus ring (the field border carries the state).
- **Error / Disabled:** errors surface as Alert copy and the red delete affordance; no invented inline validation chrome.

### Navigation
- **Tabs:** Home, Records, Trends, Settings — authored 1.8px stroke SVG icons, 11px 600 labels, active tint deep green, inactive muted ink, hairline top border on the paper bar.
- **Sub-navigation:** header back buttons (40px cream squares) on doctor summary and record detail; full-screen routes push without a tab bar.

### Doctor Summary Callout (signature)
The Home screen's focal element: a deep green sheet (radius 16px, 24px padding) with a heart icon well, the display-serif title "Your health at a glance", a plain-language description, and a chevron. It is the leaflet's front-page promise — the at-a-glance story, made to show a doctor — and the single most prominent tap target on the app.

### Callouts
Tinted sheets with a 1px border and an optional leading icon: green (privacy/positive), amber (disclosures), red (destructive), neutral (cream, informational). A small uppercase title sits above body text; used for the privacy promise, the doctor-summary disclaimer, and "coming next" notices.

### Data Table
Bordered white sheet with ruled rows: label + optional date meta on the left, tabular-numeral value on the right. Used for at-a-glance vitals, medications, conditions, and documents — the pamphlet's structured data.

## Do's and Don'ts

### Do:
- **Do** lead every screen with the user's story at a glance — the doctor summary is the leaflet's front page.
- **Do** use paper tones and hairline rules for separation; the world is flat print, not glass.
- **Do** render every measurement in tabular numerals.
- **Do** speak plain language — humanized metric labels ("Blood pressure (systolic)", never `blood_pressure_systolic`).
- **Do** give every full-screen route a back control and every tappable row an affordance (icon, badge, chevron).
- **Do** keep the deep green for whole regions — the primary action, the trust callout — and let it be rare.

### Don't:
- **Don't** use glyphs or emoji as icons; every icon is an authored SVG in the 1.8px stroke family.
- **Don't** use shadows, gradients, glass, or bevels; depth is tonal layering and rules.
- **Don't** place an eyebrow or kicker above a heading — the heading carries its own weight.
- **Don't** use a system display face as the display voice; the display is Source Serif 4.
- **Don't** use neutral gray for muted text; tint it from the green hue (`#5C6B64`).
- **Don't** stretch content full-bleed on desktop; the 720px column is the leaflet's measure.
- **Don't** label AI output as anything other than informational and never diagnostic.
