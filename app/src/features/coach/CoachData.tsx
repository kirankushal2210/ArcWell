// Holds the sample data in memory so both sides of the app feel real while there is no backend.
// It sits at the root of the app, standing in for the server: what the coach plans here is what the
// coached athlete sees after joining (D56), and what the athlete logs shows up on the coach's side.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";

import { useSetActive } from "@/features/athlete/ActiveWorkout";
import {
  endLink,
  leaveCurrentCoach,
  revokeInviteCode,
  shareHistory,
} from "@/features/accounts/repo";
import { useAuth } from "@/features/auth/AuthProvider";
import { generalInviteCode, inviteCodeFor, UUID } from "@/features/sync/ids";
import type { World } from "@/features/sync/map";
import {
  cloudCacheKey,
  type SyncState,
  useCloudSync,
} from "@/features/sync/useCloudSync";

import {
  type AthleteSettings,
  defaultSettings,
  isoToday,
  type MeasureKey,
  type Transformation,
} from "@/features/athlete/athleteData";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import type { Session } from "@/features/athlete/training";

import { selfPlan } from "@/features/athlete/selfPlan";

import { buildCheckIn, type CheckInForm, type PhotoPose } from "./checkins";
import { withInstagram } from "./instagram";
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
  /** With accounts: the coach's general invite code, in their public link (D56, D107). */
  inviteCode?: string;
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
  /** Save a client's program. `restart` starts it again from week 1 (a different program). */
  saveProgram: (
    id: string,
    p: TrainingProgram,
    opts?: { restart?: boolean },
  ) => void;
  /** Switch to a new program from today (TR-04): week 1 starts now and rest days follow it. */
  startProgram: (id: string, p: TrainingProgram, restDays: number[]) => void;
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
  /** Cloud sync for signed-in accounts (D107); "off" in sample builds and before sign-in. */
  sync: SyncState;
  /** Push what changed, then pull (signed-in accounts); resolves when done. */
  syncNow: () => Promise<void>;
  /** A self-guided athlete's own record, built from their onboarding answers. */
  self: Client | null;
  startSelf: (c: Client, tier: "pro" | "free") => void;
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
  /** The food just removed, for "Removed · Undo" (X-04). */
  removedFood: { clientId: string; log: FoodLog } | null;
  undoRemoveFood: () => void;
  clearRemovedFood: () => void;
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
  send: (
    clientId: string,
    text: string,
    image?: string,
    file?: { name: string; uri: string },
  ) => void;
  /** The client writes to their coach (F7). */
  sendFromClient: (
    clientId: string,
    text: string,
    image?: string,
    file?: { name: string; uri: string },
  ) => void;
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

  // ---------- Athlete side menu (D9) ----------
  /** Change a weigh-in's value (PH-01). */
  editWeighIn: (clientId: string, id: string, kg: number) => void;
  /** Today's measurements (PH-02); also moves the "now" values the coach sees. */
  addMeasurements: (
    clientId: string,
    values: Partial<Record<MeasureKey, number>>,
  ) => void;
  addProgressPhoto: (clientId: string, pose: PhotoPose, uri: string) => void;
  /** Settings and consents (AC-02, AC-08, N-06, X-09). */
  settingsOf: (clientId: string) => AthleteSettings;
  setAthleteSettings: (
    clientId: string,
    patch: Partial<AthleteSettings>,
  ) => void;
  /** "Share my history from before I joined" (AC-10, D37). */
  setHistoryAccess: (clientId: string, on: boolean) => void;
  /** Paused until / leaving on, and a short note the client sees on Today (CS-01, CS-02). */
  setStatusDetails: (clientId: string, until: string, note: string) => void;
  /** Edit profile (AC-07): name, goal, diet and injuries; shared with the coach. */
  updateProfile: (
    clientId: string,
    patch: Partial<
      Pick<Client, "name" | "goal" | "basics" | "profile" | "photo">
    >,
  ) => void;
  /** Transformation photos (F9): the coach requests, the athlete decides. */
  requestTransformation: (clientId: string, t: Transformation) => void;
  updateTransformation: (
    clientId: string,
    id: string,
    patch: Partial<Transformation>,
  ) => void;
  /**
   * Coaching ends for the athlete on this phone: they leave (L-02), the coach completes them (K-30)
   * or the coach closes their account (K-28). They move to Free with their history, the plan
   * read-only (D21, D42).
   */
  leaveCoach: (
    withdrawPhotos: boolean,
    reason?: "left" | "completed" | "closed",
  ) => void;
  /** The coach deletes their account (K-28): every client is unlinked; templates, leads and transformations go. */
  closeCoachAccount: () => void;
  /** Log water drunk today (FE-5). */
  addWater: (clientId: string, ml: number) => void;
  /** Arcwell Plus ends (F8-08, TL-02): the athlete moves to Free; the AI plan stays read-only (D33). */
  endPlus: () => void;
  /** Start or restart Arcwell Plus (F8-01): a trial the first time, paid after that. */
  startPlus: (plan: "monthly" | "yearly") => void;
  /** A self-guided Pro athlete joins a coach after ending AI in Play (J-01 to J-03). */
  joinCoachFromPro: () => void;
};

const Ctx = createContext<CoachData | null>(null);

const STORE_KEY = "arcwell.sample.v1";
/** Where an unreadable saved copy is kept, so a failed load never loses it (see the load effect). */
const BACKUP_KEY = "arcwell.sample.backup";
const SAVE_DELAY_MS = 800;
type Saved = {
  clients: Client[];
  meId: string | null;
  meTier: AthleteTier;
  self: Client | null;
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
    return withProgram({
      ...c,
      competitive: true,
      enhanced: sampleEnhanced(),
    });
  if (c.id === "priya" && c.supplements === undefined)
    return withProgram({
      ...c,
      supplements: cloneItems(sampleStacks()[1].items),
    });
  return withProgram(c);
}

/**
 * Sample clients arrive with their coach's plan as a name only ("Fat loss · 4 days"). Give each
 * the program behind that name, as the coach's builder already shows it, so the athlete's Coach
 * plan and every screen that reads the program see what the coach assigned (D105). The start date
 * puts them partway through, in line with how long they've been with the coach.
 */
function withProgram(c: Client): Client {
  const name = c.plan?.training;
  if (c.program || c.pending || !name) return c;
  const program = { ...programFromTemplate(name), name };
  const weeksIn = Math.max(0, (c.weeksWithYou - 1) % program.weeks);
  return {
    ...c,
    program,
    programStart:
      c.programStart ??
      new Date(Date.now() - weeksIn * 7 * 86400000).toISOString(),
  };
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

const isUuid = (id: string) => UUID.test(id);

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
// Letters and digits only, so the same code works as a real invite code (6–12 characters).
const code = (coach: string) =>
  `${coach
    .replace(/^Coach\s+/, "")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X")}${Math.floor(1000 + Math.random() * 9000)}`;

export function CoachDataProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  // A signed-in account with a profile syncs through Supabase; otherwise the store is the sample.
  const cloudUid = auth.session && auth.profile ? auth.session.user.id : null;
  const [clients, setClients] = useState(() => sampleClients.map(withExtras));
  const [stacks, setStacks] = useState<Stack[]>(sampleStacks);
  const [templates, setTemplates] = useState<Template[]>(() =>
    sampleTemplates.map(fillTemplate),
  );
  const [leads, setLeads] = useState<Lead[]>(() =>
    withInstagram(sampleLeads()),
  );
  const [coach, setCoach] = useState<CoachProfile>(defaultCoachProfile);
  const [settings, setSettings] = useState<CoachSettings>(defaultCoachSettings);
  const [reminded, setReminded] = useState<string[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [meTier, setMeTier] = useState<AthleteTier>("coached");
  const [self, setSelf] = useState<Client | null>(null);
  // The workout in progress lives in its own store (ActiveWorkout.tsx) so logging a set is cheap.
  const setActive = useSetActive();
  const [history, setHistory] = useState<Record<string, Session[]>>({});
  const [joiningCoach, setJoiningCoach] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [customExercises, setCustom] = useState<Exercise[]>([]);
  const [foodLogs, setFoodLogs] = useState<Record<string, FoodLog[]>>({});
  const [removedFood, setRemovedFood] = useState<{
    clientId: string;
    log: FoodLog;
  } | null>(null);
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
  //
  // Safety rules:
  // - If the saved copy can't be read, it is backed up and saving stops for this run, so sample
  //   data never replaces what's stored.
  // - A finished workout saves at once (urgent), before the cleared workout in progress does, so
  //   closing the app straight after Finish can't lose it.
  // - A change still waiting for its save is written if the provider goes away.
  const saveBlocked = useRef(false);
  const saveUrgent = useRef(false);
  const pendingSave = useRef<(() => void) | null>(null);
  useEffect(() => {
    let stored: string | null = null;
    AsyncStorage.getItem(STORE_KEY)
      .then((raw) => {
        stored = raw;
        if (!raw) return;
        const s = JSON.parse(migrateNames(raw)) as Partial<Saved>;
        if (s.clients) setClients(s.clients.map(withExtras));
        if (s.stacks) setStacks(s.stacks);
        if (s.meId !== undefined) setMeId(s.meId);
        if (s.meTier) setMeTier(s.meTier);
        if (s.self !== undefined) setSelf(upgradeSelfPlan(s.self));
        if (s.history) setHistory(s.history);
        if (s.custom) setCustom(s.custom);
        if (s.foodLogs) setFoodLogs(s.foodLogs);
        if (s.myFoods) setMyFoods(s.myFoods);
        if (s.hideUpgrade) setHideUpgrade(true);
        if (s.recovery) setRecovery(s.recovery);
        if (s.templates) setTemplates(s.templates.map(fillTemplate));
        if (s.leads) setLeads(withInstagram(s.leads));
        if (s.coach) setCoach(s.coach);
        if (s.settings) setSettings(s.settings);
      })
      .catch(() => {
        saveBlocked.current = true;
        if (stored) AsyncStorage.setItem(BACKUP_KEY, stored).catch(() => {});
      })
      .finally(() => setHydrated(true));
  }, []);
  useEffect(() => () => pendingSave.current?.(), []);
  useEffect(() => {
    if (!hydrated) return;
    const saved: Saved = {
      clients,
      meId,
      meTier,
      self,
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
    // Serialising the whole store is slow, so save once changes settle, and at once when the app
    // leaves the foreground, instead of on every tap.
    const save = () => {
      pendingSave.current = null;
      saveUrgent.current = false;
      if (saveBlocked.current) return;
      // Signed in, the phone's copy belongs to that account; the sample store is left alone.
      AsyncStorage.setItem(
        cloudUid ? cloudCacheKey(cloudUid) : STORE_KEY,
        JSON.stringify(saved),
      ).catch(() => {});
    };
    pendingSave.current = save;
    const t = setTimeout(save, saveUrgent.current ? 0 : SAVE_DELAY_MS);
    const sub = AppState.addEventListener("change", (st) => {
      if (st !== "active") save();
    });
    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, [
    hydrated,
    clients,
    meId,
    meTier,
    self,
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
    cloudUid,
  ]);
  // Signed-in accounts load and save through Supabase (D107); everything else stays on the phone.
  const cloudWorld = useMemo<World>(
    () => ({
      clients,
      meId,
      meTier,
      self,
      history,
      custom: customExercises,
      foodLogs,
      myFoods,
      recovery,
      templates,
      leads,
      coach,
      settings,
      stacks,
    }),
    [
      clients,
      meId,
      meTier,
      self,
      history,
      customExercises,
      foodLogs,
      myFoods,
      recovery,
      templates,
      leads,
      coach,
      settings,
      stacks,
    ],
  );
  const cloud = useCloudSync({
    uid: cloudUid,
    role: auth.profile?.role ?? null,
    world: cloudWorld,
    apply: (w: World) => {
      setClients(w.clients);
      setMeId(w.meId);
      setMeTier(w.meTier);
      setSelf(w.self);
      setHistory(w.history);
      setCustom(w.custom);
      setFoodLogs(w.foodLogs);
      setMyFoods(w.myFoods);
      setRecovery(w.recovery);
      setTemplates(w.templates);
      setLeads(w.leads);
      setCoach(w.coach);
      setSettings(w.settings);
      setStacks(w.stacks);
    },
  });
  const resetToSample = () => {
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
    setLeads(withInstagram(sampleLeads()));
    setCoach(defaultCoachProfile());
    setSettings(defaultCoachSettings());
    AsyncStorage.removeItem(STORE_KEY).catch(() => {});
  };
  // Signing out returns the phone to the sample world.
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (cloudUid) wasSignedIn.current = true;
    else if (wasSignedIn.current) {
      wasSignedIn.current = false;
      resetToSample();
    }
    // Runs only when the signed-in account changes; resetToSample is a plain store reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudUid]);

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
    inviteCode:
      cloudUid && auth.profile?.role === "coach"
        ? generalInviteCode(coachName, cloudUid)
        : undefined,
    reminded,
    meId,
    hydrated,
    resetSample: () => resetToSample(),
    meTier,
    sync: cloud.state,
    syncNow: async () => {
      await cloud.syncNow();
    },
    self,
    startSelf: (c, tier) => {
      setSelf(c);
      setMeId(c.id);
      setMeTier(tier);
    },
    client: (id) =>
      self && id === self.id ? self : clients.find((c) => c.id === id),
    sessions: (id) => history[id] ?? [],
    foodLogs: (id) => foodLogs[id] ?? [],
    addFoodLogs: (id, logs) => {
      // Stamp the clock time on today's new logs, for the caffeine cut-off (D96).
      const now = new Date();
      const today = isoToday();
      const minute = now.getHours() * 60 + now.getMinutes();
      const stamped = logs.map((l) =>
        l.at === undefined && l.date === today ? { ...l, at: minute } : l,
      );
      setFoodLogs((all) => ({
        ...all,
        [id]: [...(all[id] ?? []), ...stamped],
      }));
    },
    updateFoodLog: (id, log) =>
      setFoodLogs((all) => ({
        ...all,
        [id]: (all[id] ?? []).map((l) => (l.id === log.id ? log : l)),
      })),
    removedFood,
    undoRemoveFood: () => {
      if (!removedFood) return;
      const { clientId, log } = removedFood;
      setFoodLogs((all) => ({
        ...all,
        [clientId]: [...(all[clientId] ?? []), log],
      }));
      setRemovedFood(null);
    },
    clearRemovedFood: () => setRemovedFood(null),
    deleteFoodLog: (id, logId) => {
      const log = (foodLogs[id] ?? []).find((l) => l.id === logId);
      if (log) setRemovedFood({ clientId: id, log });
      setFoodLogs((all) => ({
        ...all,
        [id]: (all[id] ?? []).filter((l) => l.id !== logId),
      }));
    },
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
      saveUrgent.current = true;
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
      const now = new Date().toISOString();
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
        programStart: now,
        programUpdatedAt: now,
        nutritionPlan: m?.nutrition
          ? cloneNutrition(m.nutrition)
          : c.nutritionPlan,
        line: "Plan assigned · starts today",
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
      const now = new Date().toISOString();
      for (const cid of clientIds) {
        if (t.kind === "training" && t.program) {
          const program = { ...cloneProgram(t.program), name: t.name };
          update(cid, (c) => ({
            isNew: false,
            program,
            programStart: now,
            programUpdatedAt: now,
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
    startProgram: (id, p, restDays) =>
      update(id, (c) => ({
        program: p,
        programStart: new Date().toISOString(),
        plan: { training: p.name, meals: c.plan?.meals ?? "" },
        protocol: c.protocol
          ? { ...c.protocol, restDays }
          : {
              sleepH: 8,
              bed: 22 * 60 + 30,
              wake: 6 * 60 + 30,
              restDays,
              note: "",
            },
        training: { ...c.training, weekPlanned: 7 - restDays.length },
      })),
    saveProgram: (id, p, opts) =>
      update(id, (c) => {
        const now = new Date().toISOString();
        return {
          program: p,
          programStart: opts?.restart || !c.programStart ? now : c.programStart,
          programUpdatedAt: now,
          plan: { training: p.name, meals: c.plan?.meals ?? "" },
          training: {
            ...c.training,
            weekPlanned: c.protocol
              ? 7 - c.protocol.restDays.length
              : p.days.length,
          },
        };
      }),
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
      // With accounts the code is the client's saved personal invite (D107).
      const invite = cloudUid
        ? { token: inviteCodeFor(id), code: inviteCodeFor(id), claimed: false }
        : { token: token(), code: code(coachName), claimed: false };
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
        // Self-guided: calorie and macro targets follow the new weight (D96). Coached athletes'
        // targets stay with their coach.
        ...(meTier !== "coached" && c.selfAnswers && c.nutritionPlan
          ? (() => {
              const t = selfPlan({ ...c.selfAnswers, weightKg: kg }).nutrition;
              const n = c.nutritionPlan;
              return {
                nutritionPlan: {
                  ...n,
                  kcal: t.kcal,
                  protein: t.protein,
                  carbs: t.carbs,
                  fat: t.fat,
                },
                nutrition: {
                  ...c.nutrition,
                  targetKcal: t.kcal,
                  proteinG: t.protein,
                },
              };
            })()
          : {}),
        weights: [...c.weights, kg],
        weighIns: [
          ...(c.weighIns ?? []).filter((w) => w.date !== isoToday()),
          { id: `w${Date.now().toString(36)}`, date: isoToday(), kg },
        ],
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
    send: (clientId, text, image, file) =>
      update(clientId, (c) => ({
        messages: [
          ...c.messages,
          {
            from: "coach",
            text,
            image,
            file,
            time: nowTime(),
            at: new Date().toISOString(),
          },
        ],
        coachUnread: (c.coachUnread ?? 0) + 1,
      })),
    sendFromClient: (clientId, text, image, file) =>
      update(clientId, (c) => ({
        messages: [
          ...c.messages,
          {
            from: "client",
            text,
            image,
            file,
            time: nowTime(),
            at: new Date().toISOString(),
          },
        ],
        unread: c.unread + 1,
      })),
    markReadByClient: (clientId) =>
      update(clientId, () => ({ coachUnread: 0 })),
    markRead: (clientId) => update(clientId, () => ({ unread: 0 })),
    setStatus: (clientId, status) => {
      if (cloudUid && status === "completed" && isUuid(clientId))
        void endLink(clientId, "completed");
      update(clientId, (c) => ({
        endedBy: status === "completed" ? "completed" : undefined,
        status,
        line:
          status === "paused"
            ? "Paused"
            : status === "leaving"
              ? "Leaving at the end of this cycle"
              : status === "completed"
                ? "Coaching completed"
                : c.line,
      }));
    },
    setNotes: (clientId, notes) => update(clientId, () => ({ notes })),
    setCheckInDay: (clientId, day) =>
      update(clientId, () => ({ checkInDay: day })),
    removeClient: (clientId) => {
      const c = clients.find((x) => x.id === clientId);
      if (cloudUid && c?.pending && c.invite)
        void revokeInviteCode(c.invite.code);
      else if (cloudUid && isUuid(clientId)) void endLink(clientId, "removed");
      setClients((all) => all.filter((x) => x.id !== clientId));
    },
    remind: (clientId) => setReminded((r) => [...r, clientId]),

    editWeighIn: (clientId, id, kg) =>
      update(clientId, (c) => ({
        weighIns: (c.weighIns ?? []).map((w) =>
          w.id === id ? { ...w, kg } : w,
        ),
      })),
    addMeasurements: (clientId, values) =>
      update(clientId, (c) => {
        const keys = Object.keys(values) as MeasureKey[];
        const measurements = c.measurements.map((m) =>
          values[m.label as MeasureKey] !== undefined
            ? { ...m, now: values[m.label as MeasureKey] as number }
            : m,
        );
        for (const k of keys)
          if (!measurements.some((m) => m.label === k))
            measurements.push({
              label: k,
              start: values[k] as number,
              now: values[k] as number,
              unit: "cm",
            });
        return {
          measurements,
          measureLog: [
            ...(c.measureLog ?? []).filter((e) => e.date !== isoToday()),
            { date: isoToday(), values },
          ],
        };
      }),
    addProgressPhoto: (clientId, pose, uri) =>
      update(clientId, (c) => ({
        progressPhotos: [
          ...(c.progressPhotos ?? []),
          { id: `p${Date.now().toString(36)}`, date: isoToday(), pose, uri },
        ],
      })),
    settingsOf: (clientId) => {
      const c =
        self && self.id === clientId
          ? self
          : clients.find((x) => x.id === clientId);
      return { ...defaultSettings(), ...c?.athleteSettings };
    },
    setAthleteSettings: (clientId, patch) =>
      update(clientId, (c) => ({
        athleteSettings: {
          ...defaultSettings(),
          ...c.athleteSettings,
          ...patch,
        },
      })),
    setHistoryAccess: (clientId, on) => {
      if (cloudUid) void shareHistory(on);
      update(clientId, (c) => ({
        historyFrom: on ? "2000-01-01" : undefined,
        athleteSettings: {
          ...defaultSettings(),
          ...c.athleteSettings,
          historyChangedAt: isoToday(),
        },
      }));
    },
    updateProfile: (clientId, patch) => update(clientId, () => patch),
    setStatusDetails: (clientId, until, note) =>
      update(clientId, () => ({
        statusUntil: until.trim() || undefined,
        statusNote: note.trim() || undefined,
      })),
    requestTransformation: (clientId, t) =>
      update(clientId, (c) => ({
        transformations: [t, ...(c.transformations ?? [])],
      })),
    updateTransformation: (clientId, id, patch) =>
      update(clientId, (c) => ({
        transformations: (c.transformations ?? []).map((t) =>
          t.id === id ? { ...t, ...patch } : t,
        ),
      })),
    leaveCoach: (withdrawPhotos, reason = "left") => {
      const c = clients.find((x) => x.id === meId);
      if (!c) return;
      if (cloudUid) void leaveCurrentCoach();
      // The athlete's own copy under a new id: the coach's access ends (D21) and nothing is
      // deleted (D7c). Workouts, food and recovery move with them.
      const id = `${c.id}-own`;
      const at = isoToday();
      const transformations = (c.transformations ?? []).map((t) =>
        withdrawPhotos && t.status === "approved"
          ? {
              ...t,
              status: "withdrawn" as const,
              withdrawnAt: at,
              onProfile: false,
            }
          : t,
      );
      setSelf({
        ...c,
        id,
        status: "completed",
        coachUnread: 0,
        transformations,
        formerCoach: { coachName, reason, at },
      });
      setHistory((h) => ({ ...h, [id]: h[c.id] ?? [] }));
      setFoodLogs((f) => ({ ...f, [id]: f[c.id] ?? [] }));
      setRecovery((r) => (r[c.id] ? { ...r, [id]: r[c.id] } : r));
      setClients((all) =>
        all.map((x) =>
          x.id === c.id
            ? {
                ...x,
                status: "completed",
                line: reason === "left" ? `Left on ${today()}` : x.line,
                transformations,
              }
            : x,
        ),
      );
      setMeId(id);
      setMeTier("free");
    },
    closeCoachAccount: () => {
      setClients((all) =>
        all.map((c) =>
          c.pending
            ? c
            : {
                ...c,
                status: "completed",
                endedBy: "closed",
                line: "Coach account closed",
                transformations: [],
              },
        ),
      );
      setTemplates([]);
      setLeads([]);
    },
    addWater: (clientId, ml) =>
      update(clientId, (c) => {
        const d = isoToday();
        const now = (c.water?.[d] ?? 0) + ml;
        return { water: { ...c.water, [d]: Math.max(0, now) } };
      }),
    endPlus: () => {
      if (!self) return;
      setSelf({
        ...self,
        athleteSettings: {
          ...defaultSettings(),
          ...self.athleteSettings,
          sub: {
            ...(self.athleteSettings?.sub ?? {
              plan: "yearly",
              startedAt: isoToday(),
            }),
            status: "expired",
          },
        },
      });
      setMeTier("free");
    },
    startPlus: (plan) => {
      if (!self) return;
      const had = !!self.athleteSettings?.sub;
      setSelf({
        ...self,
        athleteSettings: {
          ...defaultSettings(),
          ...self.athleteSettings,
          sub: {
            status: had ? "active" : "trial",
            plan,
            startedAt: isoToday(),
          },
        },
      });
      setMeTier("pro");
    },
    joinCoachFromPro: () => {
      if (!self) return;
      const c: Client = {
        ...self,
        id: `c${Date.now().toString(36)}`,
        isNew: true,
        status: "active",
        joined: "today",
        weeksWithYou: 0,
        line: "Joined today · needs a plan",
        attention: "New client: build their plan",
        program: undefined,
        nutritionPlan: undefined,
        formerCoach: undefined,
        checkIns: [],
        messages: [],
        unread: 0,
      };
      setHistory((h) => ({ ...h, [c.id]: h[self.id] ?? [] }));
      setFoodLogs((f) => ({ ...f, [c.id]: f[self.id] ?? [] }));
      setSelf(null);
      setClients((all) => [c, ...all]);
      setMeId(c.id);
      setMeTier("coached");
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCoachData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCoachData must be used inside CoachDataProvider");
  return v;
}

// Who needs attention (K-01) is worked out in ./checkins (needsAttentionNow), not stored.
