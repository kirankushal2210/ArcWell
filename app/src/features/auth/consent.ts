// Consent changes for the server's own record (DPDP). The consents table is append-only: each
// change is a new row and the latest per purpose wins. The server reads the `ai` row before any AI
// call (`ai_entitled()`), so turning AI on or off in the app must reach it. Sample builds and
// signed-out phones have nothing to record; a failed write is retried the next time AI is
// switched, and never blocks the screen.
import { accountsEnabled, POLICY_VERSION, supabase } from "@/lib/supabase";

export type ConsentPurpose = "health_data" | "ai" | "photos";

export async function recordConsent(
  purpose: ConsentPurpose,
  granted: boolean,
): Promise<void> {
  if (!accountsEnabled || !supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase
      .from("consents")
      .insert({ purpose, granted, policy_version: POLICY_VERSION });
  } catch {
    // Offline or signed out: the app keeps working; the server simply keeps the last choice.
  }
}
