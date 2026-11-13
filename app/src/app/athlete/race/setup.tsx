// Race goal (D76): date, division, target time and kit. Setting a goal turns the race track on;
// self-guided athletes can switch their plan to the race plan (a coach decides for coached athletes).
// Ending the goal hides the Race section again; sims stay in history.
import { router } from "expo-router";
import { useState } from "react";

import { Button, Chip, Text, TextField } from "@/components/primitives";
import {
  isoDate,
  type RaceLevel,
  type WeakArea,
} from "@/features/athlete/athleteData";
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined } from "@/features/athlete/useMe";
import { Eyebrow, Pills } from "@/features/coach/parts";
import { type DivisionKey, DIVISIONS } from "@/features/race/data";
import { useRace } from "@/features/race/useRace";
import { space } from "@/theme";
import { StyleSheet, View } from "react-native";

const KIT = ["Sled", "SkiErg", "Rower", "Wall-ball target", "Sandbag"];
const WEEKS = ["6", "8", "10", "12", "16", "20", "24"];
const WEAK: [WeakArea, string][] = [
  ["running", "Running"],
  ["fade", "Slowing on later runs"],
  ["roxzone", "Roxzone"],
  ["skierg", "SkiErg"],
  ["sled_push", "Sled push"],
  ["sled_pull", "Sled pull"],
  ["burpee_broad_jumps", "Burpee broad jumps"],
  ["row", "Row"],
  ["farmers_carry", "Farmers carry"],
  ["sandbag_lunges", "Sandbag lunges"],
  ["wall_balls", "Wall balls"],
];
const hm = (sec: number) =>
  `${Math.floor(sec / 3600)}:${String(Math.round((sec % 3600) / 60)).padStart(2, "0")}`;
/** "1:32" → seconds; anything else → undefined. */
const parseHm = (t: string) => {
  const m = t.trim().match(/^(\d):(\d{2})$/);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 : undefined;
};

export default function RaceSetup() {
  const rc = useRace();
  const g = rc.goal;
  const [weeks, setWeeks] = useState(
    g && rc.days !== null ? String(Math.max(6, Math.round(rc.days / 7))) : "12",
  );
  const [division, setDivision] = useState<DivisionKey>(
    g?.division ?? "open_women",
  );
  const [kit, setKit] = useState<string[]>(g?.kit ?? []);
  const [days, setDays] = useState("4");
  const [level, setLevel] = useState<RaceLevel>(g?.level ?? "first");
  const [km, setKm] = useState(String(g?.weeklyKm ?? 5));
  const [best, setBest] = useState(g?.prevSec ? hm(g.prevSec) : "");
  const [target, setTarget] = useState(g?.targetSec ? hm(g.targetSec) : "");
  const [weak, setWeak] = useState<WeakArea[]>(g?.weak ?? []);
  if (!rc.me) return <NotJoined />;
  const coached = rc.v.coached;
  const save = (switchPlan: boolean) => {
    const d = new Date();
    d.setDate(d.getDate() + Number(weeks) * 7);
    rc.setGoal({
      ...g,
      date: isoDate(d),
      division,
      kit,
      level,
      weeklyKm: Number(km),
      prevSec: level === "first" ? undefined : parseHm(best),
      targetSec: parseHm(target),
      weak: level === "first" ? [] : weak,
    });
    if (switchPlan) rc.switchPlan(Number(days));
    router.replace("/athlete/training");
  };

  return (
    <MenuPage
      title={g ? "Your race" : "Train for a HYROX race"}
      back={backTo("/athlete/training")}
    >
      {!g ? (
        <InfoCard>
          8 × 1 km runs, each followed by a station. Arcwell builds a plan back
          from race day and adds a race simulator. Only you see it; nothing
          changes for anyone else.
        </InfoCard>
      ) : null}
      <Eyebrow>Your race experience</Eyebrow>
      <Pills
        value={level}
        onChange={setLevel}
        options={[
          { value: "first", label: "First race" },
          { value: "returning", label: "Raced before" },
          { value: "advanced", label: "Pro or qualifying" },
        ]}
      />
      <Eyebrow>Running now, a week</Eyebrow>
      <Pills
        value={km}
        onChange={setKm}
        options={[
          { value: "0", label: "Not yet" },
          { value: "5", label: "Under 10 km" },
          { value: "15", label: "10–20 km" },
          { value: "28", label: "20–35 km" },
          { value: "40", label: "35 km +" },
        ]}
      />
      {level !== "first" ? (
        <>
          <TextField
            label="Best finish time (h:mm)"
            value={best}
            onChangeText={setBest}
            placeholder="1:32"
          />
          <Eyebrow>Where you lost the most time (up to 3)</Eyebrow>
          <View style={styles.wrap}>
            {WEAK.map(([k, label]) => (
              <Chip
                key={k}
                label={label}
                selected={weak.includes(k)}
                onPress={() =>
                  setWeak((xs) =>
                    xs.includes(k)
                      ? xs.filter((x) => x !== k)
                      : xs.length < 3
                        ? [...xs, k]
                        : xs,
                  )
                }
              />
            ))}
          </View>
        </>
      ) : null}
      <TextField
        label={
          level === "first"
            ? "Target time, if you have one (h:mm)"
            : "Target time (h:mm)"
        }
        value={target}
        onChangeText={setTarget}
        placeholder="1:25"
      />
      <Eyebrow>Weeks until your race</Eyebrow>
      <Pills
        value={weeks}
        onChange={setWeeks}
        options={WEEKS.map((w) => ({ value: w, label: w }))}
      />
      <Eyebrow>Division</Eyebrow>
      <Pills
        value={division}
        onChange={setDivision}
        options={DIVISIONS.map((d) => ({ value: d.key, label: d.label }))}
      />
      <Eyebrow>Kit you can use</Eyebrow>
      <View style={styles.wrap}>
        {KIT.map((k) => (
          <Chip
            key={k}
            label={k}
            selected={kit.includes(k)}
            onPress={() =>
              setKit((xs) =>
                xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k],
              )
            }
          />
        ))}
      </View>
      <Text variant="caption" tone="muted">
        No sled or SkiErg? Sims swap in the closest exercise and mark it, so it
        is never compared with a real station.
      </Text>
      {!coached ? (
        <>
          <Eyebrow>Days a week for the race plan</Eyebrow>
          <Pills
            value={days}
            onChange={setDays}
            options={["3", "4", "5", "6"].map((d) => ({ value: d, label: d }))}
          />
          <Button
            label={g ? "Save and rebuild my plan" : "Start the race plan"}
            fullWidth
            onPress={() => save(true)}
          />
          {g ? (
            <Button
              label="Save, keep my plan"
              variant="secondary"
              size="sm"
              onPress={() => save(false)}
            />
          ) : null}
        </>
      ) : (
        <>
          <InfoCard>
            Your coach plans your training. They&apos;ll see your race goal.
          </InfoCard>
          <Button
            label="Save race goal"
            fullWidth
            onPress={() => save(false)}
          />
        </>
      )}
      {g ? (
        <View style={styles.row}>
          <Button
            label="Race done"
            variant="secondary"
            size="sm"
            onPress={() => {
              rc.end("done");
              router.replace("/athlete/training");
            }}
          />
          <Button
            label="Cancel race"
            variant="ghost"
            size="sm"
            onPress={() => {
              rc.end("cancelled");
              router.replace("/athlete/training");
            }}
          />
        </View>
      ) : null}
    </MenuPage>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: space[2] },
  row: { flexDirection: "row", gap: space[2] },
});
