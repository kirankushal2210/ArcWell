// scan-meal (D96): a meal photo in, the foods on the plate out, for the app to show the athlete to
// check before anything is logged (D70: AI suggests, the athlete accepts).
//
// Order of checks (AGENTS.md): signed in → entitled (pro athlete, AI consent, no coach: D44) →
// under today's cap → call the model → validate the answer. Nothing about the photo or the foods
// is logged; errors carry only a status.
import { createClient } from "jsr:@supabase/supabase-js@2";

import { getAiProvider } from "../_shared/ai/index.ts";
import {
  MEAL_SCAN_DAILY_CAP,
  MEAL_SCAN_FEATURE,
  MEAL_SCAN_MAX_BASE64,
  MEAL_SCAN_PROMPT,
  parseMealScan,
} from "../_shared/ai/mealScan.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "method" });

  const auth = req.headers.get("Authorization");
  if (!auth) return reply(401, { error: "signed_out" });

  let body: { image?: unknown; mime?: unknown };
  try {
    body = await req.json();
  } catch {
    return reply(400, { error: "bad_request" });
  }
  const image = typeof body.image === "string" ? body.image : "";
  const mime = typeof body.mime === "string" ? body.mime : "image/jpeg";
  if (!image || !MIME.has(mime)) return reply(400, { error: "bad_request" });
  if (image.length > MEAL_SCAN_MAX_BASE64) return reply(413, { error: "too_large" });

  // As the user, so the database's own rules decide (entitlement and cap live in SQL).
  const db = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: auth } } },
  );
  const { data: user } = await db.auth.getUser();
  if (!user?.user) return reply(401, { error: "signed_out" });

  const { data: entitled, error: e1 } = await db.rpc("ai_entitled");
  if (e1) return reply(500, { error: "server" });
  if (!entitled) return reply(403, { error: "not_entitled" });

  const { data: allowed, error: e2 } = await db.rpc("ai_try_use", {
    p_feature: MEAL_SCAN_FEATURE,
    p_cap: MEAL_SCAN_DAILY_CAP,
  });
  if (e2) return reply(500, { error: "server" });
  if (!allowed) return reply(429, { error: "daily_limit" });

  try {
    const ai = getAiProvider();
    const res = await ai.generate({
      json: true,
      vision: true,
      maxOutputTokens: 900,
      messages: [
        { role: "system", content: MEAL_SCAN_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "What is on this plate?" },
            { type: "image", dataUrl: `data:${mime};base64,${image}` },
          ],
        },
      ],
    });
    const out = parseMealScan(res.text);
    if (out.status === "invalid") return reply(502, { error: "unreadable" });
    return reply(200, out);
  } catch (e) {
    // Status only: the request held a photo of someone's food.
    console.error("scan-meal: model call failed", e instanceof Error ? e.name : "error");
    return reply(502, { error: "model" });
  }
});
