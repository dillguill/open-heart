# Contract: Doctor Summary Export Service

**Feature**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md)

Produces the consolidated, doctor-facing view (User Story 3) and hands it off for on-screen
presentation or export, entirely on-device.

## Interface

```ts
interface DoctorSummaryService {
  // Builds the consolidated view model from the Storage Repository — grouped by category,
  // with recent trend highlights per metricType. Pure read; no export side effect yet.
  buildSummary(profileId: string, options?: SummaryOptions): Promise<DoctorSummary>;

  // Renders the summary to a PDF file in the app's sandbox and returns its local file URI.
  exportToPdf(summary: DoctorSummary): Promise<string>;

  // Invokes the OS share sheet (AirDrop, email, printer, etc.) for a previously exported file.
  share(fileUri: string): Promise<void>;
}

interface SummaryOptions {
  categories?: Category[]; // defaults to all categories present for the profile
  trendWindow?: DateRange;  // defaults to a sensible recent window, e.g., last 12 months
}

interface DoctorSummary {
  profileId: string;
  generatedAt: string; // ISO datetime
  sections: Array<{
    category: Category;
    records: HealthRecord[];
    documents: Document[];
    trendHighlights: MetricSeries[];
  }>;
}
```

## Behavioral requirements

- `buildSummary` and `exportToPdf` MUST perform no network I/O (constitution Principle II); the
  summary is built entirely from the Storage Repository and rendered locally via `expo-print`.
- `share` MUST work without the recipient (the doctor) having the app installed or an account
  (FR-006) — it hands off a standalone PDF file through the OS share sheet.
- The web demo build does not implement `exportToPdf`/`share` against real printing — it may
  render the same `DoctorSummary` view model read-only in-browser (e.g., via the browser's native
  print dialog) purely for showcase purposes, since there is no real PDF-export requirement for
  fixture data.
