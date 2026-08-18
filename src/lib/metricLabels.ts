/**
 * Humanized labels for metric types and categories — the pamphlet speaks plain
 * language, never developer vocabulary (critique heuristic 2).
 */
import type { Category } from "../models/types";

const METRIC_LABELS: Record<string, string> = {
  blood_pressure_systolic: "Blood pressure (systolic)",
  blood_pressure_diastolic: "Blood pressure (diastolic)",
  heart_rate: "Heart rate",
  weight: "Weight",
  height: "Height",
  bmi: "BMI",
  body_temperature: "Body temperature",
  ldl_cholesterol: "LDL cholesterol",
  hdl_cholesterol: "HDL cholesterol",
  total_cholesterol: "Total cholesterol",
  triglycerides: "Triglycerides",
  glucose: "Blood glucose",
  hba1c: "HbA1c",
  atorvastatin: "Atorvastatin",
  metformin: "Metformin",
  lisinopril: "Lisinopril",
  amlodipine: "Amlodipine",
  levothyroxine: "Levothyroxine",
};

/** Humanize any snake_case metric type, with known overrides first. */
export function humanizeMetricType(metricType: string): string {
  const known = METRIC_LABELS[metricType];
  if (known) return known;
  return metricType
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const CATEGORY_LABELS: Record<Category, string> = {
  vitals: "Vitals",
  labs: "Labs",
  medications: "Medications",
  conditions: "Conditions",
  imaging: "Imaging",
  notes: "Notes",
};

export function humanizeCategory(category: Category): string {
  return CATEGORY_LABELS[category] ?? category;
}