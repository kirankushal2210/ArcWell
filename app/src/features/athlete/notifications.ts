// Notifications (N-06): the SPEC's athlete types, built from what's already in the app. Each type
// shows only where it applies (coach types only for coached athletes) and only while its switch is
// on. Sample build: the real list is stored server-side and delivered with Expo Notifications.
import type { Href } from "expo-router";

import { dueText, sentThisWeek } from "@/features/coach/checkins";
import { useCoachData } from "@/features/coach/CoachData";

import { dayText } from "./athleteData";
import { useTodayWorkout } from "./QuickLog";
import { useMe } from "./useMe";

export type Note = {
  id: string;
  title: string;
  sub: string;
  when: string;
  href: Href;
  isNew: boolean;
};

export function useNotifications(): { items: Note[]; unread: number } {
  const me = useMe();
  const { meTier, coachName, settingsOf } = useCoachData();
  const today = useTodayWorkout();
  if (!me) return { items: [], unread: 0 };
  const on = settingsOf(me.id).notify;
  const coached = meTier === "coached";
  const items: Note[] = [];

  if (coached && on.messages && me.coachUnread) {
    const last = [...me.messages].reverse().find((m) => m.from === "coach");
    items.push({
      id: `msg-${last?.at ?? last?.time ?? ""}-${me.coachUnread}`,
      title: `New message from ${coachName}`,
      sub: last?.text ?? "",
      when: last?.time ?? "now",
      href: "/athlete/chat",
      isNew: true,
    });
  }
  const k = me.checkIns[0];
  if (coached && on.messages && k?.reviewed && k.reply) {
    items.push({
      id: `reply-${k.id}`,
      title: `${coachName} replied to your check-in`,
      sub: k.week === 0 ? "Starting point" : `Week ${k.week}`,
      when: k.submitted,
      href: "/athlete/weekly-check-in",
      isNew: false,
    });
  }
  for (const t of me.transformations ?? [])
    if (t.status === "waiting")
      items.push({
        id: `tr-${t.id}`,
        title: `${t.coachName} would like to share your progress`,
        sub: "You decide. Nothing is shared unless you approve.",
        when: t.requestedAt,
        href: { pathname: "/athlete/photos/review/[id]", params: { id: t.id } },
        isNew: true,
      });
  if (coached && on.plan && me.program)
    items.push({
      id: "plan",
      title: "Your plan is ready",
      sub: `${me.program.name} · from ${coachName}`,
      when: me.programStart ? dayText(me.programStart.slice(0, 10)) : "",
      href: "/athlete/training",
      isNew: false,
    });
  if (on.workout && today.day && !today.done)
    items.push({
      id: "workout",
      title: `${today.day.name} is ready`,
      sub: `${today.day.exercises.length} exercises`,
      when: "Today",
      href: {
        pathname: "/athlete/workout/preview/[dayId]",
        params: { dayId: today.day.id },
      },
      isNew: false,
    });
  if (
    coached &&
    on.checkIns &&
    me.status !== "paused" &&
    me.checkIns.length &&
    !sentThisWeek(me)
  )
    items.push({
      id: "checkin",
      title: "Weekly check-in",
      sub: `${dueText(me)} · photos, weight and 6 questions`,
      when: me.checkInDay,
      href: "/athlete/weekly-check-in",
      isNew: false,
    });

  // Opened notifications stop counting as new (N-06).
  const read = settingsOf(me.id).notesRead ?? [];
  const out = items.map((n) => ({
    ...n,
    isNew: n.isNew && !read.includes(n.id),
  }));
  return { items: out, unread: out.filter((n) => n.isNew).length };
}
