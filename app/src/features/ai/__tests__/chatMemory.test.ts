// D109: today's AI chat is kept on the phone only, for today only.
import { describe, expect, it } from "@jest/globals";

import { CHAT_KEEP, type ChatMsg, fromSaved, toSave } from "../chatMemory";

const today = "2026-11-14";
const q: ChatMsg = { from: "me", text: "How much protein?" };
const a: ChatMsg = {
  from: "ai",
  text: "About 1.6 g per kg.",
  kind: "answer",
  sources: ["morton2018"],
};

describe("toSave", () => {
  it("never saves a message still waiting for the server", () => {
    const s = toSave(today, [
      q,
      { from: "ai", text: "Thinking…", pending: true },
    ]);
    expect(s).toEqual({ date: today, msgs: [q] });
  });
  it("keeps only the newest messages", () => {
    const many = Array.from({ length: CHAT_KEEP + 10 }, (_, i) => ({
      from: "me" as const,
      text: `q${i}`,
    }));
    const s = toSave(today, many);
    expect(s.msgs).toHaveLength(CHAT_KEEP);
    expect(s.msgs[0].text).toBe("q10");
  });
  it("saves only the message fields", () => {
    const s = toSave(today, [{ ...a, extra: "x" } as ChatMsg]);
    expect(s.msgs[0]).toEqual(a);
  });
});

describe("fromSaved", () => {
  it("gives back today's chat", () => {
    expect(fromSaved(toSave(today, [q, a]), today)).toEqual([q, a]);
  });
  it("drops yesterday's chat", () => {
    expect(fromSaved(toSave("2026-11-13", [q, a]), today)).toEqual([]);
  });
  it("ignores damaged data", () => {
    expect(fromSaved(null, today)).toEqual([]);
    expect(fromSaved("x", today)).toEqual([]);
    expect(fromSaved({ date: today, msgs: "x" }, today)).toEqual([]);
    expect(
      fromSaved(
        {
          date: today,
          msgs: [
            { from: "bot", text: "x" },
            { from: "me" },
            q,
            { ...a, kind: "evil" },
          ],
        },
        today,
      ),
    ).toEqual([q, { from: "ai", text: a.text, sources: a.sources }]);
  });
});
