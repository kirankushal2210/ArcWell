import { createGroqProvider } from "./groq.ts";
import type { AiProvider } from "./types.ts";

export type { AiMessage, AiProvider, AiRequest, AiResponse } from "./types.ts";

// Single switch point for the AI provider. Changing AI_PROVIDER (plus that
// provider's key/model secrets) moves every AI feature to a new provider
// without touching feature code.
//
// Planned providers: "groq" (launch, free tier), then "anthropic" or "openai"
// once funded. Add each as its own file implementing AiProvider.
export function getAiProvider(): AiProvider {
  const provider = Deno.env.get("AI_PROVIDER") ?? "groq";

  switch (provider) {
    case "groq": {
      const apiKey = requireEnv("GROQ_API_KEY");
      const model = requireEnv("GROQ_MODEL");
      return createGroqProvider(apiKey, model);
    }
    default:
      throw new Error(`AI provider "${provider}" is not implemented yet`);
  }
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}
