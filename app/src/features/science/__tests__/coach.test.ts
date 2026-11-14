// The AI coach's guardrails (B8): what reaches the model, and what's accepted from it.
import { describe, expect, it } from "@jest/globals";

import {
  cleanContext,
  OUT_OF_SCOPE,
  parseChat,
  parseReview,
  parseTailor,
  rulesChat,
  rulesReview,
  rulesTailor,
  SOURCES,
} from "../../../../../supabase/functions/_shared/ai/coach";
import { SOURCES as APP_SOURCES } from "@/features/science/sources";

describe("AI coach guardrails", () => {
  it("only cites sources the app's Sources page lists", () => {
    for (const id of Object.keys(SOURCES))
      expect(APP_SOURCES).toHaveProperty(id);
  });

  it("keeps out-of-scope questions away from the model", () => {
    for (const q of [
      "How do I rehab my torn ACL?",
      "Best steroid cycle?",
      "Should I take creatine?",
      "Peak week for my contest",
      "I'm diabetic, what should I eat?",
    ])
      expect(OUT_OF_SCOPE.test(q)).toBe(true);
    expect(rulesChat("Should I take creatine?", {}).kind).toBe("out_of_scope");
    expect(OUT_OF_SCOPE.test("How much protein do I need?")).toBe(false);
  });

  it("sends only known numbers in sane ranges", () => {
    const c = cleanContext({
      proteinTarget: 140,
      avgSleepH: 99,
      kcalTarget: "2000",
      email: "x@y.z",
      goal: "Lose fat <script>",
    });
    expect(c).toEqual({
      goal: "Lose fat script",
      proteinTarget: 140,
      kcalTarget: undefined,
      workoutsDone: undefined,
      workoutsPlanned: undefined,
      avgKcal: undefined,
      avgProtein: undefined,
      avgSleepH: undefined,
      weightChangeKg: undefined,
    });
  });

  it("accepts a model's chat answer only in shape, and drops unknown sources", () => {
    expect(parseChat("not json")).toBeNull();
    expect(parseChat(JSON.stringify({ text: "ok" }))).toBeNull();
    const a = parseChat(
      JSON.stringify({
        text: "Aim for 140 g of protein spread over your meals.",
        sources: ["morton2018", "made-up-2030"],
      }),
    );
    expect(a?.sources).toEqual(["morton2018"]);
  });

  it("lets tailoring pick only the fixed options", () => {
    expect(
      parseTailor(JSON.stringify({ kinds: ["knee", "skip_legs", "knee"] })),
    ).toEqual(["knee"]);
    expect(parseTailor("{}")).toBeNull();
    expect(rulesTailor("My knee hurts and I only have 30 minutes")).toEqual([
      "knee",
      "minutes30",
    ]);
    expect(rulesTailor("knee is sore today")).toEqual(["knee"]);
    expect(rulesTailor("so sore from yesterday")).toEqual(["trim"]);
  });

  it("keeps review suggestions to known actions and safe topics", () => {
    const tips = parseReview(
      JSON.stringify({
        tips: [
          {
            title: "More protein",
            text: "You averaged 110 g against 140 g.",
            action: "nutrition",
            sources: ["morton2018"],
          },
          {
            title: "Try this",
            text: "Take a creatine supplement daily.",
            action: "nutrition",
            sources: [],
          },
          {
            title: "Buy shoes",
            text: "New shoes will help your squat.",
            action: "shop",
            sources: [],
          },
        ],
      }),
    );
    expect(tips?.map((t) => t.title)).toEqual(["More protein"]);
  });

  it("answers from the rules when there's no model", () => {
    expect(
      rulesChat("How much protein?", { proteinTarget: 140, avgProtein: 112 })
        .text,
    ).toContain("averaged 112 g");
    const tips = rulesReview({
      proteinTarget: 140,
      avgProtein: 100,
      avgSleepH: 6.2,
      workoutsDone: 2,
      workoutsPlanned: 4,
    });
    expect(tips.map((t) => t.action)).toEqual([
      "nutrition",
      "recovery",
      "tailor",
    ]);
    expect(rulesReview({})[0].action).toBe("keep_going");
  });
});
