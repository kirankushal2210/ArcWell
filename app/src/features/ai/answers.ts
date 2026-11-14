// AI chat answers (D70), sample build: no model. A few common questions are answered from the
// evidence rules (D69) with their sources; out-of-scope topics get "I can't help with that" (D22);
// anything else says plainly that it's a sample.
import { DELOAD, SLEEP_NEED_H } from "@/features/science/rules";

export type Answer = {
  kind: "answer" | "out_of_scope" | "sample";
  text: string;
  sources: string[];
};

/** Contest prep, injury rehab, medical questions and PEDs aren't for an AI coach (D22). */
const OUT_OF_SCOPE =
  /contest|show prep|peak week|stage|rehab|physio|injur|torn|fracture|surgery|diabet|pregnan|medicat|blood pressure|thyroid|steroid|ped\b|sarm|trt|testosterone|eating disorder|supplement|creatine|nootropic/i;

export function answer(
  q: string,
  ctx: { protein?: number; kcal?: number },
): Answer {
  const t = q.toLowerCase();
  if (OUT_OF_SCOPE.test(t))
    return {
      kind: "out_of_scope",
      text: "I can't help with that. For injuries, medical conditions, contest prep, supplements or performance drugs, please talk to a doctor, physiotherapist or qualified coach. I can still help with your everyday training, food and sleep.",
      sources: [],
    };
  if (/protein/.test(t))
    return {
      kind: "answer",
      text: `${ctx.protein ? `Your target is ${ctx.protein} g a day. ` : ""}Muscle gains level off around 1.6 g per kg of bodyweight a day on average, and up to about 2.2 g may help those wanting the most. Spreading it over your meals makes it easier to hit.`,
      sources: ["morton2018", "jager2017"],
    };
  if (/sleep|tired|nap/.test(t))
    return {
      kind: "answer",
      text: `Adults do best on ${SLEEP_NEED_H[0]} to ${SLEEP_NEED_H[1]} hours a night. After a short night, especially a late bedtime, performance the next day drops on average, so a lighter session can be the smarter choice.`,
      sources: ["hirshkowitz2015", "watson2015", "craven2022"],
    };
  if (/set|volume|how much (should i )?train/.test(t))
    return {
      kind: "answer",
      text: "More hard sets a week build more muscle, with smaller gains for each extra set. Aim for about 10 to 20 hard sets per muscle a week; fewer still works. Weekly sets matter more than how many days you split them over.",
      sources: [
        "schoenfeld2017volume",
        "pelland2026",
        "schoenfeld2019frequency",
      ],
    };
  if (/failure|rir|reps in reserve|how hard/.test(t))
    return {
      kind: "answer",
      text: "End most sets with 0 to 3 good reps left. Growth rises as you get closer to failure, but going all the way adds at most a little and costs more fatigue.",
      sources: ["refalo2023", "robinson2024", "helms2016rir"],
    };
  if (/deload|rest week|lighter week/.test(t))
    return {
      kind: "answer",
      text: `${DELOAD.text} ${DELOAD.evidence}`,
      sources: ["rogerson2024deload", "bell2023deload"],
    };
  if (/lose|fat loss|cut|weight loss|how fast/.test(t))
    return {
      kind: "answer",
      text: `Lose about 0.5 to 1% of your bodyweight a week. Slower loss kept more muscle in athletes${ctx.kcal ? `; your ${ctx.kcal.toLocaleString("en-IN")} kcal target is set for that` : ""}.`,
      sources: ["helms2014", "garthe2011"],
    };
  if (/rest between|rest time|how long.*rest/.test(t))
    return {
      kind: "answer",
      text: "Two to three minutes on big lifts like squats, presses and rows; about one to two on smaller exercises. One trial found 3 minutes beat 1 minute for strength and growth.",
      sources: ["schoenfeld2016rest"],
    };
  return {
    kind: "sample",
    text: "This is a sample build, so I can only answer a few common questions for now: protein, sleep, sets, how hard to train, deloads, rest and fat loss. In the full app I answer from your own logs.",
    sources: [],
  };
}

export const PROMPTS = [
  "How much protein do I need?",
  "How many sets should I do?",
  "How hard should each set be?",
  "I slept badly. Should I train?",
  "How fast should I lose fat?",
];
