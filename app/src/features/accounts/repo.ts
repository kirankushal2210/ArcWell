// Accounts repository (B1, D73): invites and athlete preferences against Supabase. The first slice
// of splitting the sample store into per-area repositories: screens keep using the sample store
// until accounts are on (`accountsEnabled`), then call these. Errors returned to screens never
// include anyone's data.
import { accountsEnabled, supabase } from "@/lib/supabase";
import type { Machine } from "@/features/science/cardio";
import type { ModuleKey } from "@/features/science/habits";

export type Invite = {
  id: string;
  kind: "general" | "personal";
  code: string;
  client_name: string | null;
  expires_at: string | null;
  used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type Preferences = {
  modules: ModuleKey[];
  cardio_modalities: Machine[];
  cardio_days: number[];
  hr_max_override: number | null;
  resting_hr: number | null;
  habit_nudges: number;
};

type Res<T> = { data: T | null; error: string | null };
const off = <T>(): Res<T> => ({
  data: null,
  error: "Accounts are off in this build.",
});
const fail = <T>(message: string): Res<T> => ({ data: null, error: message });

// ---------- Invites (coach) ----------

export async function myInvites(): Promise<Res<Invite[]>> {
  if (!accountsEnabled || !supabase) return off();
  const { data, error } = await supabase
    .from("invites")
    .select(
      "id, kind, code, client_name, expires_at, used_at, revoked_at, created_at",
    )
    .order("created_at", { ascending: false });
  return error
    ? fail("Couldn't load your invites.")
    : { data: data as Invite[], error: null };
}

export async function createInvite(
  kind: Invite["kind"],
  clientName?: string,
): Promise<Res<Invite>> {
  if (!accountsEnabled || !supabase) return off();
  const { data, error } = await supabase
    .from("invites")
    .insert({ kind, client_name: clientName ?? null })
    .select(
      "id, kind, code, client_name, expires_at, used_at, revoked_at, created_at",
    )
    .single();
  return error
    ? fail("Couldn't create the invite.")
    : { data: data as Invite, error: null };
}

export async function revokeInvite(id: string): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { error } = await supabase
    .from("invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);
  return error
    ? fail("Couldn't turn that invite off.")
    : { data: true, error: null };
}

// ---------- Invites (athlete) ----------

export async function previewInvite(
  code: string,
): Promise<Res<{ coachName: string; kind: Invite["kind"]; usable: boolean }>> {
  if (!accountsEnabled || !supabase) return off();
  const { data, error } = await supabase.rpc("invite_preview", {
    p_code: code,
  });
  if (error) return fail("Couldn't check that code.");
  const row = (
    data as { coach_name: string; kind: Invite["kind"]; usable: boolean }[]
  )[0];
  return row
    ? {
        data: { coachName: row.coach_name, kind: row.kind, usable: row.usable },
        error: null,
      }
    : fail(
        "That invite isn't valid. Check the code, or ask your coach for a new one.",
      );
}

export async function redeemInvite(code: string): Promise<Res<string>> {
  if (!accountsEnabled || !supabase) return off();
  const { data, error } = await supabase.rpc("redeem_invite", { p_code: code });
  if (!error) return { data: data as string, error: null };
  return fail(
    error.code === "23505"
      ? "You already have a coach. Leave them first, then join."
      : error.code === "P0002"
        ? "That invite isn't valid any more. Ask your coach for a new one."
        : "Couldn't join right now. Try again in a moment.",
  );
}

// ---------- Preferences (D78) ----------

export async function myPreferences(): Promise<Res<Preferences | null>> {
  if (!accountsEnabled || !supabase) return off();
  const { data, error } = await supabase
    .from("athlete_preferences")
    .select(
      "modules, cardio_modalities, cardio_days, hr_max_override, resting_hr, habit_nudges",
    )
    .maybeSingle();
  return error
    ? fail("Couldn't load your settings.")
    : { data: data as Preferences | null, error: null };
}

export async function savePreferences(
  p: Partial<Preferences>,
): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { error } = await supabase
    .from("athlete_preferences")
    .upsert(p, { onConflict: "athlete_id" });
  return error
    ? fail("Couldn't save your settings.")
    : { data: true, error: null };
}

// ---------- Invite page before sign-up (D43, D40) ----------

/** The coach's profile and whether they're taking clients, for a valid code (no sign-in needed). */
export async function invitePage(
  code: string,
): Promise<Res<{ profile: Record<string, unknown>; open: boolean }>> {
  if (!accountsEnabled || !supabase) return off();
  const [p, o] = await Promise.all([
    supabase.rpc("invite_coach_profile", { p_code: code }),
    supabase.rpc("invite_open", { p_code: code }),
  ]);
  if (p.error || !p.data)
    return fail(
      "That invite isn't valid. Check the code, or ask your coach for a new one.",
    );
  return {
    data: {
      profile: p.data as Record<string, unknown>,
      open: o.data !== false,
    },
    error: null,
  };
}

// ---------- Links (D21, D37) ----------

/** Ends coaching with the other person: the athlete leaves; the coach completes or removes. */
export async function endLink(
  otherId: string,
  reason: "left" | "completed" | "removed",
): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { error } = await supabase.rpc("end_link", { other: otherId, reason });
  return error
    ? fail("Couldn't end coaching right now. Try again.")
    : { data: true, error: null };
}

/** The athlete leaves their current coach. */
export async function leaveCurrentCoach(): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { data } = await supabase
    .from("coach_clients")
    .select("coach_id")
    .is("ended_at", null)
    .maybeSingle();
  if (!data) return { data: true, error: null };
  return endLink(data.coach_id as string, "left");
}

/** "Share my history from before I joined" (D37). */
export async function shareHistory(share: boolean): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { error } = await supabase.rpc("share_history", { share });
  return error
    ? fail("Couldn't change history sharing.")
    : { data: true, error: null };
}

/** Withdraw a personal invite that hasn't been used. */
export async function revokeInviteCode(code: string): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { error } = await supabase
    .from("invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("code", code.replace(/[^A-Za-z0-9]/g, "").toUpperCase());
  return error
    ? fail("Couldn't withdraw that invite.")
    : { data: true, error: null };
}

// ---------- Export and delete (X-09, AC, Google Play) ----------

export async function exportMyData(): Promise<Res<Record<string, unknown>>> {
  if (!accountsEnabled || !supabase) return off();
  const { data, error } = await supabase.rpc("export_my_data");
  return error
    ? fail("Couldn't prepare your export.")
    : { data: data as Record<string, unknown>, error: null };
}

export async function deleteMyAccount(): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
  });
  return error
    ? fail("Couldn't delete your account. Try again, or contact support.")
    : { data: true, error: null };
}

// ---------- Push (B5) ----------

export async function registerPushToken(
  token: string,
  platform: "android" | "ios" | "web",
) {
  if (!accountsEnabled || !supabase) return;
  await supabase
    .from("push_tokens")
    .upsert({ token, platform }, { onConflict: "token" });
}

export type NotifyEvent =
  | { kind: "message"; id: string }
  | { kind: "check_in"; id: string }
  | { kind: "check_in_reply"; athleteId: string; id: string }
  | { kind: "plan"; athleteId: string };

/** Tell the other person something happened. Never blocks the app; a failed push is just skipped. */
export async function notify(e: NotifyEvent) {
  if (!accountsEnabled || !supabase) return;
  await supabase.functions.invoke("notify", { body: e }).catch(() => {});
}

/** Whether the signed-in athlete has anything stored yet (a returning athlete on a new phone). */
export async function hasAthleteProfile(): Promise<boolean> {
  if (!accountsEnabled || !supabase) return false;
  const { data } = await supabase
    .from("athlete_profiles")
    .select("athlete_id")
    .maybeSingle();
  return !!data;
}

// ---------- Billing (B7) ----------

/** Investor demo builds: the paywall's trial goes through the demo-billing function (no Play yet). */
export const demoBilling = process.env.EXPO_PUBLIC_DEMO_BILLING === "1";

/** Start (or cancel) the demo Plus trial. Real builds buy through Google Play and RevenueCat. */
export async function demoPlus(action: "trial" | "cancel"): Promise<Res<true>> {
  if (!accountsEnabled || !supabase) return off();
  const { error } = await supabase.functions.invoke("demo-billing", {
    body: { action },
  });
  return error
    ? fail("Couldn't start the trial. Try again.")
    : { data: true, error: null };
}
