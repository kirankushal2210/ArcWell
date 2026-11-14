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
