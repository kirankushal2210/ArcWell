// Which transformation photos show on the coach's profile (D43, F9-05): only ones the athlete
// approved for "My Arcwell profile", that the coach switched on, while the coach shows
// transformations at all. Withdrawn, declined and waiting photos never show.
import type { Transformation } from "@/features/athlete/athleteData";

import type { CoachSettings } from "./coachProfile";

type WithTransformations = {
  id: string;
  name: string;
  transformations?: Transformation[];
};

export type ProfileTransformation = {
  key: string;
  t: Transformation;
  /** The athlete's first name, only when they chose to show it. */
  name?: string;
};

export function profileTransformations(
  clients: WithTransformations[],
  settings: Pick<CoachSettings, "showTransformations">,
): ProfileTransformation[] {
  if (!settings.showTransformations) return [];
  return clients.flatMap((c) =>
    (c.transformations ?? [])
      .filter(
        (t) =>
          t.status === "approved" && t.uses.includes("profile") && t.onProfile,
      )
      .map((t) => ({
        key: `${c.id}~${t.id}`,
        t,
        name: t.showName ? c.name.split(" ")[0] : undefined,
      })),
  );
}
