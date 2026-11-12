// Accounts (PLAN Phase 1): email 6-digit code sign-in, the profile (role fixed at sign-up, D44)
// and the health-data consent record (DPDP). Screens that end in sign-up call begin() with the
// role, whether consent was given and what to do next, then open /auth/email. Google sign-in
// arrives with the development build. Errors shown to people never include their data.
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { accountsEnabled, POLICY_VERSION, supabase } from "@/lib/supabase";

export type Role = "athlete" | "coach";
export type Profile = { id: string; role: Role; display_name: string | null };

/** What a sign-up screen asked for: the account's role, consent, and where to go after. */
export type Pending = { role: Role; consent: boolean; then: () => void };

type Result = { error: string | null; profile?: Profile | null };

type Auth = {
  /** False in sample builds without a backend. */
  enabled: boolean;
  /** True once the saved session (if any) and its profile have loaded. */
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  pending: Pending | null;
  begin: (p: Pending | null) => void;
  sendCode: (email: string) => Promise<Result>;
  verifyCode: (email: string, code: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Auth | null>(null);

const ROLE_LABEL: Record<Role, string> = {
  athlete: "an athlete",
  coach: "a coach",
};

/** Plain-language messages for the errors people can act on (S-03). */
function message(e: { message?: string; status?: number; code?: string }) {
  const code = e.code ?? "";
  if (code === "over_email_send_rate_limit" || e.status === 429)
    return "Too many codes asked for. Wait a minute, then try again.";
  if (code === "otp_expired" || /expired|invalid/i.test(e.message ?? ""))
    return "That code didn't work. Check it, or send a new one.";
  if (code === "email_address_invalid")
    return "Enter a full email address, like name@example.com.";
  if (/network|fetch/i.test(e.message ?? ""))
    return "Can't reach Arcwell. Check your connection and try again.";
  return "Something went wrong. Try again.";
}

async function loadProfile(id: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!accountsEnabled);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let live = true;
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!live) return;
        setSession(data.session);
        if (data.session) setProfile(await loadProfile(data.session.user.id));
      })
      .finally(() => live && setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setProfile(null);
    });
    return () => {
      live = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendCode = async (email: string): Promise<Result> => {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      // Returning people sign in; anyone coming from a sign-up screen creates the account.
      options: { shouldCreateUser: !!pending },
    });
    if (error?.code === "otp_disabled" || error?.code === "signup_disabled")
      return {
        error: "No account with that email. Tap Get Started to make one.",
      };
    return { error: error ? message(error) : null };
  };

  const verifyCode = async (email: string, code: string): Promise<Result> => {
    if (!supabase) return { error: null };
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code,
      type: "email",
    });
    if (error || !data.user) return { error: message(error ?? {}) };
    const id = data.user.id;
    let p = await loadProfile(id);

    if (pending) {
      if (p && p.role !== pending.role) {
        // One role per account (D44): don't turn a coach into an athlete or the reverse.
        await supabase.auth.signOut();
        return {
          error: `This email already has ${ROLE_LABEL[p.role]} account. Use another email, or sign in from the welcome screen.`,
        };
      }
      if (!p) {
        const ins = await supabase
          .from("profiles")
          .insert({ id, role: pending.role })
          .select("id, role, display_name")
          .single();
        if (ins.error) return { error: message(ins.error) };
        p = ins.data as Profile;
      }
      if (pending.consent) {
        const c = await supabase.from("consents").insert({
          purpose: "health_data",
          granted: true,
          policy_version: POLICY_VERSION,
        });
        if (c.error) return { error: message(c.error) };
      }
    }
    setSession(data.session);
    setProfile(p);
    return { error: null, profile: p };
  };

  const signOut = async () => {
    setPending(null);
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <Ctx.Provider
      value={{
        enabled: accountsEnabled,
        ready,
        session,
        profile,
        pending,
        begin: setPending,
        sendCode,
        verifyCode,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const a = useContext(Ctx);
  if (!a) throw new Error("useAuth outside AuthProvider");
  return a;
}
