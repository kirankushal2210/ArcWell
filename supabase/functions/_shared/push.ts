// Push through Expo's free push service, shared by `notify` (events) and `cron` (scheduled
// reminders). Pure apart from fetch, so the ticket rules are unit-tested in Jest.
// Pushes never carry health data or message text: only who and what kind.

export type Push = { title: string; body: string; data: Record<string, string> };

/** Expo accepts at most 100 messages per request. */
export const CHUNK = 100;

/** Tokens Expo says are no longer registered (app removed, or notifications reset): delete them. */
export function deadTokens(tokens: string[], res: unknown): string[] {
  const tickets = (res as { data?: unknown } | null)?.data;
  if (!Array.isArray(tickets)) return [];
  return tokens.filter((_, i) => {
    const t = tickets[i] as { status?: string; details?: { error?: string } } | undefined;
    return t?.status === "error" && t.details?.error === "DeviceNotRegistered";
  });
}

/** Sends one push to every token. Returns how many Expo accepted and which tokens are dead. */
export async function sendPush(tokens: string[], push: Push) {
  let sent = 0;
  const dead: string[] = [];
  for (let i = 0; i < tokens.length; i += CHUNK) {
    const part = tokens.slice(i, i + CHUNK);
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(part.map((to) => ({ to, ...push, sound: "default" }))),
    }).catch(() => null);
    if (!res?.ok) continue;
    const json = await res.json().catch(() => null);
    const gone = deadTokens(part, json);
    dead.push(...gone);
    sent += part.length - gone.length;
  }
  return { sent, dead };
}
