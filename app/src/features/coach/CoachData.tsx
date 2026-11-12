// Holds the sample data in memory so both sides of the app feel real while there is no backend.
// It sits at the root of the app, standing in for the server: what the coach plans here is what the
// coached athlete sees after joining (D56), and what the athlete logs shows up on the coach's side.
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ClientStatus } from "@/components/primitives";
import type { Food, FoodLog } from "@/features/athlete/foods";
import {
  type DayActivity,
  type DeviceBrand,
  emptyRecovery,
  type RecoveryStore,
  type WellnessLog,
} from "@/features/athlete/recovery";
import {
  type Exercise,
  migrateNames,
  registerCustomExercises,
} from "@/features/athlete/library";
import type { ActiveWorkout, Session } from "@/features/athlete/training";

import { buildCheckIn, type CheckInForm } from "./checkins";
import { type Enhanced, emptyEnhanced, sampleEnhanced } from "./enhanced";
import {
  cloneItems,
  sampleStacks,
  type Stack,
  type Supplement,
  supId,
} from "./supplements";
import {
  type CoachProfile,
  type CoachSettings,
  defaultCoachProfile,
  defaultCoachSettings,
} from "./coachProfile";
import {
  type ClientAccount,
  crmId,
  type Lead,
  type LeadEventKind,
  sampleLeads,
} from "./crm";
import {
  cloneNutrition,
  cloneProgram,
  exampleDay,
  fillTemplate,
  type NutritionPlan,
  programFromTemplate,
  type RecoveryProtocol,
  type TrainingDay,
  type TrainingProgram,
  uid,
} from "./plans";
import {
  type Client,
  sampleClients,
  sampleTemplates,
  type Template,
} from "./sampleData";

export type AthleteTier = "coached" | "pro" | "free";

export type NewClient = {
  name: string;
  phone: string;
  goal: string;
  sex: "female" | "male" | "unsaid";
  age: number;
  heightCm: number;
  weightKg: number;
  targetKg: number;
  diet: string;
  injuries: string;
  notes: string;
};

type CoachData = {
  clients: Client[];
  templates: Template[];
  leads: Lead[];
  /** CRM (D63): add a lead; returns its id. */
  addLead: (
    l: Omit<Lead, "id" | "createdAt" | "events" | "stage"> & { note?: string },
  ) => string;
  /** Change a lead's fields; stage changes and follow-ups are written to its timeline. */
  updateLead: (id: string, patch: Partial<Lead>, log?: string) => void;
  logLead: (id: string, kind: LeadEventKind, text: string) => void;
  deleteLead: (id: string) => void;
  saveAccount: (clientId: string, a: ClientAccount) => void;
  /** The coach's own profile and settings (D65). */
  coach: CoachProfile;
  saveCoach: (p: CoachProfile) => void;
  settings: CoachSettings;
  saveSettings: (s: CoachSettings) => void;
  /** Supplements (D64): a client's own list, and reusable stacks in Plans. */
  setSupplements: (clientId: string, items: Supplement[]) => void;
  stacks: Stack[];
  saveStack: (s: Omit<Stack, "id"> & { id?: string }) => string;
  deleteStack: (id: string) => void;
  assignStack: (stackId: string, clientIds: string[]) => void;
  /** Enhanced athletes (D64): competitive flag, consent request and the record itself. */
  setCompetitive: (clientId: string, on: boolean) => void;
  requestEnhanced: (clientId: string) => void;
  answerEnhanced: (clientId: string, yes: boolean) => void;
  editEnhanced: (clientId: string, fn: (e: Enhanced) => Enhanced) => void;
  coachName: string;
  client: (id: string) => Client | undefined;
  /** Adds a client (D56); with `leadId`, the lead is marked joined and linked. */
  addClient: (c: NewClient, leadId?: string) => string;
  assignPlan: (id: string, training: string, meals: string) => void;
  /** Adds or updates a template (K-06); returns its id. Clients already on it keep their copy. */
  saveTemplate: (
    t: Omit<Template, "id" | "detail" | "clients"> & { id?: string },
  ) => string;
  deleteTemplate: (id: string) => void;
  /** Copies a template under a new name; returns the copy's id. */
  duplicateTemplate: (id: string) => string;
  /** Gives each client their own copy of the template, replacing their current program or meal plan. */
  assignTemplate: (id: string, clientIds: string[]) => void;
  saveProgram: (id: string, p: TrainingProgram) => void;
  saveNutrition: (id: string, n: NutritionPlan) => void;
  saveProtocol: (id: string, r: RecoveryProtocol) => void;
  createInvite: (id: string) => { token: string; code: string };
  /** Finds an unclaimed personal invite by its token or typed code. */
  findInvite: (codeOrToken: string) => Client | undefined;
  claimInvite: (id: string) => void;
  /** The coached athlete using the app after joining (sample: one device plays both roles). */
  meId: string | null;
  /** True once saved sample data has been read back from the phone. */
  hydrated: boolean;
  /** Sample build only: forget everything on this phone and start again. */
  resetSample: () => void;
  /** Who is using the athlete side: a coached client, or a self-guided athlete on Pro or Free (D57). */
  meTier: AthleteTier;
  /** A self-guided athlete's own record, built from their onboarding answers. */
  self: Client | null;
  startSelf: (c: Client, tier: "pro" | "free") => void;
  /** The workout in progress on this phone (F4-02); kept while moving between tabs (F4-09). */
  active: ActiveWorkout | null;
  setActive: (
    next:
      | ActiveWorkout
      | null
      | ((w: ActiveWorkout | null) => ActiveWorkout | null),
  ) => void;
  /** Finished workouts per athlete, newest first (F4-13). */
  sessions: (clientId: string) => Session[];
  finishWorkout: (clientId: string, s: Session) => void;
  rateSession: (
    clientId: string,
    sessionId: string,
    effort: number,
    note: string,
  ) => void;
  /** Fix a logged workout, or remove it (F4-13). */
  updateSession: (clientId: string, s: Session) => void;
  deleteSession: (clientId: string, sessionId: string) => void;
  /** Start the current program again from week 1. */
  restartProgram: (clientId: string) => void;
  /** Exercises made by the athlete or coach, shown with the library (F4-08). */
  customExercises: Exercise[];
  addCustomExercise: (e: Exercise) => void;
  /** The athlete's own routines (F4-01): add or replace one, or remove it. */
  saveRoutine: (clientId: string, r: TrainingDay) => void;
  deleteRoutine: (clientId: string, routineId: string) => void;
  /** Food logged per athlete (F5-01); the coach reads the same logs. */
  foodLogs: (clientId: string) => FoodLog[];
  addFoodLogs: (clientId: string, logs: FoodLog[]) => void;
  updateFoodLog: (clientId: string, log: FoodLog) => void;
  deleteFoodLog: (clientId: string, logId: string) => void;
  /** Foods the athlete made (F5-08): private to them and visible to their coach in logs. */
  myFoods: Food[];
  addMyFood: (f: Food) => void;
  /** Free athletes can dismiss the Arcwell Plus card on Nutrition (F5-02). */
  hideUpgrade: boolean;
  setHideUpgrade: (v: boolean) => void;
  /** Recovery per athlete (D60): device link, morning check-ins, activities, protocols done. */
  recoveryOf: (clientId: string) => RecoveryStore;
  saveWellness: (clientId: string, log: WellnessLog) => void;
  connectDevice: (clientId: string, brand: DeviceBrand) => void;
  disconnectDevice: (clientId: string) => void;
  addActivity: (clientId: string, a: DayActivity) => void;
  removeActivity: (clientId: string, id: string) => void;
  toggleProtocol: (clientId: string, date: string, protocolId: string) => void;
  /** Someone joining through the coach's general link (not a personal invite) is onboarding. */
  joiningCoach: boolean;
  setJoiningCoach: (v: boolean) => void;
  /** General-link join: the athlete becomes the coach's new client, waiting for a plan (AO-21b). */
  joinAsNewClient: (c: Client) => void;
  logWorkout: (
    id: string,
    dayName: string,
    sets: number,
    topSet: string,
    minutes: number,
  ) => void;
  logSleep: (id: string, hours: number) => void;
  logWeight: (id: string, kg: number) => void;
  reply: (clientId: string, checkInId: string, text: string) => void;
  /** The athlete sends their weekly check-in (F6): it lands in the coach's inbox. */
  submitCheckIn: (clientId: string, form: CheckInForm) => void;
  send: (clientId: string, text: string, image?: string) => void;
  /** The client writes to their coach (F7). */
  sendFromClient: (clientId: string, text: string, image?: string) => void;
  /** The client opened the chat. */
  markReadByClient: (clientId: string) => void;
  markRead: (clientId: string) => void;
  setStatus: (clientId: string, status: ClientStatus) => void;
  setNotes: (clientId: string, notes: string) => void;
  /** The day of the week this client's check-in is due (sitemap §5 Check-ins). */
  setCheckInDay: (clientId: string, day: string) => void;
  /** Remove a client who was added but never joined. */
  removeClient: (clientId: string) => void;
  remind: (clientId: string) => void;
  reminded: string[];
};

const Ctx = createContext<CoachData | null>(null);

const STORE_KEY = "arcwell.sample.v1";
type Saved = {
  clients: Client[];
  meId: string | null;
  meTier: AthleteTier;
  self: Client | null;
  active: ActiveWorkout | null;
  history: Record<string, Session[]>;
  custom?: Exercise[];
  foodLogs?: Record<string, FoodLog[]>;
  myFoods?: Food[];
  hideUpgrade?: boolean;
  recovery?: Record<string, RecoveryStore>;
  templates?: Template[];
  leads?: Lead[];
  coach?: CoachProfile;
  settings?: CoachSettings;
  stacks?: Stack[];
};

/** Sample extras added after the first release of the sample data (D64). */
function withExtras(c: Client): Client {
  if (c.id === "karan" && c.competitive === undefined)
    return { ...c, competitive: true, enhanced: sampleEnhanced() };
  if (c.id === "priya" && c.supplements === undefined)
    return { ...c, supplements: cloneItems(sampleStacks()[1].items) };
  return c;
}

/** Saved self plans from before exact foods: rebuild the example day with foods (sample data only). */
function upgradeSelfPlan(c: Client | null): Client | null {
  const n = c?.nutritionPlan;
  if (!c || !n || n.meals.some((m) => m.items?.length)) return c;
  const diet = c.answers.find(([k]) => k === "Diet")?.[1] ?? "Vegetarian";
  const names = new Set(n.meals.map((m) => m.name));
  return {
    ...c,
    nutritionPlan: {
      ...n,
      meals: exampleDay(diet).filter((m) => names.has(m.name)),
    },
  };
}

const nowTime = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
const today = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

// Sample only: real invite tokens are issued, stored and expired by an Edge Function (D56).
const TOKEN_CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const token = () =>
  Array.from(
    { length: 8 },
    () => TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)],
  ).join("");
const code = (coach: string) =>
  `${coach
    .replace(/^Coach\s+/, "")
    .slice(0, 3)
    .toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

export function CoachDataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState(() => sampleClients.map(withExtras));
  const [stacks, setStacks] = useState<Stack[]>(sampleStacks);
  const [templates, setTemplates] = useState<Template[]>(() =>
    sampleTemplates.map(fillTemplate),
  );
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [coach, setCoach] = useState<CoachProfile>(defaultCoachProfile);
  const [settings, setSettings] = useState<CoachSettings>(defaultCoachSettings);
  const [reminded, setReminded] = useState<string[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [meTier, setMeTier] = useState<AthleteTier>("coached");
  const [self, setSelf] = useState<Client | null>(null);
  const [active, setActive] = useState<ActiveWorkout | null>(null);
  const [history, setHistory] = useState<Record<string, Session[]>>({});
  const [joiningCoach, setJoiningCoach] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [customExercises, setCustom] = useState<Exercise[]>([]);
  const [foodLogs, setFoodLogs] = useState<Record<string, FoodLog[]>>({});
  const [myFoods, setMyFoods] = useState<Food[]>([]);
  const [hideUpgrade, setHideUpgrade] = useState(false);
  const [recovery, setRecovery] = useState<Record<string, RecoveryStore>>({});
  const editRecovery = (id: string, fn: (r: RecoveryStore) => RecoveryStore) =>
    setRecovery((all) => ({ ...all, [id]: fn(all[id] ?? emptyRecovery()) }));
  // Plain helpers (set labels, workout set-up) look custom exercises up by name.
  registerCustomExercises(customExercises);

  // F4-09: the workout in progress, history and the athlete's plan are saved on the phone after every
  // change, so closing the app mid-workout loses nothing. Sample build: plain AsyncStorage; the real
  // build syncs to Supabase and keeps the offline copy in encrypted storage.
  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(migrateNames(raw)) as Partial<Saved>;
        if (s.clients) setClients(s.clients.map(withExtras));
        if (s.stacks) setStacks(s.stacks);
        if (s.meId !== undefined) setMeId(s.meId);
        if (s.meTier) setMeTier(s.meTier);
        if (s.self !== undefined) setSelf(upgradeSelfPlan(s.self));
        if (s.active !== undefined) setActive(s.active);
        if (s.history) setHistory(s.history);
        if (s.custom) setCustom(s.custom);
        if (s.foodLogs) setFoodLogs(s.foodLogs);
        if (s.myFoods) setMyFoods(s.myFoods);
        if (s.hideUpgrade) setHideUpgrade(true);
        if (s.recovery) setRecovery(s.recovery);
        if (s.templates) setTemplates(s.templates.map(fillTemplate));
        if (s.leads) setLeads(s.leads);
        if (s.coach) setCoach(s.coach);
        if (s.settings) setSettings(s.settings);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    const saved: Saved = {
      clients,
      meId,
      meTier,
      self,
      active,
      history,
      custom: customExercises,
      foodLogs,
      myFoods,
      hideUpgrade,
      recovery,
      templates,
      leads,
      coach,
      settings,
      stacks,
    };
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(saved)).catch(() => {});
  }, [
    hydrated,
    clients,
    meId,
    meTier,
    self,
    active,
    history,
    customExercises,
    foodLogs,
    myFoods,
    hideUpgrade,
    recovery,
    templates,
    leads,
    coach,
    settings,
    stacks,
  ]);
  const update = (id: string, patch: (c: Client) => Partial<Client>) => {
    if (self && id === self.id) {
      setSelf((s) => (s ? { ...s, ...patch(s) } : s));
      return;
    }
    setClients((all) =>
      all.map((c) => (c.id === id ? { ...c, ...patch(c) } : c)),
    );
  };
  const coachName = coach.name;
  const bumpTemplates = (ids: (string | undefined)[], by: number) =>
    setTemplates((all) =>
      all.map((x) =>
        ids.includes(x.id) ? { ...x, clients: x.clients + by } : x,
      ),
    );

  const value: CoachData = {
    clients,
    templates,
    leads,
    addLead: (l) => {
      const id = crmId("l");
      const now = new Date().toISOString();
      const { note, ...rest } = l;
      setLeads((all) => [
        {
          ...rest,
          id,
          stage: "new",
          createdAt: now,
          events: [
            {
              id: crmId("v"),
              at: now,
              kind: "created",
              text: note?.trim() || "Added",
            },
          ],
        },
        ...all,
      ]);
      return id;
    },
    updateLead: (id, patch, log) =>
      setLeads((all) =>
        all.map((l) =>
          l.id !== id
            ? l
            : {
                ...l,
                ...patch,
                events: log
                  ? [
                      ...l.events,
                      {
                        id: crmId("v"),
                        at: new Date().toISOString(),
                        kind:
                          patch.followUp !== undefined && !patch.stage
                            ? "follow_up"
                            : "stage",
                        text: log,
                      },
                    ]
                  : l.events,
              },
        ),
      ),
    logLead: (id, kind, text) =>
      setLeads((all) =>
        all.map((l) =>
          l.id !== id
            ? l
            : {
                ...l,
                // A logged call moves a new or contacted lead along.
                stage:
                  kind === "call" &&
                  (l.stage === "new" ||
                    l.stage === "contacted" ||
                    l.stage === "call_booked")
                    ? "call_done"
                    : kind === "message" && l.stage === "new"
                      ? "contacted"
                      : l.stage,
                events: [
                  ...l.events,
                  { id: crmId("v"), at: new Date().toISOString(), kind, text },
                ],
              },
        ),
      ),
    deleteLead: (id) => setLeads((all) => all.filter((l) => l.id !== id)),
    saveAccount: (clientId, a) => update(clientId, () => ({ account: a })),
    coach,
    saveCoach: setCoach,
    settings,
    saveSettings: setSettings,
    setSupplements: (clientId, items) =>
      update(clientId, () => ({ supplements: items })),
    stacks,
    saveStack: (s) => {
      const id = s.id ?? supId("st");
      setStacks((all) =>
        all.some((x) => x.id === id)
          ? all.map((x) => (x.id === id ? { ...s, id } : x))
          : [{ ...s, id }, ...all],
      );
      return id;
    },
    deleteStack: (id) => setStacks((all) => all.filter((x) => x.id !== id)),
    assignStack: (stackId, clientIds) => {
      const st = stacks.find((x) => x.id === stackId);
      if (!st) return;
      for (const cid of clientIds)
        update(cid, () => ({ supplements: cloneItems(st.items) }));
    },
    setCompetitive: (clientId, on) =>
      update(clientId, () => ({ competitive: on })),
    requestEnhanced: (clientId) =>
      update(clientId, (c) => ({
        enhanced: {
          ...(c.enhanced ?? emptyEnhanced()),
          requestedAt: new Date().toISOString(),
          declinedAt: undefined,
        },
      })),
    answerEnhanced: (clientId, yes) =>
      update(clientId, (c) => ({
        enhanced: {
          ...(c.enhanced ?? emptyEnhanced()),
          consentAt: yes ? new Date().toISOString() : undefined,
          declinedAt: yes ? undefined : new Date().toISOString(),
        },
      })),
    editEnhanced: (clientId, fn) =>
      update(clientId, (c) => ({
        enhanced: fn(c.enhanced ?? emptyEnhanced()),
      })),
    coachName,
    reminded,
    meId,
    hydrated,
    resetSample: () => {
      setClients(sampleClients.map(withExtras));
      setStacks(sampleStacks());
      setMeId(null);
      setMeTier("coached");
      setSelf(null);
      setActive(null);
      setHistory({});
      setCustom([]);
      setFoodLogs({});
      setMyFoods([]);
      setHideUpgrade(false);
      setRecovery({});
      setTemplates(sampleTemplates.map(fillTemplate));
      setLeads(sampleLeads());
      setCoach(defaultCoachProfile());
      setSettings(defaultCoachSettings());
      AsyncStorage.removeItem(STORE_KEY).catch(() => {});
    },
    meTier,
    self,
    startSelf: (c, tier) => {
      setSelf(c);
      setMeId(c.id);
      setMeTier(tier);
    },
    client: (id) =>
      self && id === self.id ? self : clients.find((c) => c.id === id),
    active,
    setActive,
    sessions: (id) => history[id] ?? [],
    foodLogs: (id) => foodLogs[id] ?? [],
    addFoodLogs: (id, logs) =>
      setFoodLogs((all) => ({ ...all, [id]: [...(all[id] ?? []), ...logs] })),
    updateFoodLog: (id, log) =>
      setFoodLogs((all) => ({
        ...all,
        [id]: (all[id] ?? []).map((l) => (l.id === log.id ? log : l)),
      })),
    deleteFoodLog: (id, logId) =>
      setFoodLogs((all) => ({
        ...all,
        [id]: (all[id] ?? []).filter((l) => l.id !== logId),
      })),
    myFoods,
    addMyFood: (f) =>
      setMyFoods((all) => [...all.filter((x) => x.id !== f.id), f]),
    hideUpgrade,
    setHideUpgrade,
    recoveryOf: (id) => recovery[id] ?? emptyRecovery(),
    saveWellness: (id, log) => {
      editRecovery(id, (r) => ({
        ...r,
        logs: [...r.logs.filter((l) => l.date !== log.date), log],
      }));
      // The coach's client profile reads nightly sleep from here too.
      update(id, (c) => ({
        recovery: {
          ...c.recovery,
          nights: [
            ...c.recovery.nights,
            { day: today().slice(0, 3), hours: log.sleepH },
          ].slice(-7),
          quality: log.quality,
          stress: log.stress,
          energy: log.energy,
          soreness: log.soreness,
        },
      }));
    },
    connectDevice: (id, brand) =>
      editRecovery(id, (r) => ({
        ...r,
        device: { brand, connectedAt: new Date().toISOString() },
      })),
    disconnectDevice: (id) =>
      editRecovery(id, (r) => ({ ...r, device: undefined })),
    addActivity: (id, a) =>
      editRecovery(id, (r) => ({ ...r, activities: [...r.activities, a] })),
    removeActivity: (id, aid) =>
      editRecovery(id, (r) => ({
        ...r,
        activities: r.activities.filter((a) => a.id !== aid),
      })),
    toggleProtocol: (id, date, pid) =>
      editRecovery(id, (r) => {
        const k = `${date}:${pid}`;
        return {
          ...r,
          done: r.done.includes(k)
            ? r.done.filter((x) => x !== k)
            : [...r.done, k],
        };
      }),
    customExercises,
    addCustomExercise: (e) =>
      setCustom((all) => [
        ...all.filter((x) => x.name.toLowerCase() !== e.name.toLowerCase()),
        { ...e, custom: true },
      ]),
    saveRoutine: (id, r) =>
      update(id, (c) => {
        const list = c.routines ?? [];
        return {
          routines: list.some((x) => x.id === r.id)
            ? list.map((x) => (x.id === r.id ? r : x))
            : [...list, r],
        };
      }),
    deleteRoutine: (id, routineId) =>
      update(id, (c) => ({
        routines: (c.routines ?? []).filter((x) => x.id !== routineId),
      })),
    finishWorkout: (id, s) => {
      setHistory((h) => ({ ...h, [id]: [s, ...(h[id] ?? [])] }));
      const top =
        s.bests[0]?.text ??
        `${s.setsDone} sets · ${s.volume.toLocaleString("en-IN")} kg`;
      update(id, (c) => ({
        training: {
          ...c.training,
          weekDone: c.training.weekDone + 1,
          logs: [
            {
              date: today(),
              name: s.name,
              sets: s.setsDone,
              minutes: s.minutes,
              topSet: top,
            },
            ...c.training.logs,
          ],
        },
      }));
    },
    rateSession: (id, sessionId, effort, note) =>
      setHistory((h) => ({
        ...h,
        [id]: (h[id] ?? []).map((s) =>
          s.id === sessionId ? { ...s, effort, note } : s,
        ),
      })),
    updateSession: (id, s) =>
      setHistory((h) => ({
        ...h,
        [id]: (h[id] ?? []).map((x) => (x.id === s.id ? s : x)),
      })),
    deleteSession: (id, sessionId) => {
      const gone = (history[id] ?? []).find((s) => s.id === sessionId);
      setHistory((h) => ({
        ...h,
        [id]: (h[id] ?? []).filter((s) => s.id !== sessionId),
      }));
      if (gone)
        update(id, (c) => {
          const day = new Date(gone.at).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const i = c.training.logs.findIndex(
            (l) => l.date === day && l.name === gone.name,
          );
          return i < 0
            ? {}
            : {
                training: {
                  ...c.training,
                  weekDone: Math.max(0, c.training.weekDone - 1),
                  logs: c.training.logs.filter((_, k) => k !== i),
                },
              };
        });
    },
    restartProgram: (id) =>
      update(id, () => ({ programStart: new Date().toISOString() })),
    joiningCoach,
    setJoiningCoach,
    joinAsNewClient: (c) => {
      setClients((all) => [c, ...all.filter((x) => x.id !== c.id)]);
      setMeId(c.id);
      setMeTier("coached");
      setJoiningCoach(false);
    },

    addClient: (n, leadId) => {
      const id = `c${Date.now().toString(36)}`;
      const goal =
        n.goal.startsWith("Lose fat") || n.goal.startsWith("Build muscle")
          ? `${n.goal} · to ${n.targetKg} kg`
          : n.goal;
      const client: Client = {
        id,
        name: n.name.trim(),
        phone: n.phone.trim(),
        status: "active",
        pending: true,
        joined: "not yet",
        weeksWithYou: 0,
        goal,
        line: "Invite not sent",
        adherence: null,
        checkInDay: "Sunday",
        answers: [
          ["Goal", goal],
          [
            "Body",
            `${n.age} · ${n.heightCm} cm · ${n.weightKg.toFixed(1)} kg${n.sex === "unsaid" ? "" : ` · ${n.sex}`}`,
          ],
          ["Injuries", n.injuries.trim() || "None"],
          ["Diet", n.diet],
        ],
        basics: {
          sex: n.sex,
          age: n.age,
          heightCm: n.heightCm,
          weightKg: n.weightKg,
          diet: n.diet,
          injuries: n.injuries.trim(),
        },
        weights: [n.weightKg],
        targetKg: n.targetKg,
        training: { weekDone: 0, weekPlanned: 0, logs: [] },
        nutrition: { targetKcal: 0, proteinG: 0, days: [] },
        recovery: {
          sleepTargetH: 7.5,
          nights: [],
          quality: 3,
          stress: 3,
          energy: 3,
          soreness: 3,
        },
        measurements: [
          { label: "Weight", start: n.weightKg, now: n.weightKg, unit: "kg" },
        ],
        photoWeeks: [],
        checkIns: [],
        messages: [],
        unread: 0,
        notes: n.notes.trim(),
      };
      const lead = leadId ? leads.find((l) => l.id === leadId) : undefined;
      if (lead) {
        client.source = lead.source;
        setLeads((all) =>
          all.map((l) =>
            l.id !== leadId
              ? l
              : {
                  ...l,
                  stage: "joined",
                  clientId: id,
                  events: [
                    ...l.events,
                    {
                      id: crmId("v"),
                      at: new Date().toISOString(),
                      kind: "stage",
                      text: "Joined · added as a client",
                    },
                  ],
                },
          ),
        );
      }
      setClients((all) => [client, ...all]);
      return id;
    },

    assignPlan: (id, training, meals) => {
      const t = templates.find(
        (x) => x.kind === "training" && x.name === training,
      );
      const m = templates.find((x) => x.kind === "meals" && x.name === meals);
      update(id, (c) => ({
        isNew: false,
        plan: { training, meals },
        program: t?.program
          ? { ...cloneProgram(t.program), name: t.name }
          : programFromTemplate(training),
        programStart: new Date().toISOString(),
        nutritionPlan: m?.nutrition
          ? cloneNutrition(m.nutrition)
          : c.nutritionPlan,
        line: "Plan assigned · starts Monday",
        attention: undefined,
      }));
      bumpTemplates([t?.id, m?.id], 1);
    },
    saveTemplate: (draft) => {
      const id = draft.id ?? uid(draft.kind === "training" ? "t" : "m");
      setTemplates((all) => {
        const prev = all.find((x) => x.id === id);
        const next = fillTemplate({
          ...draft,
          id,
          detail: "",
          clients: prev?.clients ?? 0,
          // Recompute the list line from the new content.
          program: draft.program,
          nutrition: draft.nutrition,
        });
        return prev ? all.map((x) => (x.id === id ? next : x)) : [next, ...all];
      });
      return id;
    },
    deleteTemplate: (id) =>
      setTemplates((all) => all.filter((x) => x.id !== id)),
    duplicateTemplate: (id) => {
      const src = templates.find((x) => x.id === id);
      const copyId = uid(src?.kind === "meals" ? "m" : "t");
      if (!src) return copyId;
      const copy: Template = {
        ...src,
        id: copyId,
        name: `${src.name} (copy)`,
        clients: 0,
        program: src.program
          ? { ...cloneProgram(src.program), name: `${src.name} (copy)` }
          : undefined,
        nutrition: src.nutrition ? cloneNutrition(src.nutrition) : undefined,
      };
      setTemplates((all) => {
        const at = all.findIndex((x) => x.id === id);
        return [...all.slice(0, at + 1), copy, ...all.slice(at + 1)];
      });
      return copyId;
    },
    assignTemplate: (id, clientIds) => {
      const t = templates.find((x) => x.id === id);
      if (!t || !clientIds.length) return;
      for (const cid of clientIds) {
        if (t.kind === "training" && t.program) {
          const program = { ...cloneProgram(t.program), name: t.name };
          update(cid, (c) => ({
            isNew: false,
            program,
            programStart: new Date().toISOString(),
            plan: { training: t.name, meals: c.plan?.meals ?? "" },
            training: {
              ...c.training,
              weekPlanned: c.protocol
                ? 7 - c.protocol.restDays.length
                : program.days.length,
            },
          }));
        }
        if (t.kind === "meals" && t.nutrition) {
          const n = cloneNutrition(t.nutrition);
          update(cid, (c) => ({
            nutritionPlan: n,
            plan: {
              training: c.plan?.training ?? c.program?.name ?? "",
              meals: t.name,
            },
            nutrition: {
              ...c.nutrition,
              targetKcal: n.kcal,
              proteinG: n.protein,
            },
          }));
        }
      }
      bumpTemplates([id], clientIds.length);
    },
    saveProgram: (id, p) =>
      update(id, (c) => ({
        program: p,
        programStart: c.programStart ?? new Date().toISOString(),
        plan: { training: p.name, meals: c.plan?.meals ?? "" },
        training: {
          ...c.training,
          weekPlanned: c.protocol
            ? 7 - c.protocol.restDays.length
            : p.days.length,
        },
      })),
    saveNutrition: (id, n) =>
      update(id, (c) => ({
        nutritionPlan: n,
        plan: {
          training: c.plan?.training ?? c.program?.name ?? "",
          meals: `${n.kcal.toLocaleString("en-IN")} kcal · ${n.protein} g protein`,
        },
        nutrition: { ...c.nutrition, targetKcal: n.kcal, proteinG: n.protein },
      })),
    saveProtocol: (id, r) =>
      update(id, (c) => ({
        protocol: r,
        recovery: { ...c.recovery, sleepTargetH: r.sleepH },
        training: {
          ...c.training,
          weekPlanned: c.program ? 7 - r.restDays.length : 0,
        },
      })),

    createInvite: (id) => {
      const existing = clients.find((c) => c.id === id)?.invite;
      if (existing && !existing.claimed) return existing;
      const invite = { token: token(), code: code(coachName), claimed: false };
      update(id, () => ({ invite, line: "Invite sent · waiting to join" }));
      return invite;
    },
    findInvite: (q) => {
      const v = q.trim();
      return clients.find(
        (c) =>
          c.invite &&
          !c.invite.claimed &&
          (c.invite.token === v ||
            c.invite.code.toUpperCase() === v.toUpperCase()),
      );
    },
    claimInvite: (id) => {
      update(id, (c) => ({
        pending: false,
        invite: c.invite ? { ...c.invite, claimed: true } : undefined,
        joined: "today",
        programStart: new Date().toISOString(),
        line: "Joined today on your invite",
        attention: undefined,
        messages: [
          {
            from: "coach",
            text: `Welcome ${c.name.split(" ")[0]}! Your training, nutrition and recovery plans are ready. Start with today.`,
            time: nowTime(),
          },
        ],
      }));
      setMeId(id);
      setMeTier("coached");
    },

    logWorkout: (id, dayName, sets, topSet, minutes) =>
      update(id, (c) => ({
        training: {
          ...c.training,
          weekDone: c.training.weekDone + 1,
          logs: [
            { date: today(), name: dayName, sets, minutes, topSet },
            ...c.training.logs,
          ],
        },
      })),
    logSleep: (id, hours) =>
      update(id, (c) => ({
        recovery: {
          ...c.recovery,
          nights: [
            ...c.recovery.nights,
            { day: today().slice(0, 3), hours },
          ].slice(-7),
        },
      })),
    logWeight: (id, kg) =>
      update(id, (c) => ({
        weights: [...c.weights, kg],
        measurements: c.measurements.map((m) =>
          m.label === "Weight" ? { ...m, now: kg } : m,
        ),
      })),

    submitCheckIn: (clientId, form) =>
      update(clientId, (c) => {
        const k = buildCheckIn(c, form);
        const waist = form.waistCm;
        return {
          checkIns: [k, ...c.checkIns],
          weights: [...c.weights, form.weightKg],
          measurements:
            waist === undefined
              ? c.measurements
              : c.measurements.some((m) => m.label === "Waist")
                ? c.measurements.map((m) =>
                    m.label === "Waist" ? { ...m, now: waist } : m,
                  )
                : [
                    ...c.measurements,
                    { label: "Waist", start: waist, now: waist, unit: "cm" },
                  ],
          photoWeeks:
            Object.keys(form.photos).length && !c.photoWeeks.includes(k.week)
              ? [...c.photoWeeks, k.week]
              : c.photoWeeks,
          attention: "Check-in to review · submitted just now",
        };
      }),
    reply: (clientId, checkInId, text) =>
      update(clientId, (c) => ({
        checkIns: c.checkIns.map((k) =>
          k.id === checkInId ? { ...k, reviewed: true, reply: text } : k,
        ),
        attention: c.attention?.startsWith("Check-in to review")
          ? undefined
          : c.attention,
      })),
    send: (clientId, text, image) =>
      update(clientId, (c) => ({
        messages: [
          ...c.messages,
          {
            from: "coach",
            text,
            image,
            time: nowTime(),
            at: new Date().toISOString(),
          },
        ],
        coachUnread: (c.coachUnread ?? 0) + 1,
      })),
    sendFromClient: (clientId, text, image) =>
      update(clientId, (c) => ({
        messages: [
          ...c.messages,
          {
            from: "client",
            text,
            image,
            time: nowTime(),
            at: new Date().toISOString(),
          },
        ],
        unread: c.unread + 1,
      })),
    markReadByClient: (clientId) =>
      update(clientId, () => ({ coachUnread: 0 })),
    markRead: (clientId) => update(clientId, () => ({ unread: 0 })),
    setStatus: (clientId, status) =>
      update(clientId, (c) => ({
        status,
        line:
          status === "paused"
            ? "Paused"
            : status === "leaving"
              ? "Leaving at the end of this cycle"
              : status === "completed"
                ? "Coaching completed"
                : c.line,
      })),
    setNotes: (clientId, notes) => update(clientId, () => ({ notes })),
    setCheckInDay: (clientId, day) =>
      update(clientId, () => ({ checkInDay: day })),
    removeClient: (clientId) =>
      setClients((all) => all.filter((c) => c.id !== clientId)),
    remind: (clientId) => setReminded((r) => [...r, clientId]),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCoachData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCoachData must be used inside CoachDataProvider");
  return v;
}

/** Clients the coach should look at first (K-01): open check-ins, overdue, low adherence, unread. */
export const needsAttention = (c: Client) =>
  !c.isNew &&
  !c.pending &&
  (c.status === "active" || c.status === "leaving") &&
  (!!c.attention || c.unread > 0);
