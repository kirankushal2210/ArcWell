import { describe, expect, it } from "@jest/globals";

import {
  defaultCoachProfile,
  defaultCoachSettings,
} from "@/features/coach/coachProfile";
import type { Client } from "@/features/coach/sampleData";
import {
  assemble,
  decompose,
  diff,
  emptyClient,
  messageId,
  type Pulled,
  type PushRow,
  type World,
} from "@/features/sync/map";

const UID = "11111111-1111-4111-8111-111111111111";
const COACH = "22222222-2222-4222-8222-222222222222";

const blankWorld = (): World => ({
  clients: [],
  meId: null,
  meTier: "free",
  self: null,
  history: {},
  custom: [],
  foodLogs: {},
  myFoods: [],
  recovery: {},
  templates: [],
  leads: [],
  coach: defaultCoachProfile(),
  settings: defaultCoachSettings(),
  stacks: [],
});

const emptyPull = (): Pulled => ({
  profiles: [],
  coach_clients: [],
  athlete_profiles: [],
  coach_profiles: [],
  coach_client_notes: [],
  plans: [],
  enhanced: [],
  templates: [],
  leads: [],
  custom_exercises: [],
  workouts: [],
  routines: [],
  food_logs: [],
  my_foods: [],
  check_ins: [],
  messages: [],
  body_logs: [],
  progress_photos: [],
  day_logs: [],
  transformations: [],
  invites: [],
  coach_billing: [],
  tier: "free",
});

/** Pretend to be the server: store each pushed row as the database would return it. */
function serverFrom(rows: Map<string, PushRow>, base = emptyPull()): Pulled {
  const p = base;
  for (const r of rows.values()) {
    if (r.mode === "update") continue;
    const row: Record<string, unknown> = { ...r.insert };
    if (r.table === "messages") row.created_at = new Date().toISOString();
    (p as unknown as Record<string, Record<string, unknown>[]>)[r.table].push(
      row,
    );
  }
  return p;
}

function athleteWorld(): World {
  const me: Client = {
    ...emptyClient("self", "Asha"),
    goal: "Lose fat",
    basics: {
      sex: "female",
      age: 30,
      heightCm: 160,
      weightKg: 62,
      diet: "Vegetarian",
      injuries: "",
    },
    weighIns: [
      { id: "w1", date: "2026-11-01", kg: 62 },
      { id: "w2", date: "2026-11-10", kg: 61.2 },
    ],
    checkIns: [],
    messages: [],
  };
  return {
    ...blankWorld(),
    meId: "self",
    meTier: "free",
    self: me,
    history: {
      self: [
        {
          id: "s1",
          at: "2026-11-12T08:00:00.000Z",
          name: "Upper A",
          minutes: 50,
          volume: 4000,
          setsDone: 12,
          setsPlanned: 12,
          exercises: [
            {
              name: "Bench press",
              sets: [{ kg: 40, reps: 8, seconds: null, warmup: false }],
            },
          ],
          bests: [],
        },
      ],
    },
    foodLogs: {
      self: [
        {
          id: "f1",
          date: "2026-11-12",
          meal: "lunch",
          name: "Dal",
          qty: 1,
          unit: "katori",
          grams: 150,
          source: "ifct",
          macros: { kcal: 180, p: 9, c: 24, f: 5 },
        },
      ],
    },
  };
}

describe("cloud sync mapping (D107)", () => {
  it("round-trips a self-guided athlete through the rows", () => {
    const w = athleteWorld();
    const rows = decompose(w, { uid: UID, role: "athlete" });
    expect(rows.get(`workouts:s1`)?.insert.at).toBe("2026-11-12T08:00:00.000Z");
    expect(rows.get(`food_logs:f1`)?.insert.day).toBe("2026-11-12");
    expect(rows.get(`body_logs:w2`)?.insert.kind).toBe("weight");

    const pulled = serverFrom(rows);
    pulled.profiles.push({ id: UID, display_name: "Asha" });
    const back = assemble(pulled, { uid: UID, role: "athlete" }, blankWorld());
    expect(back.meId).toBe(UID);
    expect(back.self?.goal).toBe("Lose fat");
    expect(back.self?.weights).toEqual([62, 61.2]);
    expect(back.history[UID].map((s) => s.id)).toEqual(["s1"]);
    expect(back.foodLogs[UID].map((f) => f.id)).toEqual(["f1"]);
  });

  it("keeps onboarding's data on the first pull, then pushes it", () => {
    const local = athleteWorld();
    const first = assemble(emptyPull(), { uid: UID, role: "athlete" }, local);
    expect(first.self?.goal).toBe("Lose fat");
    expect(first.history[UID]).toHaveLength(1);
    const server = assemble(
      emptyPull(),
      { uid: UID, role: "athlete" },
      local,
      false,
    );
    expect(server.history[UID]).toHaveLength(0);
  });

  it("never puts dated logs on the profile document", () => {
    const rows = decompose(athleteWorld(), { uid: UID, role: "athlete" });
    const payload = rows.get(`athlete_profiles:${UID}`)?.insert
      .payload as Record<string, unknown>;
    for (const k of [
      "weighIns",
      "weights",
      "checkIns",
      "messages",
      "training",
      "progressPhotos",
    ])
      expect(payload).not.toHaveProperty(k);
  });

  it("writes plans only for a self-guided athlete", () => {
    const w = athleteWorld();
    w.self = { ...w.self!, program: { name: "Mine", weeks: 8, days: [] } };
    expect(
      decompose(w, { uid: UID, role: "athlete" }).has(`plans:${UID}:training`),
    ).toBe(true);
    const coached = {
      ...w,
      meTier: "coached" as const,
      clients: [w.self!],
      self: null,
    };
    expect(
      decompose(coached, { uid: UID, role: "athlete" }).has(
        `plans:${UID}:training`,
      ),
    ).toBe(false);
  });

  it("sends the athlete's messages to their coach, once", () => {
    const w = athleteWorld();
    w.self = {
      ...w.self!,
      messages: [
        {
          from: "client",
          text: "Hi",
          time: "9:00 am",
          at: "2026-11-12T03:30:00.000Z",
        },
      ],
    };
    const ctx = { uid: UID, role: "athlete" as const, coachId: COACH };
    const rows = decompose(w, ctx);
    const id = messageId(w.self.messages[0], UID);
    expect(rows.get(`messages:${id}`)?.insert.coach_id).toBe(COACH);
    // The same message decomposes to the same row, so it's never sent twice.
    expect(diff(rows, decompose(w, ctx)).write).toHaveLength(0);
  });

  it("keeps sample clients on the phone and turns expected clients into invites", () => {
    const sample = {
      ...emptyClient("priya", "Priya"),
      program: { name: "x", weeks: 4, days: [] },
    };
    const expected = {
      ...emptyClient("c_new", "Ravi"),
      pending: true,
      invite: { token: "abc", code: "RAV-4821", claimed: false },
      program: { name: "Prepared", weeks: 8, days: [] },
    };
    const w = { ...blankWorld(), clients: [sample, expected] };
    const rows = decompose(w, { uid: COACH, role: "coach" });
    expect([...rows.keys()].some((k) => k.includes("priya"))).toBe(false);
    const invite = rows.get("invites:RAV4821");
    expect(invite?.insert.code).toBe("RAV4821");
    expect(
      (
        invite?.insert.payload as {
          plans: { training: { program: { name: string } } };
        }
      ).plans.training.program.name,
    ).toBe("Prepared");
  });

  it("works out a coach's view of a client from dated rows only", () => {
    const p = emptyPull();
    p.profiles.push(
      { id: COACH, display_name: "Coach K" },
      { id: UID, display_name: "Asha" },
    );
    p.coach_clients.push({
      coach_id: COACH,
      client_id: UID,
      joined_at: "2026-11-01T00:00:00Z",
      ended_at: null,
    });
    p.body_logs.push({
      athlete_id: UID,
      id: "w2",
      kind: "weight",
      day: "2026-11-10",
      payload: { kg: 61.2 },
    });
    p.messages.push({
      id: "m1",
      coach_id: COACH,
      athlete_id: UID,
      sender: UID,
      body: "Hi",
      created_at: "2026-11-12T03:30:00Z",
      read_at: null,
    });
    const w = assemble(p, { uid: COACH, role: "coach" }, blankWorld());
    expect(w.clients).toHaveLength(1);
    expect(w.clients[0].weights).toEqual([61.2]);
    expect(w.clients[0].unread).toBe(1);
    expect(w.clients[0].messages[0].from).toBe("client");
  });

  it("only deletes rows the account owns", () => {
    const w = athleteWorld();
    const before = decompose(w, { uid: UID, role: "athlete" });
    const after = decompose(
      { ...w, history: { self: [] } },
      { uid: UID, role: "athlete" },
    );
    const d = diff(before, after);
    expect(d.remove.map((r) => r.key)).toEqual(["workouts:s1"]);
  });
});
