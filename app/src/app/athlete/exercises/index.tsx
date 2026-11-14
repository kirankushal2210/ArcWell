// Your exercises (D91), from Progress: every exercise you've logged, most recent first, with how
// many workouts it was in and your best set. Not the library: that opens from Add exercise.
import { router } from "expo-router";

import { Text } from "@/components/primitives";
import { backTo, MenuPage, NavRow } from "@/features/athlete/MenuParts";
import { topSet } from "@/features/athlete/overload";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Group } from "@/features/coach/parts";

export default function MyExercises() {
  const me = useMe();
  const { sessions } = useCoachData();
  if (!me) return <NotJoined />;
  const back = backTo("/athlete/progress");
  const rows = new Map<string, { count: number; best: string | null }>();
  for (const s of sessions(me.id))
    for (const e of s.exercises) {
      if (e.skipped) continue;
      const row = rows.get(e.name) ?? { count: 0, best: null };
      row.count += 1;
      const t = topSet(e.sets);
      if (!row.best && t)
        row.best = t.kg ? `${t.kg} kg × ${t.reps}` : `${t.reps} reps`;
      rows.set(e.name, row);
    }
  const list = [...rows.entries()];
  return (
    <MenuPage title="Exercises" back={back}>
      {list.length ? (
        <Group>
          {list.map(([name, r], i) => (
            <NavRow
              key={name}
              first={i === 0}
              label={name}
              sub={`${r.count} workout${r.count === 1 ? "" : "s"}${r.best ? ` · last best ${r.best}` : ""}`}
              onPress={() =>
                router.push({
                  pathname: "/athlete/exercises/[name]",
                  params: { name },
                })
              }
            />
          ))}
        </Group>
      ) : (
        <Text tone="muted">Exercises you log show here.</Text>
      )}
    </MenuPage>
  );
}
