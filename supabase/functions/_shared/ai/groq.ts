import type { AiProvider, AiRequest, AiResponse } from "./types.ts";

// Groq exposes an OpenAI-compatible chat completions endpoint.
// Verify the current model list, free-tier limits and data-retention terms
// at https://console.groq.com/docs before choosing GROQ_MODEL.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function createGroqProvider(apiKey: string, model: string): AiProvider {
  return {
    name: "groq",
    async generate(request: AiRequest): Promise<AiResponse> {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: request.maxOutputTokens ?? 2048,
          ...(request.json ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!res.ok) {
        // Do not include the request body in errors: it may contain health data.
        throw new Error(`Groq request failed with status ${res.status}`);
      }

      const data = await res.json();
      return {
        text: data.choices?.[0]?.message?.content ?? "",
        provider: "groq",
        model,
        usage: {
          inputTokens: data.usage?.prompt_tokens ?? 0,
          outputTokens: data.usage?.completion_tokens ?? 0,
        },
      };
    },
  };
}
