import { describe, expect, it } from "@jest/globals";

import { OPERATOR } from "../docs";
import { REPORT_SUBJECT, reportCoachLink } from "../report";

const parse = (link: string) => {
  const [to, query] = link.replace(/^mailto:/, "").split("?");
  return { to, params: new URLSearchParams(query) };
};

describe("reportCoachLink", () => {
  it("goes to the support inbox and names the coach", () => {
    const { to, params } = parse(reportCoachLink("Coach Anjali"));
    expect(to).toBe(OPERATOR.supportEmail);
    expect(params.get("subject")).toBe(`${REPORT_SUBJECT}: Coach Anjali`);
    expect(params.get("body")).toMatch(/what's wrong/);
  });

  it("encodes names safely", () => {
    const { params } = parse(reportCoachLink("A&B ?=#"));
    expect(params.get("subject")).toBe(`${REPORT_SUBJECT}: A&B ?=#`);
  });

  it("still works without a name, and caps a long one", () => {
    expect(parse(reportCoachLink("  ")).params.get("subject")).toBe(
      REPORT_SUBJECT,
    );
    expect(
      parse(reportCoachLink("x".repeat(200))).params.get("subject"),
    ).toHaveLength(REPORT_SUBJECT.length + 2 + 80);
  });
});
