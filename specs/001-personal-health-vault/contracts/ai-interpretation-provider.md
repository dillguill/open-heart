# Contract: AI Interpretation Provider

**Feature**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md)

The seam between the app and whatever produces a plain-language explanation of a Health Record
or Document. Three implementations exist:

- **Local** (`src/services/ai/local.ts`): wraps `llama.rn` running a downloaded on-device GGUF
  model. Requires no network access.
- **External** (`src/services/ai/external.ts`): calls the user's configured AI provider directly
  from the device using a user-supplied API key. Only invoked after opt-in and disclosure.
- **Web demo mock** (`web-demo/services/ai/mock.ts`): returns pre-written `responseText` from the
  fixtures for a given `targetId`, with a small artificial delay to simulate a real request. Never
  reachable in `external` mode — the mock only ever produces `aiSource: 'local'` responses.

## Interface

```ts
interface AiInterpretationProvider {
  readonly source: 'local' | 'external';

  // Returns null if this provider isn't currently usable (e.g., local model not yet downloaded,
  // or external not configured/opted-in) instead of throwing, so the UI can fall back gracefully.
  isAvailable(): Promise<boolean>;

  interpret(input: InterpretationRequest): Promise<InterpretationResult>;
}

interface InterpretationRequest {
  profileId: string;
  targetType: 'health_record' | 'document';
  targetId: string;
  // Only the minimal data needed to explain the target is passed in — not the full record/document
  // history — to keep any external request's payload as small as the task allows.
  contextSummary: string;
}

interface InterpretationResult {
  responseText: string;
  aiSource: 'local' | 'external';
  externalProviderName?: string; // set only when aiSource = 'external'
}
```

## Behavioral requirements

- Every `InterpretationResult.responseText` MUST be rendered by the caller behind the shared
  non-medical-advice disclosure component — this contract does not embed the disclosure text
  itself, so it stays consistent and can't be silently dropped by a future call site (constitution
  Principle IV).
- The `external` implementation MUST NOT be invocable until `disclosureAcknowledged: true` has
  been recorded for the current opt-in (data-model.md, AI Interpretation Request/Response); the
  service layer, not just the screen, MUST enforce this — a UI bug must not be able to bypass
  consent.
- The `external` implementation MUST send the request directly to the configured provider's API
  endpoint from the device. It MUST NOT route through any project-operated server (constitution
  Data Handling: external AI never proxied).
- The `local` implementation MUST perform inference entirely on-device once the model is
  downloaded; `isAvailable()` returning `false` (model not yet downloaded, or device unsupported)
  MUST NOT cause the app to silently fall back to `external` — that would violate the opt-in
  requirement. The UI must instead tell the user local AI is unavailable (spec User Story 4,
  Acceptance Scenario 2).
- No implementation may log `contextSummary` or `responseText` to crash reporting or analytics
  (constitution Data Handling: no PHI telemetry).
