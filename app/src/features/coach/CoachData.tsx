// Holds the coach's sample data in memory so actions feel real while there is no backend:
// assigning a plan, replying to a check-in, sending a message, changing a client's status, notes.
import { createContext, type ReactNode, useContext, useState } from "react";

import type { ClientStatus } from "@/components/primitives";

import {
  type Client,
  type Lead,
  sampleClients,
  sampleLeads,
  sampleTemplates,
  type Template,
} from "./sampleData";

type CoachData = {
  clients: Client[];
  templates: Template[];
  leads: Lead[];
  client: (id: string) => Client | undefined;
  assignPlan: (id: string, training: string, meals: string) => void;
  reply: (clientId: string, checkInId: string, text: string) => void;
  send: (clientId: string, text: string) => void;
  markRead: (clientId: string) => void;
  setStatus: (clientId: string, status: ClientStatus) => void;
  setNotes: (clientId: string, notes: string) => void;
  remind: (clientId: string) => void;
  reminded: string[];
};

const Ctx = createContext<CoachData | null>(null);

const nowTime = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

export function CoachDataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState(sampleClients);
  const [reminded, setReminded] = useState<string[]>([]);
  const update = (id: string, patch: (c: Client) => Partial<Client>) =>
    setClients((all) =>
      all.map((c) => (c.id === id ? { ...c, ...patch(c) } : c)),
    );

  const value: CoachData = {
    clients,
    templates: sampleTemplates,
    leads: sampleLeads,
    reminded,
    client: (id) => clients.find((c) => c.id === id),
    assignPlan: (id, training, meals) =>
      update(id, () => ({
        isNew: false,
        plan: { training, meals },
        line: "Plan assigned · starts Monday",
        attention: undefined,
      })),
    reply: (clientId, checkInId, text) =>
      update(clientId, (c) => ({
        checkIns: c.checkIns.map((k) =>
          k.id === checkInId ? { ...k, reviewed: true, reply: text } : k,
        ),
        attention: c.attention?.startsWith("Check-in to review")
          ? undefined
          : c.attention,
      })),
    send: (clientId, text) =>
      update(clientId, (c) => ({
        messages: [...c.messages, { from: "coach", text, time: nowTime() }],
      })),
    markRead: (clientId) => update(clientId, () => ({ unread: 0 })),
    setStatus: (clientId, status) =>
      update(clientId, (c) => ({
        status,
        line:
          status === "paused"
            ? "Paused"
            : status === "leaving"
              ? "Leaving at the end of this cycle"
              : status === "completed"
                ? "Coaching completed"
                : c.line,
      })),
    setNotes: (clientId, notes) => update(clientId, () => ({ notes })),
    remind: (clientId) => setReminded((r) => [...r, clientId]),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCoachData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCoachData must be used inside CoachDataProvider");
  return v;
}

/** Clients the coach should look at first (K-01): open check-ins, overdue, low adherence, unread. */
export const needsAttention = (c: Client) =>
  !c.isNew &&
  (c.status === "active" || c.status === "leaving") &&
  (!!c.attention || c.unread > 0);
