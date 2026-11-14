// AI chat memory (D109): today's AI coach chat stays on this phone so it's still there when the
// athlete comes back, and nothing more. It is never stored on the server and never sent back to the
// model (each question stands alone, with only week-level numbers). It ends with the day, the same
// midnight the daily cap resets, and it's wiped on sign-out, account deletion and when AI is turned off.
//
// Pure rules here (unit-tested); the phone storage is in chatStore.ts.

export type ChatMsg = {
  from: "me" | "ai";
  text: string;
  kind?: "answer" | "out_of_scope" | "unknown" | "sample";
  sources?: string[];
  /** Waiting for the server's answer. Never saved. */
  pending?: boolean;
};

export type SavedChat = { date: string; msgs: ChatMsg[] };

/** Today's 40 questions and their answers. */
export const CHAT_KEEP = 80;

const FROMS = new Set(["me", "ai"]);
const KINDS = new Set(["answer", "out_of_scope", "unknown", "sample"]);

/** What to save: finished messages only, the newest CHAT_KEEP. */
export function toSave(date: string, msgs: ChatMsg[]): SavedChat {
  return {
    date,
    msgs: msgs
      .filter((m) => !m.pending)
      .slice(-CHAT_KEEP)
      .map(({ from, text, kind, sources }) => ({
        from,
        text,
        ...(kind ? { kind } : {}),
        ...(sources?.length ? { sources } : {}),
      })),
  };
}

/** What a saved chat gives back: today's messages, checked, or nothing (another day, or damaged). */
export function fromSaved(raw: unknown, today: string): ChatMsg[] {
  if (!raw || typeof raw !== "object") return [];
  const { date, msgs } = raw as { date?: unknown; msgs?: unknown };
  if (date !== today || !Array.isArray(msgs)) return [];
  return msgs
    .filter(
      (m): m is ChatMsg =>
        !!m &&
        typeof m === "object" &&
        FROMS.has((m as ChatMsg).from) &&
        typeof (m as ChatMsg).text === "string",
    )
    .slice(-CHAT_KEEP)
    .map((m) => ({
      from: m.from,
      text: m.text,
      ...(m.kind && KINDS.has(m.kind) ? { kind: m.kind } : {}),
      ...(Array.isArray(m.sources)
        ? { sources: m.sources.filter((s) => typeof s === "string") }
        : {}),
    }));
}
