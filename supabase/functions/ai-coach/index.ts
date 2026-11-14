// ai-coach (B8, D69, D70): the AI coach's chat, "tailor today" and weekly review for Arcwell Plus.
//
// Order of checks (AGENTS.md): signed in → entitled (Plus, AI consent, no coach: D44) → under today's
// cap → answer → check the answer. Out-of-scope questions never reach the model. The model sees only
// numbers about the athlete's week. Without a configured model (Groq's key and model), or when the
// model's answer fails the checks, the rules engine answers from the evidence; the reply says which.
// Nothing about the question or the answer is logged; errors carry only a status.
import {
  chatSystem,
  cleanContext,
  COACH_TASKS,
  type CoachTask,
  OUT_OF_SCOPE,
  OUT_OF_SCOPE_TEXT,
  parseChat,
  parseReview,
  parseTailor,
  reviewSystem,
  rulesChat,
  rulesReview,
  rulesTailor,
  tailorSystem,
} from "../_shared/ai/coach.ts";
import { aiConfigured, getAiProvider } from "../_shared/ai/index.ts";
import { asCaller, cors, reply } from "../_shared/http.ts";

async function model(system: string, user: string, maxOutputTokens: number) {
  const res = await getAiProvider().generate({
    json: true,
    maxOutputTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return res.text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });
  const auth = req.headers.get("Authorization");
  if (!auth) return reply(401, { error: "signed_out" });

  let body: { task?: unknown; question?: unknown; text?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "bad_request" });
  }
  const task = String(body.task ?? "") as CoachTask;
  if (!(task in COACH_TASKS)) return reply(400, { error: "bad_request" });
  const input = typeof (task === "chat" ? body.question : body.text) === "string"
    ? String(task === "chat" ? body.question : body.text).trim().slice(0, 500)
    : "";
  if (task !== "review" && input.length < 2) return reply(400, { error: "bad_request" });
  const context = cleanContext(body.context);

  // As the athlete, so the database's own rules decide (entitlement and cap live in SQL).
  const db = asCaller(auth);
  const { data: user } = await db.auth.getUser();
  if (!user?.user) return reply(401, { error: "signed_out" });
  const { data: entitled, error: e1 } = await db.rpc("ai_entitled");
  if (e1) return reply(500, { error: "server" });
  if (!entitled) return reply(403, { error: "not_entitled" });

  // Out of scope: answered at once, never sent to a model, and not counted against the cap.
  if (task === "chat" && OUT_OF_SCOPE.test(input))
    return reply(200, { engine: "rules", kind: "out_of_scope", text: OUT_OF_SCOPE_TEXT, sources: [] });

  const { feature, cap } = COACH_TASKS[task];
  const { data: allowed, error: e2 } = await db.rpc("ai_try_use", { p_feature: feature, p_cap: cap });
  if (e2) return reply(500, { error: "server" });
  if (!allowed) return reply(429, { error: "daily_limit" });

  const useModel = aiConfigured();
  try {
    if (task === "chat") {
      const a = useModel ? parseChat(await model(chatSystem(context), input, 400)) : null;
      return reply(200, a ? { engine: "model", ...a } : { engine: "rules", ...rulesChat(input, context) });
    }
    if (task === "tailor") {
      const k = useModel ? parseTailor(await model(tailorSystem, input, 120)) : null;
      return reply(200, { engine: k ? "model" : "rules", kinds: k ?? rulesTailor(input) });
    }
    const tips = useModel ? parseReview(await model(reviewSystem(context), "Write this week's review.", 700)) : null;
    return reply(200, { engine: tips ? "model" : "rules", tips: tips ?? rulesReview(context) });
  } catch (e) {
    // The model failed: answer from the rules instead. Status only in the log.
    console.error("ai-coach: model call failed", e instanceof Error ? e.name : "error");
    if (task === "chat") return reply(200, { engine: "rules", ...rulesChat(input, context) });
    if (task === "tailor") return reply(200, { engine: "rules", kinds: rulesTailor(input) });
    return reply(200, { engine: "rules", tips: rulesReview(context) });
  }
});
