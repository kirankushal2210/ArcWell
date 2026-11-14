import type {
  AiMessage,
  AiProvider,
  AiRequest,
  AiResponse,
} from "./types.ts";

// Groq exposes an OpenAI-compatible chat completions endpoint.
// Verify the current model list, free-tier limits and data-retention terms
// at https://console.groq.com/docs before choosing GROQ_MODEL.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// OpenAI-style content: text stays a string, parts become text / image_url entries.
const toWire = (content: AiMessage["content"]) =>
  typeof content === "string"
    ? content
    : content.map((p) =>
        p.type === "text"
          ? { type: "text", text: p.text }
          : { type: "image_url", image_url: { url: p.dataUrl } },
      );

export function createGroqProvider(
  apiKey: string,
  model: string,
  visionModel?: string,
): AiProvider {
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
          model: request.vision ? (visionModel ?? model) : model,
          messages: request.messages.map((m) => ({
            role: m.role,
            content: toWire(m.content),
          })),
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
        model: request.vision ? (visionModel ?? model) : model,
        usage: {
          inputTokens: data.usage?.prompt_tokens ?? 0,
          outputTokens: data.usage?.completion_tokens ?? 0,
        },
      };
    },
  };
}
