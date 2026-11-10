// Provider-neutral AI interface used by every Edge Function that needs AI.
//
// Rules (see docs/SPEC.md):
// - AI is only ever called server-side; the mobile app never holds a key.
// - Callers must check the user's entitlement (paid AI tier, not coach-linked)
//   and daily usage cap BEFORE calling generate().
// - Structured outputs (plans, meal plans) must be validated against our own
//   programming rules after generation; never trust model output directly.

export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiRequest {
  messages: AiMessage[];
  /** Ask the provider for a JSON object response when supported. */
  json?: boolean;
  maxOutputTokens?: number;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AiResponse {
  text: string;
  provider: string;
  model: string;
  usage: AiUsage;
}

export interface AiProvider {
  readonly name: string;
  generate(request: AiRequest): Promise<AiResponse>;
}
