// The app's side of the AI coach (B8): the week as numbers for the server, and calls to the ai-coach
// Edge Function. The server checks entitlement (Plus, AI consent, never coached: D44) and the daily
// cap, keeps out-of-scope questions from the model and checks everything the model returns.
import { FunctionsHttpError } from "@supabase/supabase-js";

import { isoDate } from "@/features/athlete/athleteData";
import { useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { useAuth } from "@/features/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

/** Numbers only: what the coach needs to know about the athlete's last 7 days. */
export type CoachContext = {
  goal?: string;
  proteinTarget?: number;
  kcalTarget?: number;
  workoutsDone?: number;
  workoutsPlanned?: number;
  avgKcal?: number;
  avgProtein?: number;
  avgSleepH?: number;
  weightChangeKg?: number;
};

export type Engine = "model" | "rules";
export type CoachError = "not_entitled" | "daily_limit" | "offline";

export type ChatReply = {
  engine: Engine;
  kind: "answer" | "out_of_scope" | "unknown";
  text: string;
  sources: string[];
};
export type TailorReply = { engine: Engine; kinds: string[] };
export type ReviewReply = {
  engine: Engine;
  tips: {
    title: string;
    text: string;
    action: "nutrition" | "recovery" | "tailor" | "plan" | "keep_going";
    sources: string[];
  }[];
};

/** True when the coach should go to the server (accounts on and signed in). */
export function useServerCoach() {
  const auth = useAuth();
  return auth.enabled && !!auth.session;
}

/**
 * The athlete's last 7 days, worked out from the store. `now` comes from the screen (kept in state),
 * so rendering stays pure.
 */
export function useCoachContext(now: number): CoachContext {
  const me = useMe();
  const { sessions, foodLogs, recoveryOf } = useCoachData();
  if (!me) return {};
  const weekAgo = now - 7 * 864e5;
  const days = Array.from({ length: 7 }, (_, i) =>
    isoDate(new Date(now - i * 864e5)),
  );
  const food = foodLogs(me.id).filter((f) => days.includes(f.date));
  const logged = new Set(food.map((f) => f.date)).size;
  const sleep = recoveryOf(me.id).logs.filter((l) => days.includes(l.date));
  const weights = [...(me.weighIns ?? [])]
    .filter((w) => new Date(`${w.date}T12:00:00`).getTime() >= now - 14 * 864e5)
    .sort((a, b) => a.date.localeCompare(b.date));
  const round = (v: number) => Math.round(v * 10) / 10;
  return {
    goal: me.goal || undefined,
    proteinTarget: me.nutritionPlan?.protein,
    kcalTarget: me.nutritionPlan?.kcal,
    workoutsDone: sessions(me.id).filter(
      (s) => new Date(s.at).getTime() >= weekAgo,
    ).length,
    workoutsPlanned: me.protocol
      ? 7 - me.protocol.restDays.length
      : me.program?.days.length,
    avgKcal: logged
      ? round(food.reduce((s, f) => s + f.macros.kcal, 0) / logged)
      : undefined,
    avgProtein: logged
      ? round(food.reduce((s, f) => s + f.macros.p, 0) / logged)
      : undefined,
    avgSleepH: sleep.length
      ? round(sleep.reduce((s, l) => s + l.sleepH, 0) / sleep.length)
      : undefined,
    weightChangeKg:
      weights.length > 1
        ? round(weights[weights.length - 1].kg - weights[0].kg)
        : undefined,
  };
}

async function call<T>(
  body: Record<string, unknown>,
): Promise<{ data: T | null; error: CoachError | null }> {
  if (!supabase) return { data: null, error: "offline" };
  const { data, error } = await supabase.functions.invoke("ai-coach", { body });
  if (!error) return { data: data as T, error: null };
  const status =
    error instanceof FunctionsHttpError
      ? (error.context as Response | undefined)?.status
      : undefined;
  return {
    data: null,
    error:
      status === 403
        ? "not_entitled"
        : status === 429
          ? "daily_limit"
          : "offline",
  };
}

export const askCoach = (question: string, context: CoachContext) =>
  call<ChatReply>({ task: "chat", question, context });

export const tailorFromText = (text: string, context: CoachContext) =>
  call<TailorReply>({ task: "tailor", text, context });

export const weeklyReview = (context: CoachContext) =>
  call<ReviewReply>({ task: "review", context });
