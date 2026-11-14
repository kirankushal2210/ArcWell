// The store ⇄ database mapping for signed-in accounts (D107). Pure functions only, so they can be
// tested on their own:
// - assemble(): the rows one account can read (RLS already applied) → the store's world;
// - decompose(): the store's world → the rows that account may write, keyed for diffing.
//
// The store keeps everything about a client on one Client object. The database splits it so every
// dated log sits in its own row, under the coach join-date rule. Coach-facing summaries (weights,
// the week's workouts and food) are worked out from those rows, never stored on the profile, so a
// coach can't see anything from before the join date through them.
import type { FoodLog, Food } from "@/features/athlete/foods";
import type { Exercise } from "@/features/athlete/library";
import type { RecoveryStore } from "@/features/athlete/recovery";
import type { Session } from "@/features/athlete/training";
import type {
  CoachProfile,
  CoachSettings,
} from "@/features/coach/coachProfile";
import type { Lead } from "@/features/coach/crm";
import type {
  CheckIn,
  Client,
  Message,
  Template,
} from "@/features/coach/sampleData";
import type { Stack } from "@/features/coach/supplements";

import { hashUuid, inviteCodeFor, UUID } from "./ids";

export type Role = "athlete" | "coach";
export type Tier = "coached" | "pro" | "free";
type Row = Record<string, any>;

/** What one account pulled, table by table (RLS has already filtered it). */
export type Pulled = {
  profiles: Row[];
  coach_clients: Row[];
  athlete_profiles: Row[];
  coach_profiles: Row[];
  coach_client_notes: Row[];
  plans: Row[];
  enhanced: Row[];
  templates: Row[];
  leads: Row[];
  custom_exercises: Row[];
  workouts: Row[];
  routines: Row[];
  food_logs: Row[];
  my_foods: Row[];
  check_ins: Row[];
  messages: Row[];
  body_logs: Row[];
  progress_photos: Row[];
  day_logs: Row[];
  transformations: Row[];
  invites: Row[];
  coach_billing: Row[];
  tier: Tier;
};

/** The parts of the store a signed-in account syncs (the same names as the store's saved shape). */
export type World = {
  clients: Client[];
  meId: string | null;
  meTier: Tier;
  self: Client | null;
  history: Record<string, Session[]>;
  custom: Exercise[];
  foodLogs: Record<string, FoodLog[]>;
  myFoods: Food[];
  recovery: Record<string, RecoveryStore>;
  templates: Template[];
  leads: Lead[];
  coach: CoachProfile;
  settings: CoachSettings;
  stacks: Stack[];
};

export type Ctx = {
  uid: string;
  role: Role;
  /** The athlete's current coach, from the last pull (their messages go to this coach). */
  coachId?: string | null;
};

/** A row this account may write. `match` identifies it; insert/update are the column sets. */
export type PushRow = {
  table: string;
  key: string;
  match: Row;
  insert: Row;
  update: Row;
  /** upsert (default), update (never insert: someone else creates it), insert (never changes). */
  mode?: "upsert" | "update" | "insert";
  /** Removing it from the store deletes it (owned rows only). */
  deletable?: boolean;
  /** Folder owner for file uploads inside this row. */
  filesOwner?: string;
};

// ---------- What lives where ----------

/** Client fields the athlete owns that sit on their profile document (no dated logs). */
const PROFILE_FIELDS = [
  "goal",
  "answers",
  "basics",
  "profile",
  "selfAnswers",
  "photo",
  "athleteSettings",
  "targetKg",
  "phone",
] as const;

/** Client fields the coach owns that the athlete also sees (plans.meta). */
const META_FIELDS = [
  "plan",
  "checkInDay",
  "competitive",
  "status",
  "statusUntil",
  "statusNote",
  "endedBy",
] as const;

/** Client fields only the coach sees (coach_client_notes). */
const NOTE_FIELDS = [
  "notes",
  "account",
  "attention",
  "line",
  "adherence",
  "source",
  "isNew",
  "goal",
] as const;

const pick = <T extends object>(o: T | undefined, keys: readonly string[]) => {
  const out: Row = {};
  if (!o) return out;
  for (const k of keys) {
    const v = (o as Row)[k];
    if (v !== undefined) out[k] = v;
  }
  return out;
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export const emptyClient = (id: string, name: string): Client => ({
  id,
  name,
  status: "active",
  joined: "",
  weeksWithYou: 0,
  goal: "",
  line: "",
  adherence: null,
  checkInDay: "Monday",
  answers: [],
  weights: [],
  targetKg: 0,
  training: { weekDone: 0, weekPlanned: 0, logs: [] },
  nutrition: { targetKcal: 0, proteinG: 0, days: [] },
  recovery: {
    sleepTargetH: 8,
    nights: [],
    quality: 0,
    stress: 0,
    energy: 0,
    soreness: 0,
  },
  measurements: [],
  photoWeeks: [],
  checkIns: [],
  messages: [],
  unread: 0,
  notes: "",
});

// ---------- Messages ----------

/** The row id of a message: its own id once stored, else a hash of who sent what when. */
export const messageId = (m: Message & { id?: string }, athleteId: string) =>
  m.id && UUID.test(m.id)
    ? m.id
    : hashUuid(
        `${athleteId}|${m.from}|${m.at ?? m.time}|${m.text}|${m.image ?? ""}|${m.file?.uri ?? ""}`,
      );

const toMessage = (r: Row): Message & { id: string } => {
  const a = r.attachment as {
    kind?: string;
    uri?: string;
    name?: string;
  } | null;
  return {
    id: r.id,
    from: r.sender === r.coach_id ? "coach" : "client",
    text: r.body ?? "",
    at: r.created_at,
    time: clock(r.created_at),
    image: a?.kind === "image" ? a.uri : undefined,
    file:
      a?.kind === "file" && a.uri
        ? { name: a.name ?? "File", uri: a.uri }
        : undefined,
  };
};

const attachmentOf = (m: Message) =>
  m.image
    ? { kind: "image", uri: m.image }
    : m.file
      ? { kind: "file", uri: m.file.uri, name: m.file.name }
      : null;

// ---------- Summaries a coach sees, worked out from dated rows ----------

function summarise(
  c: Client,
  sessions: Session[],
  food: FoodLog[],
  rec?: RecoveryStore,
): Client {
  const weighIns = [...(c.weighIns ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const weights = weighIns.length
    ? weighIns.map((w) => w.kg)
    : c.basics?.weightKg
      ? [c.basics.weightKg]
      : c.weights;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  const logs = sessions.slice(0, 8).map((s) => {
    const best = s.exercises
      .flatMap((e) => e.sets.map((x) => ({ e: e.name, ...x })))
      .filter((x) => !x.warmup && x.kg && x.reps)
      .sort((a, b) => (b.kg ?? 0) - (a.kg ?? 0))[0];
    return {
      date: shortDate(s.at),
      name: s.name,
      sets: s.setsDone,
      minutes: s.minutes,
      topSet: best ? `${best.e} ${best.kg} kg × ${best.reps}` : "",
    };
  });
  const days = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + k);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const items = food.filter((f) => f.date === key);
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      kcal: Math.round(items.reduce((s, f) => s + f.macros.kcal, 0)),
      protein: Math.round(items.reduce((s, f) => s + f.macros.p, 0)),
    };
  });
  const nights = (rec?.logs ?? [])
    .slice(-7)
    .map((l) => ({ day: l.date, hours: l.sleepH }));
  const last = rec?.logs?.at(-1);
  const m = [...(c.measureLog ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const measurements = m.length
    ? Object.keys(m.at(-1)!.values).map((label) => ({
        label,
        start:
          (
            m.find(
              (e) => e.values[label as keyof typeof e.values] !== undefined,
            )?.values as Row
          )[label] ?? 0,
        now: (m.at(-1)!.values as Row)[label] ?? 0,
        unit: "cm",
      }))
    : c.measurements;
  return {
    ...c,
    weights,
    training: {
      weekDone: sessions.filter((s) => new Date(s.at) >= weekStart).length,
      weekPlanned: c.protocol
        ? 7 - c.protocol.restDays.length
        : (c.program?.days.length ?? 0),
      logs,
    },
    nutrition: {
      targetKcal: c.nutritionPlan?.kcal ?? c.nutrition.targetKcal,
      proteinG: c.nutritionPlan?.protein ?? c.nutrition.proteinG,
      days,
    },
    recovery: {
      ...c.recovery,
      sleepTargetH: c.protocol?.sleepH ?? c.recovery.sleepTargetH,
      nights,
      quality: last?.quality ?? 0,
      stress: last?.stress ?? 0,
      energy: last?.energy ?? 0,
      soreness: last?.soreness ?? 0,
    },
    measurements,
  };
}

// ---------- Assemble: rows → world ----------

const of = (rows: Row[], athleteId: string) =>
  rows.filter((r) => r.athlete_id === athleteId);

/** Everything about one athlete the caller can read, as the store's Client plus their logs. */
function athleteParts(p: Pulled, id: string, name: string) {
  const prof =
    p.athlete_profiles.find((r) => r.athlete_id === id)?.payload ?? {};
  const plans: Row = {};
  for (const r of of(p.plans, id)) plans[r.kind] = r.payload;
  const enh = p.enhanced.find((r) => r.athlete_id === id);
  const body = of(p.body_logs, id);
  const dayLogs = of(p.day_logs, id).sort((a, b) => a.day.localeCompare(b.day));
  const messages = p.messages
    .filter((m) => m.athlete_id === id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(toMessage);
  const water: Record<string, number> = {};
  for (const r of dayLogs.filter((r) => r.area === "water"))
    water[r.day] = r.payload.ml ?? 0;

  const client: Client = {
    ...emptyClient(id, name),
    ...pick(prof, PROFILE_FIELDS),
    name,
    ...pick(plans.meta, META_FIELDS),
    program: plans.training?.program,
    programStart: plans.training?.programStart,
    programUpdatedAt: plans.training?.programUpdatedAt,
    nutritionPlan: plans.nutrition?.plan,
    protocol: plans.recovery?.protocol,
    supplements: plans.supplements?.items,
    enhanced: enh
      ? { ...enh.payload, consentAt: enh.consent_at ?? undefined }
      : undefined,
    routines: of(p.routines, id).map((r) => r.payload),
    checkIns: of(p.check_ins, id)
      .sort((a, b) => b.at.localeCompare(a.at))
      .map((r): CheckIn => ({
        ...(r.payload as CheckIn),
        id: r.id,
        at: r.at,
        reply: r.reply ?? undefined,
        reviewed: !!r.reviewed_at,
      })),
    messages,
    weighIns: body
      .filter((r) => r.kind === "weight")
      .map((r) => ({ id: r.id, date: r.day, kg: r.payload.kg })),
    measureLog: body
      .filter((r) => r.kind === "measure")
      .map((r) => ({ date: r.day, values: r.payload.values ?? {} })),
    progressPhotos: of(p.progress_photos, id).map((r) => ({
      ...r.payload,
      id: r.id,
      date: r.day,
    })),
    transformations: of(p.transformations, id).map((r) => ({
      ...r.payload,
      id: r.id,
      status: r.status,
    })),
    water,
  };
  const sessions = of(p.workouts, id)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((r) => r.payload as Session);
  const food = of(p.food_logs, id).map((r) => r.payload as FoodLog);
  const recovery: RecoveryStore = {
    device: prof.recoveryDevice,
    logs: dayLogs.filter((r) => r.area === "recovery").map((r) => r.payload),
    activities: dayLogs
      .filter((r) => r.area === "activity")
      .flatMap((r) => r.payload.items ?? []),
    done: dayLogs
      .filter((r) => r.area === "protocols")
      .flatMap((r) => r.payload.ids ?? []),
  };
  return {
    client: summarise(client, sessions, food, recovery),
    sessions,
    food,
    recovery,
  };
}

const nameOf = (p: Pulled, id: string) =>
  p.profiles.find((r) => r.id === id)?.display_name ?? "";

const weeksSince = (iso: string) =>
  Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / (7 * 86400000)),
  );

/**
 * `adopt`: on an account's first pull, keep what onboarding built on the phone where the server has
 * nothing yet (it's then pushed). Off, the result is exactly what the server holds.
 */
export function assemble(
  p: Pulled,
  ctx: Ctx,
  local: World,
  adopt = true,
): World {
  const custom = p.custom_exercises.map((r) => r.payload as Exercise);
  if (ctx.role === "athlete") {
    const hasProfile =
      !adopt || p.athlete_profiles.some((r) => r.athlete_id === ctx.uid);
    const localMe =
      local.meTier === "coached"
        ? local.clients.find((c) => c.id === local.meId)
        : local.self;
    const parts = athleteParts(
      p,
      ctx.uid,
      nameOf(p, ctx.uid) || localMe?.name || "",
    );
    // First sign-in: nothing stored yet, so keep what onboarding built on the phone; it is pushed.
    const me =
      hasProfile || !localMe ? parts.client : { ...localMe, id: ctx.uid };
    const localId = localMe?.id ?? ctx.uid;
    const history = {
      [ctx.uid]: hasProfile ? parts.sessions : (local.history[localId] ?? []),
    };
    const foodLogs = {
      [ctx.uid]: hasProfile ? parts.food : (local.foodLogs[localId] ?? []),
    };
    const recovery = {
      [ctx.uid]: hasProfile
        ? parts.recovery
        : (local.recovery[localId] ?? parts.recovery),
    };
    const link = p.coach_clients.find(
      (l) => l.client_id === ctx.uid && !l.ended_at,
    );
    const coachRow =
      link && p.coach_profiles.find((r) => r.coach_id === link.coach_id);
    const coached = p.tier === "coached";
    const joined = link
      ? {
          joined: shortDate(link.joined_at),
          weeksWithYou: weeksSince(link.joined_at),
          historyFrom: link.history_from ?? undefined,
        }
      : {};
    const coachUnread = link
      ? p.messages.filter((m) => m.sender === link.coach_id && !m.read_at)
          .length
      : 0;
    const meWithLink = { ...me, ...joined, coachUnread };
    return {
      ...local,
      meId: ctx.uid,
      meTier: p.tier,
      self: coached ? null : meWithLink,
      clients: coached ? [meWithLink] : [],
      history,
      foodLogs,
      recovery,
      custom,
      myFoods: hasProfile
        ? p.my_foods.map((r) => r.payload as Food)
        : local.myFoods,
      coach: coachRow
        ? {
            ...local.coach,
            ...(coachRow.payload as CoachProfile),
            name: nameOf(p, link.coach_id) || local.coach.name,
          }
        : local.coach,
    };
  }

  // Coach
  const ownProfile = p.coach_profiles.find((r) => r.coach_id === ctx.uid);
  const serverOnly = !adopt || !!ownProfile;
  const notes: Record<string, Row> = {};
  for (const r of p.coach_client_notes) notes[r.client_id] = r.payload;
  const history: Record<string, Session[]> = {};
  const foodLogs: Record<string, FoodLog[]> = {};
  const recovery: Record<string, RecoveryStore> = {};
  const clients: Client[] = [];
  const links = p.coach_clients
    .filter((l) => l.coach_id === ctx.uid)
    .sort((a, b) => b.joined_at.localeCompare(a.joined_at));
  const seen = new Set<string>();
  for (const l of links) {
    if (seen.has(l.client_id)) continue;
    seen.add(l.client_id);
    const n = notes[l.client_id] ?? {};
    const base = {
      ...pick(n, NOTE_FIELDS),
      joined: shortDate(l.joined_at),
      weeksWithYou: weeksSince(l.joined_at),
      historyFrom: l.history_from ?? undefined,
    };
    if (l.ended_at) {
      clients.push({
        ...emptyClient(l.client_id, n.name ?? "Former client"),
        ...base,
        status: "completed",
        endedBy: l.end_reason === "completed" ? "completed" : "closed",
      });
      continue;
    }
    const parts = athleteParts(
      p,
      l.client_id,
      nameOf(p, l.client_id) || n.name || "Client",
    );
    const unread = p.messages.filter(
      (m) =>
        m.athlete_id === l.client_id && m.sender === l.client_id && !m.read_at,
    ).length;
    clients.push({ ...parts.client, ...base, unread });
    history[l.client_id] = parts.sessions;
    foodLogs[l.client_id] = parts.food;
    recovery[l.client_id] = parts.recovery;
  }
  // Personal invites not redeemed yet: the clients the coach is expecting (D56).
  for (const i of p.invites) {
    if (i.kind !== "personal" || i.used_at || i.revoked_at) continue;
    const c = (i.payload?.client ?? {}) as Row;
    const plans = (i.payload?.plans ?? {}) as Row;
    clients.push({
      ...emptyClient(
        String(i.payload?.clientId ?? `inv-${i.code}`),
        i.client_name ?? "New client",
      ),
      ...pick(c, ["goal", "basics", "phone", "targetKg", "answers"]),
      ...pick(plans.meta, META_FIELDS),
      ...pick(i.payload?.notes, NOTE_FIELDS),
      program: plans.training?.program,
      programStart: plans.training?.programStart,
      nutritionPlan: plans.nutrition?.plan,
      protocol: plans.recovery?.protocol,
      supplements: plans.supplements?.items,
      pending: true,
      invite: i.payload?.sent
        ? { token: i.code, code: i.code, claimed: false }
        : undefined,
      line: i.payload?.sent
        ? "Invite sent · waiting to join"
        : "Plans to build, then invite",
    });
  }
  const billing = p.coach_billing[0];
  const settingsPayload = (ownProfile?.payload?.settings ??
    {}) as Partial<CoachSettings>;
  const tpl = p.templates.filter((t) => t.kind !== "stack");
  const stacks = p.templates.filter((t) => t.kind === "stack");
  return {
    ...local,
    meId: null,
    clients,
    history,
    foodLogs,
    recovery,
    custom: custom.length || serverOnly ? custom : local.custom,
    leads: p.leads.map((r) => r.payload as Lead),
    // A new coach keeps the starter templates and stacks from onboarding; they are pushed.
    templates:
      tpl.length || serverOnly
        ? tpl.map((r) => r.payload as Template)
        : local.templates,
    stacks:
      stacks.length || serverOnly
        ? stacks.map((r) => r.payload as Stack)
        : local.stacks,
    coach: ownProfile
      ? {
          ...local.coach,
          ...(ownProfile.payload as CoachProfile),
          name: nameOf(p, ctx.uid) || local.coach.name,
        }
      : adopt
        ? local.coach
        : { ...local.coach, name: nameOf(p, ctx.uid) || local.coach.name },
    settings: {
      ...local.settings,
      ...settingsPayload,
      billing: (billing?.status as CoachSettings["billing"]) ?? "active",
      clientLimit:
        billing?.client_limit ??
        settingsPayload.clientLimit ??
        local.settings.clientLimit,
    },
  };
}

// ---------- Decompose: world → rows to write ----------

const plansOf = (c: Client): Row => {
  const out: Row = {};
  if (c.program)
    out.training = {
      program: c.program,
      programStart: c.programStart ?? null,
      programUpdatedAt: c.programUpdatedAt ?? null,
    };
  if (c.nutritionPlan) out.nutrition = { plan: c.nutritionPlan };
  if (c.protocol) out.recovery = { protocol: c.protocol };
  if (c.supplements) out.supplements = { items: c.supplements };
  const meta = pick(c, META_FIELDS);
  if (Object.keys(meta).length) out.meta = meta;
  return out;
};

function put(out: Map<string, PushRow>, r: PushRow) {
  out.set(r.key, r);
}

/** The athlete's own rows: profile, self-guided plans, logs, check-ins, messages they sent. */
function athleteRows(
  out: Map<string, PushRow>,
  w: World,
  me: Client,
  uid: string,
  coachId: string | null,
) {
  const localId = me.id;
  // Only a real name: an empty one, or onboarding's placeholder "You", must never overwrite a name.
  if (me.name.trim() && me.name.trim() !== "You")
    put(out, {
      table: "profiles",
      key: `profiles:${uid}`,
      match: { id: uid },
      insert: {},
      update: { display_name: me.name.trim().slice(0, 80) },
      mode: "update",
    });
  const prof = {
    ...pick(me, PROFILE_FIELDS),
    recoveryDevice: w.recovery[localId]?.device ?? null,
  };
  put(out, {
    table: "athlete_profiles",
    key: `athlete_profiles:${uid}`,
    match: { athlete_id: uid },
    insert: { athlete_id: uid, payload: prof },
    update: { payload: prof },
    filesOwner: uid,
  });
  if (w.meTier !== "coached")
    for (const [kind, payload] of Object.entries(plansOf(me)))
      put(out, {
        table: "plans",
        key: `plans:${uid}:${kind}`,
        match: { athlete_id: uid, kind },
        insert: { athlete_id: uid, kind, payload },
        update: { payload },
        deletable: true,
      });
  for (const r of me.routines ?? [])
    put(out, {
      table: "routines",
      key: `routines:${r.id}`,
      match: { athlete_id: uid, id: r.id },
      insert: { athlete_id: uid, id: r.id, payload: r },
      update: { payload: r },
      deletable: true,
    });
  for (const s of w.history[localId] ?? [])
    put(out, {
      table: "workouts",
      key: `workouts:${s.id}`,
      match: { athlete_id: uid, id: s.id },
      insert: { athlete_id: uid, id: s.id, at: s.at, payload: s },
      update: { at: s.at, payload: s },
      deletable: true,
    });
  for (const f of w.foodLogs[localId] ?? [])
    put(out, {
      table: "food_logs",
      key: `food_logs:${f.id}`,
      match: { athlete_id: uid, id: f.id },
      insert: { athlete_id: uid, id: f.id, day: f.date, payload: f },
      update: { day: f.date, payload: f },
      deletable: true,
    });
  for (const f of w.myFoods)
    put(out, {
      table: "my_foods",
      key: `my_foods:${f.id}`,
      match: { athlete_id: uid, id: f.id },
      insert: { athlete_id: uid, id: f.id, payload: f },
      update: { payload: f },
      deletable: true,
    });
  for (const k of me.checkIns) {
    const at = k.at ?? new Date().toISOString();
    const { reply: _r, reviewed: _v, ...payload } = k;
    put(out, {
      table: "check_ins",
      key: `check_ins:${k.id}`,
      match: { athlete_id: uid, id: k.id },
      insert: { athlete_id: uid, id: k.id, at, payload },
      update: { at, payload },
      filesOwner: uid,
    });
  }
  if (coachId) athleteMessages(out, me, uid, coachId);
  for (const wi of me.weighIns ?? [])
    put(out, {
      table: "body_logs",
      key: `body_logs:${wi.id}`,
      match: { athlete_id: uid, id: wi.id },
      insert: {
        athlete_id: uid,
        id: wi.id,
        kind: "weight",
        day: wi.date,
        payload: { kg: wi.kg },
      },
      update: { day: wi.date, payload: { kg: wi.kg } },
      deletable: true,
    });
  for (const m of me.measureLog ?? []) {
    const id = `m-${m.date}`;
    put(out, {
      table: "body_logs",
      key: `body_logs:${id}`,
      match: { athlete_id: uid, id },
      insert: {
        athlete_id: uid,
        id,
        kind: "measure",
        day: m.date,
        payload: { values: m.values },
      },
      update: { day: m.date, payload: { values: m.values } },
      deletable: true,
    });
  }
  for (const ph of me.progressPhotos ?? [])
    put(out, {
      table: "progress_photos",
      key: `progress_photos:${ph.id}`,
      match: { athlete_id: uid, id: ph.id },
      insert: {
        athlete_id: uid,
        id: ph.id,
        day: ph.date,
        payload: { pose: ph.pose, uri: ph.uri },
      },
      update: { day: ph.date, payload: { pose: ph.pose, uri: ph.uri } },
      deletable: true,
      filesOwner: uid,
    });
  const rec = w.recovery[localId];
  const day = (area: string, d: string, payload: Row) =>
    put(out, {
      table: "day_logs",
      key: `day_logs:${area}:${d}`,
      match: { athlete_id: uid, area, day: d },
      insert: { athlete_id: uid, area, day: d, payload },
      update: { payload },
      deletable: true,
    });
  for (const l of rec?.logs ?? []) day("recovery", l.date, l as Row);
  const acts: Record<string, Row[]> = {};
  for (const a of rec?.activities ?? []) (acts[a.date] ??= []).push(a);
  for (const [d, items] of Object.entries(acts)) day("activity", d, { items });
  const done: Record<string, string[]> = {};
  for (const x of rec?.done ?? []) (done[x.split(":")[0]] ??= []).push(x);
  for (const [d, ids] of Object.entries(done)) day("protocols", d, { ids });
  for (const [d, ml] of Object.entries(me.water ?? {})) day("water", d, { ml });
  for (const t of me.transformations ?? [])
    put(out, {
      table: "transformations",
      key: `transformations:${t.id}`,
      match: { athlete_id: uid, id: t.id },
      insert: {},
      update: { status: t.status, payload: { ...t, status: undefined } },
      mode: "update",
    });
  if (me.enhanced) {
    const { consentAt, ...payload } = me.enhanced as Row;
    put(out, {
      table: "enhanced",
      key: `enhanced:${uid}`,
      match: { athlete_id: uid },
      insert: { athlete_id: uid, consent_at: consentAt ?? null, payload },
      update: { consent_at: consentAt ?? null, payload },
    });
  }
}

function athleteMessages(
  out: Map<string, PushRow>,
  me: Client,
  uid: string,
  coachId: string,
) {
  for (const m of me.messages) {
    const id = messageId(m, uid);
    if (m.from === "client")
      put(out, {
        table: "messages",
        key: `messages:${id}`,
        match: { id },
        insert: {
          id,
          coach_id: coachId,
          athlete_id: uid,
          sender: uid,
          body: m.text,
          attachment: attachmentOf(m),
        },
        update: {},
        mode: "insert",
        filesOwner: uid,
      });
  }
}

/** The coach's rows: profile, library, and per client the plans, notes, replies and messages. */
function coachRows(out: Map<string, PushRow>, w: World, uid: string) {
  const { billing: _b, clientLimit: _l, ...settings } = w.settings;
  put(out, {
    table: "profiles",
    key: `profiles:${uid}`,
    match: { id: uid },
    insert: {},
    update: { display_name: (w.coach.name || "Coach").slice(0, 80) },
    mode: "update",
  });
  const payload = { ...w.coach, settings };
  put(out, {
    table: "coach_profiles",
    key: `coach_profiles:${uid}`,
    match: { coach_id: uid },
    insert: { coach_id: uid, payload },
    update: { payload },
  });
  for (const t of w.templates)
    put(out, {
      table: "templates",
      key: `templates:${t.id}`,
      match: { coach_id: uid, id: t.id },
      insert: { coach_id: uid, id: t.id, kind: t.kind, payload: t },
      update: { kind: t.kind, payload: t },
      deletable: true,
    });
  for (const s of w.stacks)
    put(out, {
      table: "templates",
      key: `templates:${s.id}`,
      match: { coach_id: uid, id: s.id },
      insert: { coach_id: uid, id: s.id, kind: "stack", payload: s },
      update: { kind: "stack", payload: s },
      deletable: true,
    });
  for (const l of w.leads)
    put(out, {
      table: "leads",
      key: `leads:${l.id}`,
      match: { coach_id: uid, id: l.id },
      insert: { coach_id: uid, id: l.id, payload: l },
      update: { payload: l },
      deletable: true,
    });
  for (const c of w.clients) {
    if (c.pending) {
      // Saved as a personal invite from the moment the client is added (D56).
      const code = (c.invite?.code ?? inviteCodeFor(c.id))
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase();
      const payload = {
        clientId: c.id,
        sent: !!c.invite,
        client: pick(c, ["goal", "basics", "phone", "targetKg", "answers"]),
        plans: plansOf(c),
        notes: { ...pick(c, NOTE_FIELDS), name: c.name },
      };
      put(out, {
        table: "invites",
        key: `invites:${code}`,
        match: { code },
        insert: {
          code,
          kind: "personal",
          client_name: c.name.slice(0, 80),
          payload,
        },
        update: { payload },
      });
      continue;
    }
    if (!UUID.test(c.id)) continue; // sample clients never leave the phone
    put(out, {
      table: "coach_client_notes",
      key: `coach_client_notes:${c.id}`,
      match: { coach_id: uid, client_id: c.id },
      insert: {
        coach_id: uid,
        client_id: c.id,
        payload: { ...pick(c, NOTE_FIELDS), name: c.name },
      },
      update: { payload: { ...pick(c, NOTE_FIELDS), name: c.name } },
    });
    if (c.status === "completed") continue;
    for (const [kind, p] of Object.entries(plansOf(c)))
      put(out, {
        table: "plans",
        key: `plans:${c.id}:${kind}`,
        match: { athlete_id: c.id, kind },
        insert: { athlete_id: c.id, kind, payload: p },
        update: { payload: p },
      });
    for (const k of c.checkIns)
      if (k.reply)
        put(out, {
          table: "check_ins",
          key: `check_ins:${c.id}:${k.id}:reply`,
          match: { athlete_id: c.id, id: k.id },
          insert: {},
          update: {
            reply: k.reply,
            reviewed_at: k.reviewed ? (k.at ?? new Date().toISOString()) : null,
          },
          mode: "update",
        });
    for (const m of c.messages) {
      if (m.from !== "coach") continue;
      const id = messageId(m, c.id);
      put(out, {
        table: "messages",
        key: `messages:${id}`,
        match: { id },
        insert: {
          id,
          coach_id: uid,
          athlete_id: c.id,
          sender: uid,
          body: m.text,
          attachment: attachmentOf(m),
        },
        update: {},
        mode: "insert",
        filesOwner: c.id,
      });
    }
    for (const t of c.transformations ?? [])
      put(out, {
        table: "transformations",
        key: `transformations:${c.id}:${t.id}`,
        match: { athlete_id: c.id, id: t.id },
        insert: {
          athlete_id: c.id,
          id: t.id,
          coach_id: uid,
          payload: { ...t, status: undefined },
        },
        update: { payload: { ...t, status: undefined } },
        filesOwner: c.id,
      });
    if (c.enhanced) {
      const { consentAt: _c, ...payload } = c.enhanced as Row;
      put(out, {
        table: "enhanced",
        key: `enhanced:${c.id}`,
        match: { athlete_id: c.id },
        insert: { athlete_id: c.id, payload },
        update: { payload },
      });
    }
  }
}

export function decompose(w: World, ctx: Ctx): Map<string, PushRow> {
  const out = new Map<string, PushRow>();
  for (const e of w.custom)
    if (e.custom !== false) {
      const id = hashUuid(e.name.toLowerCase());
      put(out, {
        table: "custom_exercises",
        key: `custom_exercises:${id}`,
        match: { owner_id: ctx.uid, id },
        insert: { owner_id: ctx.uid, id, payload: e },
        update: { payload: e },
      });
    }
  if (ctx.role === "athlete") {
    const me =
      w.meTier === "coached" ? w.clients.find((c) => c.id === w.meId) : w.self;
    if (me) athleteRows(out, w, me, ctx.uid, ctx.coachId ?? null);
  } else coachRows(out, w, ctx.uid);
  return out;
}

/** Rows whose content changed, comparing the last pushed set with the new one. */
export function diff(prev: Map<string, PushRow>, next: Map<string, PushRow>) {
  const sig = (r: PushRow) => JSON.stringify([r.insert, r.update]);
  const write: PushRow[] = [];
  const remove: PushRow[] = [];
  for (const [k, r] of next) {
    const old = prev.get(k);
    if (!old || sig(old) !== sig(r)) write.push(r);
  }
  for (const [k, r] of prev) if (!next.has(k) && r.deletable) remove.push(r);
  return { write, remove, isNew: (r: PushRow) => !prev.has(r.key) };
}

/** Messages the account has received and not yet marked read: the ids to mark once they're seen. */
export function unreadFor(p: Pulled, ctx: Ctx): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const m of p.messages)
    if (!m.read_at && m.sender !== ctx.uid)
      (out[ctx.role === "coach" ? m.athlete_id : ctx.uid] ??= []).push(m.id);
  return out;
}

/** The athlete's current coach in a pull, if any. */
export const coachOf = (p: Pulled, uid: string): string | null =>
  p.coach_clients.find((l) => l.client_id === uid && !l.ended_at)?.coach_id ??
  null;
