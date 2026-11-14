import {
  isLegalSlug,
  LEGAL_DOCS,
  LEGAL_ORDER,
  parseInline,
} from "@/features/legal/docs";

const allText = (slug: keyof typeof LEGAL_DOCS) => {
  const d = LEGAL_DOCS[slug];
  return [
    d.summary,
    ...d.sections.flatMap((s) =>
      s.blocks.flatMap((b) => (typeof b === "string" ? [b] : b.list)),
    ),
  ];
};

describe("legal pages", () => {
  it("parses bold runs and links", () => {
    expect(parseInline("See **this** and [that](doc:terms).")).toEqual([
      { text: "See " },
      { text: "this", bold: true },
      { text: " and " },
      { text: "that", href: "doc:terms" },
      { text: "." },
    ]);
  });

  it("only links to pages that exist, email or https", () => {
    for (const slug of LEGAL_ORDER)
      for (const t of allText(slug))
        for (const r of parseInline(t))
          if (r.href) {
            if (r.href.startsWith("doc:"))
              expect(isLegalSlug(r.href.slice(4))).toBe(true);
            else expect(r.href).toMatch(/^(mailto:|https:\/\/)/);
          }
  });

  it("says Arcwell is for adults, matching the onboarding age picker", () => {
    expect(allText("privacy").join(" ")).toMatch(/18 and over/);
    expect(allText("terms").join(" ")).toMatch(/18 or older/);
  });
});
