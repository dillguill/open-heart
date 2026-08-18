/**
 * Web demo AiInterpretationProvider mock — always returns a canned, pre-written response and
 * never calls a live AI provider, so the public demo never needs (or risks exposing) a real API
 * key. See contracts/ai-interpretation-provider.md and research.md #10.
 */
import { DEMO_AI_INTERPRETATIONS } from "../../fixtures/data";
import type {
  AiInterpretationProvider,
  InterpretationRequest,
  InterpretationResult,
} from "../../../src/services/ai/types";

const FALLBACK_RESPONSE =
  "This is a demo build, so AI explanations are pre-written rather than generated live. In the " +
  "real app, this would call the on-device model or your opted-in external provider.";

function artificialDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAiProvider: AiInterpretationProvider = {
  source: "local",

  async isAvailable(): Promise<boolean> {
    return true;
  },

  async interpret(input: InterpretationRequest): Promise<InterpretationResult> {
    await artificialDelay(600);
    const canned = DEMO_AI_INTERPRETATIONS.find((entry) => entry.targetId === input.targetId);
    return {
      responseText: canned?.responseText ?? FALLBACK_RESPONSE,
      aiSource: "local",
    };
  },
};
