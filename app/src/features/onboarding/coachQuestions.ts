// Coach onboarding (CO-02 to CO-11), following the hi-fi mockups (docs/design/hifi-mockups/coach-onboarding.html)
// and the F2 wireframes. Only the profile basics are required; everything after can be skipped and
// finished later from the Clients-tab checklist (CO-13).
import {
  Award,
  Building,
  Building2,
  ClipboardCheck,
  ClipboardList,
  DoorOpen,
  Gift,
  IdCard,
  Image,
  IndianRupee,
  LayoutTemplate,
  ListChecks,
  PencilLine,
  PencilRuler,
  Repeat,
  Send,
  Sheet,
  ShieldCheck,
  Smartphone,
  Sprout,
  User,
  Users,
  UsersRound,
} from "lucide-react-native";

import type { Flow, Question, Section } from "./questions";

const sections: Section[] = [
  { id: "practice", name: "Your coaching" },
  { id: "profile", name: "Profile" },
  { id: "services", name: "Services" },
  { id: "plans", name: "Templates", dot: "training" },
];

const questions: Question[] = [
  {
    id: "CO-02",
    section: "intro",
    hideProgress: true,
    logoHeader: true,
    glyph: ShieldCheck,
    title: "Run your coaching in one place",
    sub: "Built for coaches in India.",
    next: "Set up my coaching",
    caption: "Takes about 5 minutes",
    fields: [
      {
        kind: "features",
        items: [
          {
            icon: ListChecks,
            title: "Plans clients actually follow",
            sub: "Training and Indian meal plans in their app",
          },
          {
            icon: ClipboardCheck,
            title: "Check-ins without chasing",
            sub: "Reminders, photos and numbers side by side",
          },
          {
            icon: Users,
            title: "See who needs you",
            sub: "Adherence, missed workouts and messages in one list",
          },
          {
            icon: Gift,
            title: "Free for your clients",
            sub: "They download Arcwell and join with your link",
          },
        ],
      },
    ],
  },
  {
    id: "CO-03",
    section: "intro",
    hideProgress: true,
    glyph: ShieldCheck,
    title: "Looking after your clients' data",
    sub: "Your clients trust you with health information and photos. By coaching on Arcwell you agree to:",
    next: "Continue",
    fields: [
      {
        kind: "features",
        items: [
          {
            icon: ShieldCheck,
            title: "Use client data only for coaching them",
            sub: "Never share, sell or post it elsewhere",
          },
          {
            icon: Image,
            title: "Ask before sharing photos",
            sub: "Transformation photos need the client's approval in the app",
          },
          {
            icon: DoorOpen,
            title: "Respect when clients leave",
            sub: "Your access ends with the coaching; their history stays with them",
          },
        ],
      },
      {
        kind: "agree",
        key: "coachTerms",
        label:
          "I agree to the Terms of Use, including the extra terms for coaches, and the Privacy Policy. I'm 18 or older.",
        links: true,
      },
    ],
  },
  {
    id: "CO-04",
    section: "practice",
    glyph: Building2,
    title: "How do you coach?",
    sub: "We'll set things up the way you work.",
    fields: [
      {
        kind: "single",
        key: "coachingMode",
        required: true,
        options: [
          {
            value: "in_person",
            label: "In person",
            sub: "At a gym or studio",
            icon: Building2,
          },
          {
            value: "online",
            label: "Online",
            sub: "Clients anywhere, over chat and calls",
            icon: Smartphone,
          },
          {
            value: "both",
            label: "Both",
            sub: "A mix of gym-floor and online clients",
            icon: Repeat,
          },
        ],
      },
    ],
  },
  {
    id: "CO-05",
    section: "practice",
    glyph: Users,
    title: "How many clients do you coach right now?",
    sub: "Roughly is fine.",
    fields: [
      {
        kind: "single",
        key: "clientCount",
        required: true,
        options: [
          {
            value: "0",
            label: "Just starting",
            sub: "No paying clients yet",
            icon: Sprout,
          },
          { value: "1-10", label: "1–10 clients", icon: User },
          { value: "11-30", label: "11–30 clients", icon: Users },
          { value: "31-60", label: "31–60 clients", icon: UsersRound },
          { value: "60+", label: "More than 60", icon: Building },
        ],
      },
    ],
  },
  {
    id: "CO-06",
    section: "profile",
    glyph: IdCard,
    title: "Your coach profile",
    sub: "This is what clients see when they join you.",
    fields: [
      { kind: "photo", key: "photo" },
      {
        kind: "text",
        key: "displayName",
        label: "Name clients see",
        placeholder: "e.g. Coach Joseph",
        required: true,
      },
      {
        kind: "text",
        key: "city",
        label: "City",
        placeholder: "e.g. Bengaluru",
        required: true,
      },
    ],
  },
  {
    id: "CO-07",
    section: "profile",
    glyph: Award,
    title: "What do you specialise in?",
    sub: "Pick up to 3. Clients see these first.",
    fields: [
      {
        kind: "chips",
        key: "specialisations",
        max: 3,
        required: true,
        options: [
          "Fat loss",
          "Strength",
          "Muscle gain",
          "Women's fitness",
          "Beginners",
          "Contest prep",
          "Home workouts",
          "PCOS",
          "Endurance",
          "Mobility",
        ],
      },
    ],
  },
  {
    id: "CO-08",
    section: "profile",
    glyph: PencilLine,
    title: "About you",
    sub: "Optional. You can add this later.",
    skippable: true,
    fields: [
      {
        kind: "text",
        key: "bio",
        label: "Short bio",
        placeholder: "Who you help and how",
        multiline: true,
        maxLength: 160,
      },
      {
        kind: "text",
        key: "instagram",
        label: "Instagram",
        placeholder: "@yourhandle",
      },
      {
        kind: "text",
        key: "yearsCoaching",
        label: "Years coaching",
        placeholder: "e.g. 5",
        keyboard: "number-pad",
        maxLength: 2,
      },
      {
        kind: "text",
        key: "certifications",
        label: "Certifications (self-reported)",
        placeholder: "e.g. ACE-CPT, K11",
      },
    ],
  },
  {
    id: "CO-09",
    section: "services",
    glyph: IndianRupee,
    title: "Your coaching services",
    sub: "Shown on your profile. Payments stay between you and your clients.",
    skippable: true,
    fields: [{ kind: "services", key: "services" }],
  },
  {
    id: "CO-10",
    section: "plans",
    glyph: ClipboardList,
    title: "Create your first training template",
    sub: "Reuse it for every client and adjust per person.",
    skippable: true,
    next: "Continue",
    fields: [
      {
        kind: "single",
        key: "firstTemplate",
        required: true,
        options: [
          {
            value: "arcwell",
            label: "Start from an Arcwell template",
            sub: "Push / pull / legs, upper / lower, full body",
            icon: LayoutTemplate,
          },
          {
            value: "scratch",
            label: "Build from scratch",
            sub: "Opens the plan builder",
            icon: PencilRuler,
          },
          // D55: back in v1. Most coaches run their clients' workouts in Excel or Google Sheets today.
          {
            value: "spreadsheet",
            label: "Copy from my spreadsheet",
            sub: "Excel, Google Sheets or CSV",
            icon: Sheet,
          },
        ],
      },
      {
        kind: "sheet",
        key: "templateSheet",
        showIf: { key: "firstTemplate", equals: "spreadsheet" },
      },
    ],
  },
  {
    id: "CO-11",
    section: "intro",
    hideProgress: true,
    glyph: Send,
    title: "Invite your clients",
    sub: "Clients download Arcwell free and connect to you automatically.",
    next: "Done",
    fields: [{ kind: "invite", nameKey: "displayName" }],
  },
];

export const coachFlow: Flow = { sections, questions };
