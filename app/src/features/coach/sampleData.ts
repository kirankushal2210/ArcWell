// Sample data for the coach app shell (sitemap §5, K-01 to K-30). Nothing here is real: there are no
// accounts or database yet (PLAN.md Phases 1–2). Screens read this through CoachDataProvider so the
// real queries can replace it later without changing the screens.
import type { ClientStatus } from "@/components/primitives";
import type {
  AthleteSettings,
  CoachingEnd,
  MeasureEntry,
  ProgressPhoto,
  Transformation,
  WeighIn,
} from "@/features/athlete/athleteData";

import type { ClientAccount, LeadSource } from "./crm";
import type { Enhanced } from "./enhanced";
import type { Supplement } from "./supplements";
import type {
  NutritionPlan,
  RecoveryProtocol,
  TrainingDay,
  TrainingProgram,
} from "./plans";

export type WorkoutLog = {
  date: string;
  name: string;
  sets: number;
  minutes: number;
  topSet: string;
  missed?: boolean;
};

export type CheckInScore =
  "training" | "nutrition" | "sleep" | "energy" | "stress" | "hunger";

export type CheckIn = {
  id: string;
  /** 0 is the starting point when coaching begins. */
  week: number;
  /** ISO date-time, for check-ins sent from the app. */
  at?: string;
  /** Local photo URIs, shared with the coach only (D12: optional). */
  photos?: { front?: string; side?: string; back?: string };
  weightKg?: number;
  waistCm?: number;
  /** 1–5 for the week (stress: 5 = very stressed). */
  scores?: Partial<Record<CheckInScore, number>>;
  wins?: string;
  struggles?: string;
  question?: string;
  submitted: string;
  /** Weekly averages, last week vs this week. */
  rows: { label: string; last: string; now: string; delta: string }[];
  answers: string;
  note?: string;
  reviewed: boolean;
  reply?: string;
};

export type Message = {
  from: "coach" | "client";
  text: string;
  time: string;
  /** ISO date-time, for messages sent from the app (day separators). */
  at?: string;
  /** Local photo URI (F7: image attachments). */
  image?: string;
  /** A PDF attachment (F7-02); opens in the phone's viewer (X-06). */
  file?: { name: string; uri: string };
};

export type Client = {
  id: string;
  name: string;
  status: ClientStatus;
  /** Joined with the invite link and still waiting for a plan (CO-14). */
  isNew?: boolean;
  joined: string;
  weeksWithYou: number;
  goal: string;
  /** Why the client sits under "Needs attention" (K-01), or a calm status line. */
  attention?: string;
  line: string;
  adherence: number | null;
  checkInDay: string;
  answers: [string, string][];
  plan?: { training: string; meals: string };
  weights: number[];
  targetKg: number;
  training: { weekDone: number; weekPlanned: number; logs: WorkoutLog[] };
  nutrition: {
    targetKcal: number;
    proteinG: number;
    days: { day: string; kcal: number; protein: number }[];
  };
  recovery: {
    sleepTargetH: number;
    nights: { day: string; hours: number }[];
    quality: number;
    stress: number;
    energy: number;
    soreness: number;
  };
  measurements: { label: string; start: number; now: number; unit: string }[];
  photoWeeks: number[];
  checkIns: CheckIn[];
  messages: Message[];
  unread: number;
  notes: string;
  /** Added by the coach after a call and not joined yet (D56). */
  pending?: boolean;
  phone?: string;
  /** Details the coach entered, used for suggested targets and shown for the client to confirm. */
  basics?: {
    sex: "female" | "male" | "unsaid";
    age: number;
    heightCm: number;
    weightKg: number;
    diet: string;
    injuries: string;
  };
  program?: TrainingProgram;
  nutritionPlan?: NutritionPlan;
  protocol?: RecoveryProtocol;
  invite?: { token: string; code: string; claimed: boolean };
  /** Self-guided athletes: the onboarding answers that shape swaps (equipment, home kit, injuries). */
  profile?: {
    equipment?: string;
    homeKit?: string[];
    injuries?: string[];
    /** Tracker named in onboarding (AO-15b), connected later in Recovery (D60). */
    device?: string;
  };
  /** When the current training program started, for "Week 3 of 8" (ISO date). */
  programStart?: string;
  /** The athlete's own routines, outside the program: extra sessions they plan themselves. */
  routines?: TrainingDay[];
  /** CRM (D63): package, fee, renewal and payment status, recorded by the coach. */
  account?: ClientAccount;
  /** Coach messages the client hasn't read yet. */
  coachUnread?: number;
  /** Optional supplement list (D64). */
  supplements?: Supplement[];
  /** Marked by the coach as a competitive bodybuilder: shows the Enhanced section (D64). */
  competitive?: boolean;
  /** Enhanced-athlete record, only after the client's own consent (D64). */
  enhanced?: Enhanced;
  /** Set when the client shares history from before they joined (AC-10, D37); absent = join date (SPEC). The athlete's one switch shares everything earlier. */
  historyFrom?: string;
  /** Where the client came from, when they joined from a lead. */
  source?: LeadSource;
  /** Paused until, or leaving on (as the coach typed it, e.g. "20 Nov"), with a short note the client sees (CS-01, CS-02, D39). */
  statusUntil?: string;
  statusNote?: string;
  /** Physique (D9): dated weigh-ins, measurements and progress photos. */
  weighIns?: WeighIn[];
  measureLog?: MeasureEntry[];
  progressPhotos?: ProgressPhoto[];
  /** The athlete's own account settings and consents (AC-02, AC-08, N-06). */
  athleteSettings?: AthleteSettings;
  /** Transformation photo requests and approvals (F9). */
  transformations?: Transformation[];
  /** Water drunk per day in ml (YYYY-MM-DD → ml). */
  water?: Record<string, number>;
  /** How the coach ended coaching, so the athlete's app can follow (K-29, K-30). */
  endedBy?: "completed" | "closed";
  /** Set once coaching has ended: the plan stays, read-only (D21). */
  formerCoach?: CoachingEnd;
};

export type Template = {
  id: string;
  kind: "training" | "meals";
  name: string;
  /** One line for the list, built from the content (e.g. "4 workouts · 8 weeks"). */
  detail: string;
  /** How many clients have been given a copy. */
  clients: number;
  /** Training templates: the program each client gets a copy of. */
  program?: TrainingProgram;
  /** Meal templates: targets plus the example day each client gets a copy of. */
  nutrition?: NutritionPlan;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const week = (values: number[]) =>
  DAYS.map((day, k) => ({ day, v: values[k] }));

const nutritionWeek = (kcal: number[], protein: number[]) =>
  week(kcal).map(({ day, v }, k) => ({ day, kcal: v, protein: protein[k] }));

const sleepWeek = (hours: number[]) =>
  week(hours).map(({ day, v }) => ({ day, hours: v }));

const NEW_CLIENT_STATS = {
  adherence: null,
  weeksWithYou: 0,
  training: { weekDone: 0, weekPlanned: 0, logs: [] },
  measurements: [],
  photoWeeks: [],
  checkIns: [],
  notes: "",
};

export const sampleClients: Client[] = [
  {
    id: "priya",
    name: "Priya Sharma",
    status: "active",
    joined: "19 Oct",
    weeksWithYou: 3,
    goal: "Lose fat · to 63 kg",
    attention: "Check-in to review · submitted 2 h ago",
    line: "On track",
    adherence: 92,
    checkInDay: "Sunday",
    answers: [
      ["Goal", "Lose fat · to 63 kg"],
      ["Body", "26 · 162 cm · 68.0 kg · female"],
      ["Activity", "Mostly sitting"],
      ["Experience", "6 months – 2 years"],
      ["Training", "Gym · 4 × 45 min · mornings"],
      ["Injuries", "Lower back"],
      ["Sleep", "6.5 h · okay · stress 4/5"],
      ["Diet", "Vegetarian · 3 meals"],
    ],
    plan: { training: "Fat loss · 4 days", meals: "Vegetarian 1,600 kcal" },
    weights: [68.0, 67.6, 67.5, 67.1, 66.8, 66.9, 66.4, 66.2],
    targetKg: 63,
    training: {
      weekDone: 4,
      weekPlanned: 4,
      logs: [
        {
          date: "Sat 8 Nov",
          name: "Lower B",
          sets: 16,
          minutes: 47,
          topSet: "Leg press 120 kg × 10",
        },
        {
          date: "Thu 6 Nov",
          name: "Upper B",
          sets: 15,
          minutes: 44,
          topSet: "Lat pulldown 40 kg × 10",
        },
        {
          date: "Tue 4 Nov",
          name: "Lower A",
          sets: 16,
          minutes: 48,
          topSet: "Goblet squat 20 kg × 12",
        },
        {
          date: "Mon 3 Nov",
          name: "Upper A",
          sets: 14,
          minutes: 42,
          topSet: "DB press 12 kg × 10",
        },
      ],
    },
    nutrition: {
      targetKcal: 1600,
      proteinG: 95,
      days: nutritionWeek(
        [1580, 1640, 1550, 1610, 1720, 2050, 1590],
        [92, 98, 88, 95, 90, 70, 96],
      ),
    },
    recovery: {
      sleepTargetH: 7.5,
      nights: sleepWeek([6.5, 7.0, 6.8, 7.2, 6.4, 7.9, 7.5]),
      quality: 3,
      stress: 4,
      energy: 4,
      soreness: 2,
    },
    measurements: [
      { label: "Weight", start: 68.0, now: 66.2, unit: "kg" },
      { label: "Waist", start: 86.0, now: 83.0, unit: "cm" },
      { label: "Hips", start: 101.0, now: 99.5, unit: "cm" },
      { label: "Chest", start: 92.0, now: 91.0, unit: "cm" },
    ],
    photoWeeks: [0, 2, 3],
    checkIns: [
      {
        id: "priya-3",
        week: 3,
        submitted: "2 h ago",
        rows: [
          { label: "Weight (avg)", last: "66.8", now: "66.2", delta: "−0.6" },
          { label: "Waist", last: "84.0", now: "83.0", delta: "−1.0" },
          { label: "Workouts", last: "4/4", now: "4/4", delta: "—" },
          { label: "Avg kcal", last: "1,640", now: "1,680", delta: "+40" },
          { label: "Avg sleep", last: "6.5 h", now: "7.0 h", delta: "+0.5" },
        ],
        answers: "Energy 4 · Hunger 3 · Stress 4 · Digestion 4",
        note: "Weekend wedding, overate on Saturday",
        reviewed: false,
      },
      {
        id: "priya-2",
        week: 2,
        submitted: "2 Nov",
        rows: [
          { label: "Weight (avg)", last: "67.5", now: "66.8", delta: "−0.7" },
          { label: "Workouts", last: "3/4", now: "4/4", delta: "+1" },
        ],
        answers: "Energy 3 · Hunger 3 · Stress 4 · Digestion 3",
        reviewed: true,
        reply: "Great week. Keep protein at every meal and walk after dinner.",
      },
    ],
    messages: [
      {
        from: "client",
        text: "Is it okay to swap leg press for squats this week?",
        time: "9:12 am",
      },
      {
        from: "coach",
        text: "Yes, keep it light on your back: goblet squats, 3 × 12.",
        time: "9:30 am",
      },
      {
        from: "client",
        text: "Done! Felt good, no back pain.",
        time: "6:45 pm",
      },
    ],
    unread: 1,
    notes:
      "Lower back: avoid heavy spinal loading. Prefers morning sessions. Wedding season till mid-Dec.",
  },
  {
    id: "rahul",
    name: "Rahul Verma",
    status: "active",
    joined: "5 Oct",
    weeksWithYou: 5,
    goal: "Get stronger",
    attention: "Low adherence this week · 2 of 4 workouts",
    line: "Low adherence this week",
    adherence: 48,
    checkInDay: "Saturday",
    answers: [
      ["Goal", "Get stronger"],
      ["Body", "31 · 178 cm · 82.0 kg · male"],
      ["Activity", "On my feet"],
      ["Experience", "2+ years"],
      ["Training", "Gym · 4 × 60 min · evenings"],
      ["Injuries", "Knee (left)"],
      ["Sleep", "6 h · poor · stress 3/5"],
      ["Diet", "Eggetarian · 4 meals"],
    ],
    plan: { training: "Strength · 4 days", meals: "High protein 2,600 kcal" },
    weights: [82.0, 82.2, 82.1, 82.4, 82.3, 82.6, 82.5, 82.7],
    targetKg: 84,
    training: {
      weekDone: 2,
      weekPlanned: 4,
      logs: [
        {
          date: "Sat 8 Nov",
          name: "Lower",
          sets: 0,
          minutes: 0,
          topSet: "Missed",
          missed: true,
        },
        {
          date: "Thu 6 Nov",
          name: "Upper",
          sets: 18,
          minutes: 62,
          topSet: "Bench 85 kg × 5",
        },
        {
          date: "Tue 4 Nov",
          name: "Lower",
          sets: 0,
          minutes: 0,
          topSet: "Missed",
          missed: true,
        },
        {
          date: "Mon 3 Nov",
          name: "Upper",
          sets: 17,
          minutes: 58,
          topSet: "Row 70 kg × 8",
        },
      ],
    },
    nutrition: {
      targetKcal: 2600,
      proteinG: 150,
      days: nutritionWeek(
        [2400, 2550, 2200, 2650, 2100, 2800, 2300],
        [140, 150, 120, 155, 110, 130, 125],
      ),
    },
    recovery: {
      sleepTargetH: 7.5,
      nights: sleepWeek([5.8, 6.2, 5.5, 6.0, 6.4, 7.5, 6.1]),
      quality: 2,
      stress: 3,
      energy: 2,
      soreness: 4,
    },
    measurements: [
      { label: "Weight", start: 82.0, now: 82.7, unit: "kg" },
      { label: "Chest", start: 102.0, now: 103.0, unit: "cm" },
      { label: "Arm", start: 36.0, now: 36.5, unit: "cm" },
    ],
    photoWeeks: [0, 4],
    checkIns: [
      {
        id: "rahul-5",
        week: 5,
        submitted: "5 h ago",
        rows: [
          { label: "Weight (avg)", last: "82.5", now: "82.7", delta: "+0.2" },
          { label: "Workouts", last: "4/4", now: "2/4", delta: "−2" },
          { label: "Avg kcal", last: "2,580", now: "2,430", delta: "−150" },
          { label: "Avg sleep", last: "6.6 h", now: "6.2 h", delta: "−0.4" },
        ],
        answers: "Energy 2 · Hunger 3 · Stress 3 · Digestion 4",
        note: "Knee sore after Tuesday, skipped two leg days",
        reviewed: false,
      },
    ],
    messages: [
      { from: "client", text: "Knee is sore again after squats.", time: "Tue" },
      {
        from: "coach",
        text: "Skip squats for now. Can you send a short note on where it hurts?",
        time: "Tue",
      },
    ],
    unread: 0,
    notes: "Left knee: check pain before lower days. Shift work some weeks.",
  },
  {
    id: "ananya",
    name: "Ananya Iyer",
    status: "active",
    joined: "28 Sep",
    weeksWithYou: 6,
    goal: "Build muscle",
    attention: "Check-in to review · submitted yesterday",
    line: "On track",
    adherence: 88,
    checkInDay: "Monday",
    answers: [
      ["Goal", "Build muscle"],
      ["Body", "24 · 158 cm · 52.0 kg · female"],
      ["Training", "Home · dumbbells · 3 × 40 min"],
      ["Diet", "Vegetarian · 3 meals"],
    ],
    plan: {
      training: "Beginner full body · 3 days",
      meals: "Vegetarian 1,900 kcal",
    },
    weights: [52.0, 52.1, 52.3, 52.2, 52.5, 52.6, 52.8, 52.9],
    targetKg: 55,
    training: {
      weekDone: 3,
      weekPlanned: 3,
      logs: [
        {
          date: "Fri 7 Nov",
          name: "Full body C",
          sets: 14,
          minutes: 41,
          topSet: "DB RDL 12 kg × 12",
        },
        {
          date: "Wed 5 Nov",
          name: "Full body B",
          sets: 13,
          minutes: 38,
          topSet: "Split squat 8 kg × 10",
        },
        {
          date: "Mon 3 Nov",
          name: "Full body A",
          sets: 14,
          minutes: 40,
          topSet: "DB row 10 kg × 12",
        },
      ],
    },
    nutrition: {
      targetKcal: 1900,
      proteinG: 85,
      days: nutritionWeek(
        [1850, 1920, 1880, 1950, 1800, 2000, 1900],
        [80, 86, 82, 88, 78, 84, 85],
      ),
    },
    recovery: {
      sleepTargetH: 8,
      nights: sleepWeek([7.8, 8.1, 7.5, 7.9, 8.0, 8.4, 7.7]),
      quality: 4,
      stress: 2,
      energy: 4,
      soreness: 3,
    },
    measurements: [
      { label: "Weight", start: 52.0, now: 52.9, unit: "kg" },
      { label: "Arm", start: 25.0, now: 25.8, unit: "cm" },
      { label: "Hips", start: 92.0, now: 93.0, unit: "cm" },
    ],
    photoWeeks: [0, 4],
    checkIns: [
      {
        id: "ananya-6",
        week: 6,
        submitted: "Yesterday",
        rows: [
          { label: "Weight (avg)", last: "52.8", now: "52.9", delta: "+0.1" },
          { label: "Workouts", last: "3/3", now: "3/3", delta: "—" },
          { label: "Avg kcal", last: "1,880", now: "1,900", delta: "+20" },
        ],
        answers: "Energy 4 · Hunger 4 · Stress 2 · Digestion 4",
        reviewed: false,
      },
    ],
    messages: [
      {
        from: "coach",
        text: "Add one more set to rows this week.",
        time: "Mon",
      },
    ],
    unread: 0,
    notes: "Trains at home, 8 and 12 kg dumbbells only.",
  },
  {
    id: "karan",
    name: "Karan Singh",
    status: "active",
    joined: "14 Sep",
    weeksWithYou: 8,
    goal: "Lose fat · to 78 kg",
    attention: "Check-in overdue · due Sunday",
    line: "On track",
    adherence: 96,
    checkInDay: "Sunday",
    answers: [
      ["Goal", "Lose fat · to 78 kg"],
      ["Body", "35 · 175 cm · 88.0 kg · male"],
      ["Training", "Gym · 5 × 60 min · mornings"],
      ["Diet", "Non-veg · 3 meals"],
    ],
    plan: { training: "Muscle gain · 5 days", meals: "Non-veg 2,100 kcal" },
    weights: [88.0, 87.1, 86.4, 85.9, 85.0, 84.6, 84.1, 83.5],
    targetKg: 78,
    training: {
      weekDone: 5,
      weekPlanned: 5,
      logs: [
        {
          date: "Sat 8 Nov",
          name: "Legs",
          sets: 18,
          minutes: 63,
          topSet: "Squat 100 kg × 6",
        },
        {
          date: "Fri 7 Nov",
          name: "Pull",
          sets: 16,
          minutes: 55,
          topSet: "Deadlift 140 kg × 5",
        },
        {
          date: "Thu 6 Nov",
          name: "Push",
          sets: 17,
          minutes: 58,
          topSet: "Bench 80 kg × 6",
        },
      ],
    },
    nutrition: {
      targetKcal: 2100,
      proteinG: 160,
      days: nutritionWeek(
        [2080, 2120, 2050, 2100, 2150, 2300, 2000],
        [158, 162, 150, 165, 160, 140, 155],
      ),
    },
    recovery: {
      sleepTargetH: 7.5,
      nights: sleepWeek([7.2, 7.5, 7.4, 7.0, 7.6, 8.0, 7.3]),
      quality: 4,
      stress: 2,
      energy: 4,
      soreness: 3,
    },
    measurements: [
      { label: "Weight", start: 88.0, now: 83.5, unit: "kg" },
      { label: "Waist", start: 98.0, now: 92.0, unit: "cm" },
    ],
    photoWeeks: [0, 4, 8],
    checkIns: [
      {
        id: "karan-7",
        week: 7,
        submitted: "2 Nov",
        rows: [
          { label: "Weight (avg)", last: "84.6", now: "84.1", delta: "−0.5" },
        ],
        answers: "Energy 4 · Hunger 3 · Stress 2 · Digestion 4",
        reviewed: true,
        reply: "Solid. Keep steps at 9k.",
      },
    ],
    messages: [
      {
        from: "client",
        text: "Will send check-in tonight, travelling.",
        time: "Sun",
      },
    ],
    unread: 1,
    notes: "",
  },
  {
    id: "venkata",
    name: "Venkatalakshmi S.",
    status: "leaving",
    joined: "10 Aug",
    weeksWithYou: 13,
    goal: "Get fitter",
    line: "Leaving 30 Nov",
    adherence: 81,
    checkInDay: "Friday",
    answers: [
      ["Goal", "Get fitter"],
      ["Training", "Home · bodyweight · 3 × 30 min"],
    ],
    plan: {
      training: "Beginner full body · 3 days",
      meals: "Vegetarian 1,700 kcal",
    },
    weights: [71.0, 70.6, 70.2, 70.0, 69.6, 69.5, 69.2, 69.0],
    targetKg: 66,
    training: {
      weekDone: 2,
      weekPlanned: 3,
      logs: [
        {
          date: "Thu 6 Nov",
          name: "Full body B",
          sets: 12,
          minutes: 31,
          topSet: "Push-ups × 12",
        },
        {
          date: "Mon 3 Nov",
          name: "Full body A",
          sets: 12,
          minutes: 30,
          topSet: "Squats × 20",
        },
      ],
    },
    nutrition: {
      targetKcal: 1700,
      proteinG: 80,
      days: nutritionWeek(
        [1700, 1750, 1680, 1800, 1650, 1900, 1720],
        [75, 80, 72, 82, 70, 68, 78],
      ),
    },
    recovery: {
      sleepTargetH: 7.5,
      nights: sleepWeek([7.0, 7.2, 6.9, 7.4, 7.1, 7.8, 7.3]),
      quality: 3,
      stress: 3,
      energy: 3,
      soreness: 2,
    },
    measurements: [{ label: "Weight", start: 71.0, now: 69.0, unit: "kg" }],
    photoWeeks: [],
    checkIns: [],
    messages: [
      {
        from: "client",
        text: "Thank you for everything, moving cities end of month.",
        time: "Fri",
      },
    ],
    unread: 0,
    notes: "Moving to Pune. Offer online coaching.",
  },
  {
    id: "arjun",
    name: "Arjun Mehta",
    status: "paused",
    joined: "1 Sep",
    weeksWithYou: 9,
    goal: "Build muscle",
    line: "Paused until 1 Dec",
    adherence: null,
    checkInDay: "Sunday",
    answers: [["Goal", "Build muscle"]],
    plan: { training: "Muscle gain · 5 days", meals: "Non-veg 2,800 kcal" },
    weights: [74.0, 74.5, 74.9, 75.2, 75.6, 75.6, 75.6, 75.6],
    targetKg: 78,
    training: { weekDone: 0, weekPlanned: 0, logs: [] },
    nutrition: { targetKcal: 2800, proteinG: 150, days: [] },
    recovery: {
      sleepTargetH: 8,
      nights: [],
      quality: 3,
      stress: 3,
      energy: 3,
      soreness: 3,
    },
    measurements: [{ label: "Weight", start: 74.0, now: 75.6, unit: "kg" }],
    photoWeeks: [0, 4],
    checkIns: [],
    messages: [],
    unread: 0,
    notes: "Exams till end of November.",
  },
  {
    id: "meera",
    name: "Meera Nair",
    status: "active",
    isNew: true,
    joined: "10 min ago",
    goal: "Lose fat · to 60 kg",
    line: "Joined 10 min ago",
    checkInDay: "Sunday",
    answers: [
      ["Goal", "Lose fat · to 60 kg"],
      ["Body", "29 · 160 cm · 66.0 kg · female"],
      ["Activity", "Mostly sitting"],
      ["Experience", "New to training"],
      ["Training", "Gym · 3 × 45 min · evenings"],
      ["Injuries", "None"],
      ["Sleep", "7 h · good · stress 3/5"],
      ["Diet", "Vegetarian · 3 meals"],
    ],
    weights: [66.0],
    targetKg: 60,
    nutrition: { targetKcal: 0, proteinG: 0, days: [] },
    recovery: {
      sleepTargetH: 7.5,
      nights: [],
      quality: 4,
      stress: 3,
      energy: 3,
      soreness: 2,
    },
    messages: [],
    unread: 0,
    ...NEW_CLIENT_STATS,
  },
  {
    id: "rohan",
    name: "Rohan Das",
    status: "active",
    isNew: true,
    joined: "yesterday",
    goal: "Get stronger",
    line: "Joined yesterday",
    checkInDay: "Saturday",
    answers: [
      ["Goal", "Get stronger"],
      ["Body", "27 · 172 cm · 70.0 kg · male"],
      ["Activity", "On my feet"],
      ["Experience", "6 months – 2 years"],
      ["Training", "Gym · 4 × 60 min · mornings"],
      ["Injuries", "Shoulder (right)"],
      ["Sleep", "6.5 h · okay · stress 2/5"],
      ["Diet", "Non-veg · 4 meals"],
    ],
    weights: [70.0],
    targetKg: 72,
    nutrition: { targetKcal: 0, proteinG: 0, days: [] },
    recovery: {
      sleepTargetH: 7.5,
      nights: [],
      quality: 3,
      stress: 2,
      energy: 4,
      soreness: 2,
    },
    messages: [],
    unread: 0,
    ...NEW_CLIENT_STATS,
  },
];

export const sampleTemplates: Template[] = [
  {
    id: "t1",
    kind: "training",
    name: "Fat loss · 4 days",
    detail: "Upper / lower",
    clients: 9,
  },
  {
    id: "t2",
    kind: "training",
    name: "Muscle gain · 5 days",
    detail: "Push / pull / legs",
    clients: 7,
  },
  {
    id: "t3",
    kind: "training",
    name: "Beginner full body · 3 days",
    detail: "Full body A / B / C",
    clients: 12,
  },
  {
    id: "t4",
    kind: "training",
    name: "Strength · 4 days",
    detail: "Squat, bench, deadlift focus",
    clients: 2,
  },
  {
    id: "m1",
    kind: "meals",
    name: "Vegetarian 1,600 kcal",
    detail: "3 meals · 95 g protein",
    clients: 6,
  },
  {
    id: "m2",
    kind: "meals",
    name: "Non-veg 2,100 kcal",
    detail: "3 meals + snack · 160 g protein",
    clients: 4,
  },
  {
    id: "m3",
    kind: "meals",
    name: "High protein 2,600 kcal",
    detail: "4 meals · 150 g protein",
    clients: 3,
  },
];

export const sampleCoach = {
  name: "Coach Anjali",
  link: "arcwell.app/c/anjali-kapoor",
  clientLimit: 40,
  /** Steps finished in coach onboarding. Templates and the first client are checked live (CO-13). */
  setup: [
    { label: "Create your profile", done: true },
    { label: "Accept coach terms", done: true },
    { label: "Add your services", done: true },
  ],
};
