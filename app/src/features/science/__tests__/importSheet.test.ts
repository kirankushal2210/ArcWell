// Spreadsheet import (D55, CO-10): CSV and .xlsx into a draft program, names matched to the library.
import { describe, expect, it } from "@jest/globals";
import { strToU8, zipSync } from "fflate";

import {
  cleanReps,
  dropUnmatched,
  fixUnmatched,
  importRows,
  matchExercise,
  parseCsv,
  parseEffort,
  parseRest,
  readXlsx,
  rowsFromFile,
} from "@/features/coach/importSheet";

const CSV = `Day,Exercise,Sets,Reps,Rest,RPE
Push,Barbell bench press,4,6-8,2 min,8
,DB shoulder press,3,10,90s,7-8
,"Pushdown, my way",3,12,60,
Pull,Pull-ups,3,AMRAP,2:00,RIR 1
,Romanian deadlift,3x10,,,
Pull,Lat pulldown,3,10,,
`;

describe("CSV", () => {
  it("reads quoted cells and blank lines", () => {
    const rows = parseCsv(CSV);
    expect(rows[3]).toEqual(["", "Pushdown, my way", "3", "12", "60", ""]);
    expect(parseCsv("a;b;c\n1;2;3")[1]).toEqual(["1", "2", "3"]);
    expect(parseCsv("a\tb\n1\t2")[1]).toEqual(["1", "2"]);
  });

  it("builds days and exercises, matching names to the library", () => {
    const { program, unmatched } = importRows(parseCsv(CSV), "Push pull.csv");
    expect(program.name).toBe("Push pull");
    expect(program.days.map((d) => d.name)).toEqual(["Push", "Pull"]);
    const [push, pull] = program.days;
    expect(push.exercises[0]).toMatchObject({
      name: "Bench press (barbell)",
      sets: 4,
      reps: "6–8",
      restSec: 120,
      rpe: [8, 8],
    });
    expect(push.exercises[1]).toMatchObject({
      name: "Shoulder press (dumbbell)",
      restSec: 90,
      rpe: [7, 8],
    });
    // RIR 1 is RPE 9; "3x10" in the sets column carries the reps.
    expect(pull.exercises[0]).toMatchObject({
      name: "Pull up",
      reps: "AMRAP",
      restSec: 120,
      rpe: [9, 9],
    });
    expect(pull.exercises[1]).toMatchObject({
      name: "Romanian deadlift (barbell)",
      sets: 3,
      reps: "10",
    });
    // The second "Pull" block joins the same day.
    expect(pull.exercises.map((e) => e.name)).toContain("Lat pulldown (cable)");
    expect(unmatched.map((u) => u.raw)).toEqual(["Pushdown, my way"]);
    expect(unmatched[0].row).toBe(4);
  });

  it("reads day title rows and keeps only the first week", () => {
    const rows = parseCsv(
      [
        "Week,Exercise,Sets,Reps",
        "Day 1 - Legs,,,",
        "1,Back squat,5,5",
        "1,Plank,3,40s",
        "2,Back squat,5,4",
        "3,Back squat,5,3",
      ].join("\n"),
    );
    const { program } = importRows(rows);
    expect(program.weeks).toBe(3);
    expect(program.days).toHaveLength(1);
    expect(program.days[0].name).toBe("Day 1 - Legs");
    expect(program.days[0].exercises.map((e) => [e.name, e.reps])).toEqual([
      ["Squat (barbell)", "5"],
      ["Plank", "40 s"],
    ]);
  });

  it("works without a header row", () => {
    const { program } = importRows(
      parseCsv("Upper,Bench press,3,10\nUpper,Dumbbell row,3,10"),
    );
    expect(program.days[0].exercises.map((e) => e.name)).toEqual([
      "Bench press (barbell)",
      "Dumbbell row",
    ]);
  });
});

describe("cells", () => {
  it("rest, effort and reps", () => {
    expect(parseRest("90")).toBe(90);
    expect(parseRest("1:30")).toBe(90);
    expect(parseRest("1.5 min")).toBe(90);
    expect(parseRest("2'")).toBe(120);
    expect(parseRest("long")).toBeNull();
    expect(parseEffort("RPE 7-8")).toEqual([7, 8]);
    expect(parseEffort("2", true)).toEqual([8, 8]);
    expect(parseEffort("12")).toEqual([10, 10]);
    expect(parseEffort("")).toBeNull();
    expect(cleanReps("8 to 10")).toBe("8–10");
    expect(cleanReps("20min")).toBe("20 min");
    expect(cleanReps("400M")).toBe("400 m");
  });

  it("matches common spellings, not guesses", () => {
    expect(matchExercise("barbell squat")).toBe("Squat (barbell)");
    expect(matchExercise("Push-ups")).toBe("Push up");
    expect(matchExercise("RDL")).toBe("Romanian deadlift (barbell)");
    expect(matchExercise("Zercher squat")).toBe("Zercher squat");
    expect(matchExercise("Monkey bar swing")).toBeNull();
  });
});

/** A minimal .xlsx: shared strings, an inline string and numbers, as Excel and Sheets write them. */
function tinyXlsx() {
  const shared = [
    "Day",
    "Exercise",
    "Sets",
    "Reps",
    "Legs",
    "Leg press",
    "10-12",
    "Sled &amp; stuff",
  ];
  const sst = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${shared.length}">${shared
    .map((t, i) =>
      i === 5
        ? `<si><r><t>Leg </t></r><r><t>press</t></r></si>`
        : `<si><t>${t}</t></si>`,
    )
    .join("")}</sst>`;
  const s = (ref: string, i: number) => `<c r="${ref}" t="s"><v>${i}</v></c>`;
  const n = (ref: string, v: number) => `<c r="${ref}"><v>${v}</v></c>`;
  const sheet = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
<row r="1">${s("A1", 0)}${s("B1", 1)}${s("C1", 2)}${s("D1", 3)}</row>
<row r="2">${s("A2", 4)}${s("B2", 5)}${n("C2", 3)}${s("D2", 6)}</row>
<row r="4"><c r="B4" t="inlineStr"><is><t>Walking lunge</t></is></c>${n("C4", 2)}${n("D4", 12)}</row>
<row r="5">${s("B5", 7)}${n("C5", 1)}</row>
</sheetData></worksheet>`;
  return zipSync({
    "[Content_Types].xml": strToU8("<Types/>"),
    "xl/workbook.xml": strToU8("<workbook/>"),
    "xl/sharedStrings.xml": strToU8(sst),
    "xl/worksheets/sheet1.xml": strToU8(sheet),
  });
}

describe("xlsx", () => {
  it("reads shared strings, inline strings, numbers and gaps", () => {
    const rows = readXlsx(tinyXlsx());
    expect(rows[0]).toEqual(["Day", "Exercise", "Sets", "Reps"]);
    expect(rows[1]).toEqual(["Legs", "Leg press", "3", "10-12"]);
    expect(rows[2]).toEqual([]);
    expect(rows[3]).toEqual(["", "Walking lunge", "2", "12"]);
    expect(rows[4][1]).toBe("Sled & stuff");
  });

  it("turns into a draft program with the unknown row flagged", () => {
    const imp = importRows(rowsFromFile(tinyXlsx(), "legs.xlsx"), "legs.xlsx");
    const legs = imp.program.days[0];
    expect(legs.name).toBe("Legs");
    expect(legs.exercises.map((e) => [e.name, e.sets, e.reps])).toEqual([
      ["Leg press (machine)", 3, "10–12"],
      ["Walking lunge", 2, "12"],
      ["Sled & stuff", 1, "10"],
    ]);
    expect(imp.unmatched).toHaveLength(1);

    const fixed = fixUnmatched(imp, imp.unmatched[0].exerciseId, "Sled push");
    expect(fixed.unmatched).toHaveLength(0);
    expect(fixed.program.days[0].exercises[2].name).toBe("Sled push");

    const dropped = dropUnmatched(imp, imp.unmatched[0].exerciseId);
    expect(dropped.program.days[0].exercises).toHaveLength(2);
  });

  it("rejects files that aren't a sheet", () => {
    expect(() => rowsFromFile(new Uint8Array([1, 2, 3]), "plan.pdf")).toThrow();
    expect(() => readXlsx(new Uint8Array([0x50, 0x4b, 0, 0]))).toThrow();
  });
});
