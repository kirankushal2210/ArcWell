// Race (D76): the same Race section as Training's 4th tab, as its own page for deep links.
import { backTo, MenuPage } from "@/features/athlete/MenuParts";
import { RacePage } from "@/features/race/RacePage";
import { useRace } from "@/features/race/useRace";
import { Redirect, router } from "expo-router";

import { Button } from "@/components/primitives";

export default function Race() {
  const rc = useRace();
  if (!rc.active) return <Redirect href="/athlete/race/setup" />;
  return (
    <MenuPage title="Race" back={backTo("/athlete/training")}>
      <RacePage />
      <Button
        label="Start a race sim"
        size="sm"
        onPress={() => router.push("/athlete/race/sim/new")}
      />
    </MenuPage>
  );
}
