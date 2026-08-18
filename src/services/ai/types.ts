/**
 * AI Interpretation Provider contract — see
 * specs/001-personal-health-vault/contracts/ai-interpretation-provider.md
 *
 * Three implementations: local.ts (llama.rn, on-device), external.ts (direct-to-provider HTTP,
 * opt-in only), and the web demo mock (web-demo/services/ai, canned responses only).
 */
import type { AiSource, AiTargetType } from "../../models/types";

export interface InterpretationRequest {
  profileId: string;
  targetType: AiTargetType;
  targetId: string;
  /** Minimal context needed to explain the target — never the full record/document history. */
  contextSummary: string;
}

export interface InterpretationResult {
  responseText: string;
  aiSource: AiSource;
  externalProviderName?: string;
}

export interface AiInterpretationProvider {
  readonly source: AiSource;

  /** Never throws — returns false when unusable (model not downloaded, not opted in, etc.). */
  isAvailable(): Promise<boolean>;

  interpret(input: InterpretationRequest): Promise<InterpretationResult>;
}

export class ExternalAiConsentRequiredError extends Error {
  constructor() {
    super(
      "External AI interpretation requires disclosureAcknowledged=true before any request is sent.",
    );
    this.name = "ExternalAiConsentRequiredError";
  }
}
