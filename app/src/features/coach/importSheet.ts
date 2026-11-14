// Spreadsheet import (D55, CO-10): most coaches keep their clients' workouts in Excel or Google
// Sheets. This reads a CSV or .xlsx into a draft training program, one row per exercise (day,
// exercise, sets, reps, rest, effort), matches names to the exercise library and flags the rest
// for the coach to fix or drop. Pure: the screen reads the file's bytes and hands them in.
import { strFromU8, unzipSync } from "fflate";

import {
  findExercise,
  LEGACY_NAMES,
  LIBRARY,
  typeOf,
} from "@/features/athlete/library";
import { defaultTarget } from "@/features/athlete/training";
import { restFor } from "@/features/science/rules";

import {
  type PlannedExercise,
  type RpeRange,
  type TrainingDay,
  type TrainingProgram,
  uid,
} from "./plans";

export type SheetKind = "csv" | "xlsx" | "unsupported";

/** A row whose exercise isn't in the library: the coach picks the right one or drops it. */
export type Unmatched = {
  dayId: string;
  exerciseId: string;
  /** The name as typed in the sheet. */
  raw: string;
  /** 1-based row in the sheet. */
  row: number;
};

export type SheetImport = {
  program: TrainingProgram;
  unmatched: Unmatched[];
};

export const sheetKind = (name: string, mimeType?: string): SheetKind => {
  const n = name.toLowerCase();
  if (n.endsWith(".csv") || n.endsWith(".tsv") || n.endsWith(".txt"))
    return "csv";
  if (n.endsWith(".xlsx")) return "xlsx";
  if (mimeType?.includes("csv") || mimeType === "text/plain") return "csv";
  if (mimeType?.includes("spreadsheetml")) return "xlsx";
  return "unsupported";
};

export const READ_ERROR =
  "We couldn't read this file. Save it as .xlsx or .csv and try again.";

// ---------- CSV ----------

/** Rows of cells from CSV text. Commas, semicolons or tabs, whichever the first line uses most. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const first = src.split(/\r?\n/).find((l) => l.trim()) ?? "";
  const count = (c: string) => first.split(c).length - 1;
  const delim = [",", ";", "\t"].reduce((a, b) =>
    count(b) > count(a) ? b : a,
  );
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim()));
}

// ---------- XLSX (a zip of XML files) ----------

const decodeXml = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** All text runs inside a shared string or inline string, phonetic hints left out. */
const textOf = (xml: string) =>
  decodeXml(
    [
      ...xml
        .replace(/<rPh\b[\s\S]*?<\/rPh>/g, "")
        .matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g),
    ]
      .map((m) => m[1])
      .join(""),
  );

const attr = (attrs: string, name: string) =>
  new RegExp(`\\b${name}="([^"]*)"`).exec(attrs)?.[1];

/** "B12" → 1 (zero-based column). */
const columnOf = (ref: string) =>
  [...(ref.match(/^[A-Z]+/)?.[0] ?? "A")].reduce(
    (n, c) => n * 26 + c.charCodeAt(0) - 64,
    0,
  ) - 1;

/** Rows of cells from the first worksheet of an .xlsx file. */
export function readXlsx(bytes: Uint8Array): string[][] {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes, {
      filter: (f) =>
        f.name === "xl/sharedStrings.xml" ||
        /^xl\/worksheets\/sheet\d+\.xml$/.test(f.name),
    });
  } catch {
    throw new Error(READ_ERROR);
  }
  const sheetName =
    "xl/worksheets/sheet1.xml" in files
      ? "xl/worksheets/sheet1.xml"
      : Object.keys(files)
          .filter((n) => n.startsWith("xl/worksheets/"))
          .sort(
            (a, b) =>
              Number(/(\d+)\.xml$/.exec(a)?.[1]) -
              Number(/(\d+)\.xml$/.exec(b)?.[1]),
          )[0];
  if (!sheetName) throw new Error(READ_ERROR);
  const shared = files["xl/sharedStrings.xml"]
    ? [
        ...strFromU8(files["xl/sharedStrings.xml"]).matchAll(
          /<si\b[^>]*>([\s\S]*?)<\/si>/g,
        ),
      ].map((m) => textOf(m[1]))
    : [];
  const xml = strFromU8(files[sheetName]);
  const rows: string[][] = [];
  let nextRow = 0;
  for (const r of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const at = Number(attr(r[1], "r")) - 1;
    const ri = Number.isFinite(at) && at >= 0 ? at : nextRow;
    nextRow = ri + 1;
    const cells: string[] = [];
    let nextCol = 0;
    for (const c of (r[2] ?? "").matchAll(
      /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
    )) {
      const ref = attr(c[1], "r");
      const ci = ref ? columnOf(ref) : nextCol;
      nextCol = ci + 1;
      const type = attr(c[1], "t");
      const body = c[2] ?? "";
      const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      const value =
        type === "s"
          ? (shared[Number(v)] ?? "")
          : type === "inlineStr"
            ? textOf(body)
            : v !== undefined
              ? decodeXml(v)
              : "";
      cells[ci] = value.trim();
    }
    rows[ri] = Array.from(cells, (x) => x ?? "");
  }
  return Array.from(rows, (x) => x ?? []);
}

/** Rows from a picked file's bytes, by its name or type. */
export function rowsFromFile(
  bytes: Uint8Array,
  name: string,
  mimeType?: string,
): string[][] {
  const kind = sheetKind(name, mimeType);
  // A zip starts with "PK"; trust the content over a missing or odd extension.
  if (kind === "xlsx" || (bytes[0] === 0x50 && bytes[1] === 0x4b))
    return readXlsx(bytes);
  if (kind === "csv") return parseCsv(strFromU8(bytes));
  throw new Error(READ_ERROR);
}

// ---------- Exercise names ----------

const ALIASES: Record<string, string> = {
  db: "dumbbell",
  dumbbells: "dumbbell",
  bb: "barbell",
  kb: "kettlebell",
  rdl: "romanian deadlift",
  ohp: "overhead press",
  pullup: "pull up",
  pullups: "pull up",
  pushup: "push up",
  pushups: "push up",
  chinup: "chin up",
  chinups: "chin up",
};

/** Order-free key: "Barbell bench press" and "Bench press (barbell)" match; plurals too. */
const keyOf = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .flatMap((w) => (ALIASES[w] ?? w).split(" "))
    .map((w) => (w.length > 2 && w.endsWith("s") ? w.slice(0, -1) : w))
    .filter(Boolean)
    .sort()
    .join(" ");

let keys: Map<string, string> | null = null;
const libraryKeys = () => {
  if (!keys) {
    keys = new Map();
    for (const e of LIBRARY) keys.set(keyOf(e.name), e.name);
    for (const [from, to] of Object.entries(LEGACY_NAMES))
      if (!keys.has(keyOf(from))) keys.set(keyOf(from), to);
  }
  return keys;
};

/** The library name for a typed exercise, or null when there's no confident match. */
export function matchExercise(raw: string): string | null {
  const name = raw.trim();
  if (!name) return null;
  const exact = findExercise(name);
  if (exact) return exact.name;
  if (LEGACY_NAMES[name]) return LEGACY_NAMES[name];
  const map = libraryKeys();
  const k = keyOf(name);
  if (map.has(k)) return map.get(k)!;
  // "Squat" or "Lat pulldown" without the equipment: the usual version of it.
  for (const kit of ["barbell", "dumbbell", "machine", "cable"]) {
    const hit = map.get(keyOf(`${name} ${kit}`));
    if (hit) return hit;
  }
  return null;
}

// ---------- Cells ----------

/** "3", "3x10", "3 × 8-10" → sets and, when given, reps. */
export function parseSetsReps(cell: string): { sets?: number; reps?: string } {
  const m = /^(\d+)\s*[x×*]\s*(.+)$/i.exec(cell.trim());
  if (m) return { sets: Number(m[1]), reps: cleanReps(m[2]) };
  const n = /^(\d+)$/.exec(cell.trim());
  return n ? { sets: Number(n[1]) } : {};
}

/** "8-10" → "8–10", "40s" → "40 s", "20min" → "20 min", "400m" → "400 m". */
export function cleanReps(cell: string) {
  return cell
    .trim()
    .replace(/(\d)\s*(?:-|–|to)\s*(\d)/i, "$1–$2")
    .replace(/^(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds)$/i, "$1 s")
    .replace(/^(\d+(?:\.\d+)?)\s*(?:min|mins|minutes)$/i, "$1 min")
    .replace(
      /^(\d+(?:\.\d+)?)\s*(m|km)$/i,
      (_, n, u) => `${n} ${u.toLowerCase()}`,
    );
}

/** Rest in seconds: "90", "90s", "2 min", "2'", "1:30", "1.5 min". Null when blank or unreadable. */
export function parseRest(cell: string): number | null {
  const s = cell.trim().toLowerCase();
  if (!s) return null;
  const clock = /^(\d+):([0-5]\d)$/.exec(s);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const m =
    /^(\d+(?:\.\d+)?)\s*(s|sec|secs|seconds|m|min|mins|minutes|')?$/.exec(s);
  if (!m) return null;
  const n = Number(m[1]);
  const minutes = m[2] && /^(m|min|mins|minutes|')$/.test(m[2]);
  return Math.round(minutes ? n * 60 : n);
}

const clampRpe = (n: number) => Math.min(10, Math.max(1, Math.round(n)));

/**
 * Effort as an RPE range: "RPE 8", "7-8", "@8" or, from a reps-in-reserve column or "RIR 2",
 * RPE = 10 − reps in reserve (helms2016rir).
 */
export function parseEffort(cell: string, rirColumn = false): RpeRange | null {
  const s = cell.trim().toLowerCase();
  const nums = s.match(/\d+(?:\.\d+)?/g)?.map(Number);
  if (!nums?.length) return null;
  const rir = /rir/.test(s) || (rirColumn && !/rpe/.test(s));
  const vals = nums.slice(0, 2).map((n) => clampRpe(rir ? 10 - n : n));
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return [lo, hi];
}

// ---------- Rows → draft program ----------

type Columns = {
  day?: number;
  week?: number;
  exercise: number;
  sets?: number;
  reps?: number;
  rest?: number;
  effort?: number;
  notes?: number;
  rir: boolean;
};

const HEADERS: [keyof Omit<Columns, "rir">, RegExp][] = [
  ["week", /^week/i],
  ["day", /^(day|workout|session|split)/i],
  ["exercise", /exercise|movement|^lift|^name$/i],
  ["sets", /^sets?\b/i],
  ["reps", /^(reps?\b|rep range|target|time|distance)/i],
  ["rest", /^rest/i],
  ["effort", /rpe|rir|effort|intensity/i],
  ["notes", /note|cue|comment/i],
];

function headerColumns(row: string[]): Columns | null {
  const found: Partial<Columns> = {};
  row.forEach((cell, i) => {
    const hit = HEADERS.find(
      ([k, re]) => found[k] === undefined && re.test(cell.trim()),
    );
    if (hit) found[hit[0]] = i;
  });
  if (found.exercise === undefined) return null;
  return {
    ...found,
    exercise: found.exercise,
    rir:
      found.effort !== undefined &&
      /rir|reserve/i.test(row[found.effort] ?? "") &&
      !/rpe/i.test(row[found.effort] ?? ""),
  };
}

const filled = (row: string[]) => row.filter((c) => c.trim());

/** Turns sheet rows into a draft program; `name` is the program name (usually the file name). */
export function importRows(rows: string[][], name = ""): SheetImport {
  const at = rows.slice(0, 10).findIndex((r) => headerColumns(r));
  const cols: Columns =
    at >= 0
      ? headerColumns(rows[at])!
      : // No header: day, exercise, sets, reps, rest, effort, unless the second cell is a number.
        /^\d/.test(rows.find((r) => filled(r).length > 1)?.[1] ?? "")
        ? { exercise: 0, sets: 1, reps: 2, rest: 3, effort: 4, rir: false }
        : {
            day: 0,
            exercise: 1,
            sets: 2,
            reps: 3,
            rest: 4,
            effort: 5,
            rir: false,
          };

  const days: (TrainingDay & { notes: string[] })[] = [];
  const unmatched: Unmatched[] = [];
  const weeks = new Set<string>();
  let firstWeek: string | null = null;
  let current: (TrainingDay & { notes: string[] }) | null = null;
  const dayNamed = (label: string) => {
    let d = days.find((x) => x.name.toLowerCase() === label.toLowerCase());
    if (!d) {
      d = { id: uid("d"), name: label, exercises: [], notes: [] };
      days.push(d);
    }
    return d;
  };
  const cell = (row: string[], i?: number) =>
    i === undefined ? "" : (row[i] ?? "").trim();

  rows.forEach((row, ri) => {
    if (ri <= at || !filled(row).length) return;
    const only = filled(row);
    // A row with one cell that isn't an exercise is a day title, e.g. "Day 1 – Push".
    if (only.length === 1 && !matchExercise(only[0])) {
      current = dayNamed(only[0]);
      return;
    }
    const week = cell(row, cols.week);
    if (week) {
      weeks.add(week);
      firstWeek ??= week;
    }
    // Later weeks repeat the same days; the first one is the template.
    if (week && week !== firstWeek) return;

    let raw = cell(row, cols.exercise);
    const day = cell(row, cols.day);
    if (!raw && only.length === 1) raw = only[0];
    if (!raw) {
      if (day) current = dayNamed(day);
      return;
    }
    if (day) current = dayNamed(day);
    current ??= dayNamed("Day 1");

    const setsCell = parseSetsReps(cell(row, cols.sets));
    const repsCell = cell(row, cols.reps);
    const fromReps = parseSetsReps(repsCell);
    const match = matchExercise(raw);
    const exName = match ?? raw;
    const reps =
      setsCell.reps ??
      (fromReps.sets !== undefined && fromReps.reps
        ? fromReps.reps
        : repsCell
          ? cleanReps(repsCell)
          : defaultTarget(exName));
    const sets = Math.min(
      10,
      Math.max(
        1,
        setsCell.sets ??
          (fromReps.reps ? fromReps.sets : undefined) ??
          (typeOf(exName) === "distance_duration" ? 1 : 3),
      ),
    );
    const rest =
      parseRest(cell(row, cols.rest)) ??
      (typeOf(exName) === "distance_duration" ? 0 : restFor(exName));
    const rpe = parseEffort(cell(row, cols.effort), cols.rir) ?? undefined;
    const ex: PlannedExercise = {
      id: uid("e"),
      name: exName,
      sets,
      reps,
      restSec: Math.min(600, rest),
      ...(rpe ? { rpe } : {}),
    };
    current.exercises.push(ex);
    const note = cell(row, cols.notes);
    if (note) current.notes.push(`${exName}: ${note}`);
    if (!match)
      unmatched.push({
        dayId: current.id,
        exerciseId: ex.id,
        raw,
        row: ri + 1,
      });
  });

  const program: TrainingProgram = {
    name: name.replace(/\.(csv|tsv|txt|xlsx|xls)$/i, "").trim(),
    weeks: Math.min(24, Math.max(1, weeks.size || 8)),
    days: days
      .filter((d) => d.exercises.length)
      .map(({ notes, ...d }) =>
        notes.length ? { ...d, note: notes.join("\n") } : d,
      ),
  };
  return { program, unmatched };
}

// ---------- Fixing the draft ----------

/** Swap an unmatched row for a library exercise. */
export function fixUnmatched(
  imp: SheetImport,
  exerciseId: string,
  name: string,
): SheetImport {
  return {
    program: {
      ...imp.program,
      days: imp.program.days.map((d) => ({
        ...d,
        exercises: d.exercises.map((e) =>
          e.id === exerciseId ? { ...e, name } : e,
        ),
      })),
    },
    unmatched: imp.unmatched.filter((u) => u.exerciseId !== exerciseId),
  };
}

/** Leave an unmatched row out; a day left empty goes too. */
export function dropUnmatched(
  imp: SheetImport,
  exerciseId: string,
): SheetImport {
  return {
    program: {
      ...imp.program,
      days: imp.program.days
        .map((d) => ({
          ...d,
          exercises: d.exercises.filter((e) => e.id !== exerciseId),
        }))
        .filter((d) => d.exercises.length),
    },
    unmatched: imp.unmatched.filter((u) => u.exerciseId !== exerciseId),
  };
}

/** "14 exercises · 4 days". */
export const importSummary = (imp: SheetImport) => {
  const n = imp.program.days.reduce((k, d) => k + d.exercises.length, 0);
  const d = imp.program.days.length;
  return `${n} ${n === 1 ? "exercise" : "exercises"} · ${d} ${d === 1 ? "day" : "days"}`;
};
