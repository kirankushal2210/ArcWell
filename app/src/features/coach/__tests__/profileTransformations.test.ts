// Which transformation photos show on the coach profile (F9-05, D43).
import { describe, expect, it } from "@jest/globals";

import type { Transformation } from "@/features/athlete/athleteData";

import { profileTransformations } from "../profileTransformations";

const t = (patch: Partial<Transformation>): Transformation => ({
  id: "t1",
  coachName: "Coach Anjali",
  requestedAt: "1 Nov",
  before: { label: "Week 1" },
  after: { label: "Week 12" },
  caption: "",
  message: "",
  uses: ["profile"],
  status: "approved",
  blurFace: true,
  showName: false,
  crop: "full",
  onProfile: true,
  ...patch,
});

describe("profileTransformations", () => {
  const on = { showTransformations: true };

  it("shows approved photos marked for the profile", () => {
    const out = profileTransformations(
      [{ id: "c1", name: "Priya Sharma", transformations: [t({})] }],
      on,
    );
    expect(out).toHaveLength(1);
    expect(out[0].key).toBe("c1~t1");
    expect(out[0].name).toBeUndefined();
  });

  it("hides withdrawn, declined and waiting photos", () => {
    const out = profileTransformations(
      [
        {
          id: "c1",
          name: "Priya",
          transformations: [
            t({ id: "a", status: "withdrawn" }),
            t({ id: "b", status: "declined" }),
            t({ id: "c", status: "waiting" }),
          ],
        },
      ],
      on,
    );
    expect(out).toEqual([]);
  });

  it("hides photos not approved for the profile or switched off", () => {
    const out = profileTransformations(
      [
        {
          id: "c1",
          name: "Priya",
          transformations: [
            t({ id: "a", uses: ["instagram"], onProfile: true }),
            t({ id: "b", onProfile: false }),
          ],
        },
      ],
      on,
    );
    expect(out).toEqual([]);
  });

  it("shows nothing when the coach turned transformations off", () => {
    const out = profileTransformations(
      [{ id: "c1", name: "Priya", transformations: [t({})] }],
      { showTransformations: false },
    );
    expect(out).toEqual([]);
  });

  it("shows the first name only when the athlete chose to", () => {
    const out = profileTransformations(
      [
        {
          id: "c1",
          name: "Priya Sharma",
          transformations: [t({ showName: true })],
        },
      ],
      on,
    );
    expect(out[0].name).toBe("Priya");
  });
});
