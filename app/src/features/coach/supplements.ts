// Supplements (D64): an optional list for any client: name, amount, when, and a note. Coaches keep
// reusable stacks in Plans and give a client their own copy, like training and meal templates.

export type Supplement = {
  id: string;
  name: string;
  /** As the coach writes it, e.g. "5 g", "1 scoop", "2,000 IU". */
  amount: string;
  /** When to take it, e.g. "After training", "With breakfast". */
  timing: string;
  note?: string;
};

export type Stack = { id: string; name: string; items: Supplement[] };

let seq = 0;
export const supId = (p = "s") =>
  `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export const TIMINGS = [
  "Morning",
  "With breakfast",
  "Before training",
  "After training",
  "With dinner",
  "Before bed",
];

const item = (
  name: string,
  amount: string,
  timing: string,
  note?: string,
): Supplement => ({
  id: supId(),
  name,
  amount,
  timing,
  note,
});

/** Sample stacks: common, well-studied basics a coach might start from. */
export function sampleStacks(): Stack[] {
  return [
    {
      id: "st1",
      name: "Basics",
      items: [
        item(
          "Whey protein",
          "1 scoop",
          "After training",
          "Or with breakfast on rest days",
        ),
        item("Creatine monohydrate", "5 g", "Morning", "Every day, with water"),
        item(
          "Vitamin D3",
          "1,000 IU",
          "With breakfast",
          "Check levels with a blood test first",
        ),
      ],
    },
    {
      id: "st2",
      name: "Vegetarian basics",
      items: [
        item("Plant or whey protein", "1 scoop", "After training"),
        item("Creatine monohydrate", "5 g", "Morning"),
        item(
          "Vitamin B12",
          "As your doctor advises",
          "With breakfast",
          "Common gap on vegetarian diets",
        ),
        item("Omega-3 (algae)", "1 capsule", "With dinner"),
      ],
    },
  ];
}

export const cloneItems = (items: Supplement[]) =>
  items.map((s) => ({ ...s, id: supId() }));
