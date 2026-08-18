/**
 * Open Heart design tokens — the Patient Education Pamphlet world.
 * Paper-white ground, deep green ink, amber disclosure accent, ruled sections,
 * callout boxes, tabular numerals. See specs/002-home-restructure/design-direction.md.
 */
import { Platform } from "react-native";

export const colors = {
  /** Warm paper-white ground — the page is a printed leaflet, not a screen. */
  paper: "#FDFCF8",
  /** Cream panel for inset sections. */
  paperDeep: "#F4F1E8",
  /** Near-black, green-tinted ink for body text. */
  ink: "#1F2A26",
  /** Green-tinted muted text — tinted from the hue, never neutral gray. */
  inkMuted: "#5C6B64",
  /** Primary brand green (committed). */
  green: "#0B5D4A",
  /** Darker green for text on light grounds. */
  greenDeep: "#0A4A3B",
  /** Soft green tint for positive/privacy callouts. */
  greenSoft: "#E3EFEA",
  /** Amber accent — the "not medical advice" disclosure. */
  amber: "#E8A33D",
  /** Soft amber tint for disclosure callouts. */
  amberSoft: "#FBF1DC",
  /** Warm hairline rule — the leaflet's printed rules. */
  rule: "#D8D2C4",
  /** Stamp red for destructive actions. */
  error: "#B23A2E",
  /** Soft red tint for destructive callouts. */
  errorSoft: "#F9E9E7",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fonts = {
  /** Display face — a warm, editorial serif evoking printed health literature. */
  display: Platform.select({
    web: '"Source Serif 4", Georgia, "Times New Roman", serif',
    default: "serif",
  }),
  /** Body — the system sans stack, highly readable (endorsed for Operate surfaces). */
  body: Platform.select({
    web:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    default: undefined,
  }),
} as const;

export const typeScale = {
  display: 34,
  title: 22,
  heading: 17,
  body: 15,
  small: 13,
  micro: 12,
} as const;