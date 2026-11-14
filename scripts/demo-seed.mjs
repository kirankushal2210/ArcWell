// Investor demo data for the LOCAL Supabase stack (free, D107; docs/DEMO.md).
//
//   npm run demo:seed            add the demo accounts (skips any that exist)
//   npm run demo:seed -- --reset wipe the local database first, then add them
//
// Creates a coach with two coached clients (three weeks of workouts, food, weigh-ins, check-ins and
// chat) and a self-guided Arcwell Plus athlete. Everything is written by signing in as each person,
// so row-level security applies exactly as in the app. Payload shapes come from supabase/demo/
// fixtures.json, which the app itself wrote. Refuses to run against anything but 127.0.0.1.
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fx = JSON.parse(readFileSync(join(root, "supabase/demo/fixtures.json"), "utf8"));

if (process.argv.includes("--reset")) {
  console.log("Resetting the local database…");
  execSync("npx supabase db reset", { cwd: root, stdio: "ignore" });
}
const status = JSON.parse(execSync("npx supabase status -o json", { cwd: root, encoding: "utf8" }));
const API = status.API_URL;
if (!/^http:\/\/127\.0\.0\.1:/.test(API)) throw new Error("demo-seed only runs against the local stack");
const SR = status.SERVICE_ROLE_KEY;
const ANON = status.ANON_KEY;

// ---------- HTTP helpers ----------

async function call(method, path, { token, body, prefer } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      apikey: token === SR ? SR : ANON,
      Authorization: `Bearer ${token ?? ANON}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return data;
}

const insert = (token, table, rows) => call("POST", `/rest/v1/${table}`, { token, body: rows, prefer: "return=minimal" });

async function user(email, role, name) {
  const found = await call("GET", `/auth/v1/admin/users?per_page=200`, { token: SR });
  let u = found.users.find((x) => x.email === email);
  const fresh = !u;
  if (!u) u = await call("POST", "/auth/v1/admin/users", { token: SR, body: { email, email_confirm: true } });
  await call("POST", "/rest/v1/profiles?on_conflict=id", {
    token: SR,
    body: { id: u.id, role, display_name: name },
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  const link = await call("POST", "/auth/v1/admin/generate_link", { token: SR, body: { type: "magiclink", email } });
  const session = await call("POST", "/auth/v1/verify", { body: { type: "email", email, token: link.email_otp } });
  return { id: u.id, token: session.access_token, fresh };
}

// ---------- Dates ----------

const DAY = 86400000;
const ago = (days, hour = 18) => {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const id = (p) => `${p}${Math.random().toString(36).slice(2, 10)}`;

// ---------- Builders, from the app's own shapes ----------

function workout(day, at, strength) {
  const exercises = day.exercises.map((e) => {
    const base = /squat|deadlift|press|row|pulldown|bench/i.test(e.name) ? 30 : 12;
    const kg = Math.round((base + strength) * 2) / 2;
    const reps = Number(String(e.reps).match(/\d+/)?.[0] ?? 10);
    return {
      name: e.name,
      sets: Array.from({ length: e.sets }, () => ({ kg, km: null, rpe: 8, reps, warmup: false, seconds: null })),
    };
  });
  const sets = exercises.reduce((s, e) => s + e.sets.length, 0);
  const volume = exercises.reduce((s, e) => s + e.sets.reduce((v, x) => v + (x.kg ?? 0) * (x.reps ?? 0), 0), 0);
  return { ...fx.workout, id: id("w"), at: at.toISOString(), name: day.name, note: "", effort: 3, minutes: 45 + (sets % 15), setsDone: sets, setsPlanned: sets, volume, bests: [], exercises };
}

const FOODS = [
  ["breakfast", "Poha", 1, "plate", 180, { kcal: 270, p: 6, c: 45, f: 7 }],
  ["breakfast", "Besan chilla", 2, "piece", 160, { kcal: 300, p: 16, c: 30, f: 12 }],
  ["lunch", "Rajma chawal", 1, "plate", 350, { kcal: 420, p: 15, c: 70, f: 8 }],
  ["lunch", "Dal tadka with 2 roti", 1, "plate", 320, { kcal: 450, p: 18, c: 62, f: 13 }],
  ["snacks", "Greek yogurt", 1, "katori", 150, { kcal: 110, p: 15, c: 6, f: 3 }],
  ["dinner", "Paneer bhurji with roti", 1, "plate", 300, { kcal: 520, p: 30, c: 38, f: 26 }],
  ["dinner", "Chicken curry with rice", 1, "plate", 380, { kcal: 560, p: 38, c: 55, f: 18 }],
];

function foodDay(d, veg) {
  const pick = FOODS.filter((f) => !(veg && /chicken/i.test(f[1])));
  const meals = ["breakfast", "lunch", "snacks", "dinner"];
  return meals.map((meal, k) => {
    const options = pick.filter((f) => f[0] === meal);
    const [, name, qty, unit, grams, macros] = options[(d.getDate() + k) % options.length];
    return { ...fx.food, id: id("f"), date: ymd(d), meal, name, qty, unit, grams, macros, source: "verified", foodId: undefined, at: 8 * 60 + k * 240 };
  });
}

function checkIn(uid, week, at, weightKg, wins) {
  return {
    athlete_id: uid,
    id: `${uid}-${week}-${id("")}`,
    at: at.toISOString(),
    payload: { ...fx.checkin, id: undefined, at: at.toISOString(), week, weightKg, wins, submitted: at.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }), rows: [{ now: String(weightKg), last: "—", delta: "—", label: "Weight" }] },
  };
}

// ---------- Coach ----------

async function seedCoach() {
  const coach = await user("anjali@arcwell.test", "coach", "Coach Anjali Kapoor");
  await call("POST", "/rest/v1/coach_profiles?on_conflict=coach_id", {
    token: coach.token,
    body: { coach_id: coach.id, payload: { ...fx.coachProfile, name: "Coach Anjali Kapoor" } },
    prefer: "resolution=ignore-duplicates,return=minimal",
  });
  const fat = fx.plans.training.program;
  const muscle = fx.selfPlans.training.program;
  await call("POST", "/rest/v1/templates?on_conflict=coach_id,id", {
    token: coach.token,
    body: [
      { coach_id: coach.id, id: "t-fatloss", kind: "training", payload: { id: "t-fatloss", kind: "training", name: fat.name, detail: `${fat.days.length} workouts · ${fat.weeks} weeks`, clients: 1, program: fat } },
      { coach_id: coach.id, id: "t-muscle", kind: "training", payload: { id: "t-muscle", kind: "training", name: "Muscle gain · 4 days", detail: `${muscle.days.length} workouts · ${muscle.weeks} weeks`, clients: 1, program: { ...muscle, name: "Muscle gain · 4 days" } } },
      { coach_id: coach.id, id: "m-veg", kind: "meals", payload: { id: "m-veg", kind: "meals", name: "Vegetarian 1,700 kcal", detail: "", clients: 1, nutrition: fx.plans.nutrition.plan } },
    ],
    prefer: "resolution=ignore-duplicates,return=minimal",
  });
  // The row id and the payload id must match (the app keys leads by it), and the history is `events`.
  const lid = id("l");
  const callAt = ago(-1, 11).toISOString();
  await insert(coach.token, "leads", [
    {
      coach_id: coach.id,
      id: lid,
      payload: {
        id: lid,
        name: "Kabir Mehta",
        source: "instagram",
        stage: "call_booked",
        goal: "Lose fat",
        createdAt: ago(3, 12).toISOString(),
        callAt,
        events: [
          { id: id("v"), at: ago(3, 12).toISOString(), kind: "created", text: "Messaged on Instagram about fat loss" },
          { id: id("v"), at: ago(2, 10).toISOString(), kind: "message", text: "Sent the coaching packages" },
          { id: id("v"), at: ago(1, 19).toISOString(), kind: "stage", text: "Call booked" },
        ],
      },
    },
  ]).catch(() => {});
  return coach;
}

// ---------- A coached client, joined three weeks ago ----------

async function seedClient(coach, { email, name, goal, basics, targetKg, plans, startKg, veg, lines }) {
  const a = await user(email, "athlete", name);
  if (!a.fresh) return console.log(`  ${name}: already there`);
  const code = `D${Math.random().toString(36).slice(2, 9).toUpperCase()}`.replace(/[^A-Z0-9]/g, "X").slice(0, 8);
  const start = ago(21).toISOString();
  await insert(coach.token, "invites", [
    {
      code,
      kind: "personal",
      client_name: name,
      payload: {
        clientId: id("c"),
        sent: true,
        client: { goal, basics, targetKg },
        plans: { ...plans, training: { ...plans.training, programStart: start, programUpdatedAt: start } },
        notes: { name, line: "On track", notes: lines.notes },
      },
    },
  ]);
  await insert(a.token, "consents", [{ purpose: "health_data", granted: true, policy_version: "2026-11" }]);
  await call("POST", "/rest/v1/rpc/redeem_invite", { token: a.token, body: { p_code: code } });
  // Demo only: date the link three weeks back so the coach sees the history (join-date rule).
  await call("PATCH", `/rest/v1/coach_clients?client_id=eq.${a.id}&ended_at=is.null`, { token: SR, body: { joined_at: start }, prefer: "return=minimal" });

  const days = plans.training.program.days;
  const workouts = [];
  for (let d = 20, k = 0; d >= 1; d -= 2, k++) workouts.push(workout(days[k % days.length], ago(d), k * 1.5));
  await insert(a.token, "workouts", workouts.map((w) => ({ athlete_id: a.id, id: w.id, at: w.at, payload: w })));

  const food = [];
  for (let d = 6; d >= 0; d--) food.push(...foodDay(ago(d), veg));
  await insert(a.token, "food_logs", food.map((f) => ({ athlete_id: a.id, id: f.id, day: f.date, payload: f })));

  const weights = [];
  for (let d = 21, k = 0; d >= 0; d -= 3, k++) {
    const kg = Math.round((startKg - k * 0.35 + (k % 2 ? 0.2 : 0)) * 10) / 10;
    weights.push({ athlete_id: a.id, id: id("w"), kind: "weight", day: ymd(ago(d)), payload: { kg } });
  }
  await insert(a.token, "body_logs", weights);

  const k1 = checkIn(a.id, 1, ago(14, 9), startKg - 0.8, lines.wins1);
  const k2 = checkIn(a.id, 2, ago(7, 9), startKg - 1.6, lines.wins2);
  await insert(a.token, "check_ins", [k1, k2]);
  await call("PATCH", `/rest/v1/check_ins?athlete_id=eq.${a.id}&id=eq.${encodeURIComponent(k1.id)}`, {
    token: coach.token,
    body: { reply: lines.reply1, reviewed_at: ago(13, 10).toISOString() },
    prefer: "return=minimal",
  });

  // Chat, oldest first (each message is stamped by the server when sent).
  for (const [from, body] of lines.chat)
    await insert(from === "coach" ? coach.token : a.token, "messages", [
      { id: randomUUID(), coach_id: coach.id, athlete_id: a.id, sender: from === "coach" ? coach.id : a.id, body },
    ]);
  console.log(`  ${name}: joined, ${workouts.length} workouts, ${food.length} foods, ${weights.length} weigh-ins, 2 check-ins`);
}

// ---------- A self-guided Arcwell Plus athlete ----------

async function seedSelfGuided() {
  const m = await user("meera@arcwell.test", "athlete", "Meera Nair");
  if (!m.fresh) return console.log("  Meera Nair: already there");
  await insert(m.token, "consents", [
    { purpose: "health_data", granted: true, policy_version: "2026-11" },
    { purpose: "ai", granted: true, policy_version: "2026-11" },
  ]);
  await insert(m.token, "athlete_profiles", [{ athlete_id: m.id, payload: fx.selfProfile }]);
  const start = ago(10).toISOString();
  await insert(
    m.token,
    "plans",
    Object.entries(fx.selfPlans).map(([kind, payload]) => ({
      athlete_id: m.id,
      kind,
      payload: kind === "training" ? { ...payload, programStart: start } : payload,
    })),
  );
  const days = fx.selfPlans.training.program.days;
  const workouts = [9, 7, 5, 2].map((d, k) => workout(days[k % days.length], ago(d), k));
  await insert(m.token, "workouts", workouts.map((w) => ({ athlete_id: m.id, id: w.id, at: w.at, payload: w })));
  const food = [];
  for (let d = 3; d >= 0; d--) food.push(...foodDay(ago(d), true));
  await insert(m.token, "food_logs", food.map((f) => ({ athlete_id: m.id, id: f.id, day: f.date, payload: f })));
  // Arcwell Plus on a trial, as the paywall's demo trial writes it.
  await call("POST", "/rest/v1/subscriptions?on_conflict=user_id", {
    token: SR,
    body: { user_id: m.id, tier: "pro", source: "trial", product_id: "demo_plus", expires_at: new Date(Date.now() + 5 * DAY).toISOString() },
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  console.log("  Meera Nair: self-guided, Arcwell Plus trial, 4 workouts");
}

// ---------- Run ----------

console.log("Seeding the local demo…");
const coach = await seedCoach();
console.log("  Coach Anjali Kapoor: profile, 3 templates, 1 lead");
await seedClient(coach, {
  email: "ravi@arcwell.test",
  name: "Ravi Kumar",
  goal: "Lose fat · to 64 kg",
  basics: { sex: "male", age: 28, heightCm: 172, weightKg: 70, diet: "Vegetarian", injuries: "None" },
  targetKg: 64,
  plans: fx.plans,
  startKg: 70,
  veg: true,
  lines: {
    notes: "Desk job, trains evenings. Wants to see abs by March.",
    wins1: "Hit all 4 workouts. Walking 8k steps.",
    wins2: "Squat up 5 kg. Cravings at night still.",
    reply1: "Great first week, Ravi. Keep the steps, and add 20 g protein at dinner.",
    chat: [
      ["athlete", "Hi coach, ready to start!"],
      ["coach", "Welcome Ravi! Start with Upper A today."],
      ["athlete", "Done! Legs are sore though."],
      ["coach", "Normal in week one. Walk 20 minutes tomorrow, it helps."],
    ],
  },
});
await seedClient(coach, {
  email: "priya@arcwell.test",
  name: "Priya Sharma",
  goal: "Build muscle",
  basics: { sex: "female", age: 26, heightCm: 160, weightKg: 54, diet: "Non-vegetarian", injuries: "Knee" },
  targetKg: 57,
  plans: { ...fx.selfPlans, nutrition: fx.selfPlans.nutrition, meta: { plan: { training: "Muscle gain · 4 days", meals: "Non-veg 2,100 kcal" }, checkInDay: "Friday" } },
  startKg: 54,
  veg: false,
  lines: {
    notes: "Careful with deep knee flexion. Loves deadlifts.",
    wins1: "First time deadlifting 50 kg!",
    wins2: "Eating 3 proper meals now.",
    reply1: "Brilliant, Priya. Keep the hip hinge tight; we'll add 2.5 kg next week.",
    chat: [
      ["coach", "How did the first session feel?"],
      ["athlete", "Loved it. Can we add one more upper day?"],
    ],
  },
});
await seedSelfGuided();
console.log("\nDone. Sign in at the app with an emailed code (local inbox: http://127.0.0.1:54324):");
console.log("  coach   anjali@arcwell.test");
console.log("  clients ravi@arcwell.test · priya@arcwell.test");
console.log("  Plus    meera@arcwell.test");
