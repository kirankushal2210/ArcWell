// Units (AC-08): weight is kg only in v1 (D45); lengths in cm or ft and in; food portions in
// Indian units or grams first.
import { backTo, InfoCard, MenuPage } from "@/features/athlete/MenuParts";
import { NotJoined, useMe } from "@/features/athlete/useMe";
import { useCoachData } from "@/features/coach/CoachData";
import { Eyebrow, Pills } from "@/features/coach/parts";

export default function Units() {
  const me = useMe();
  const { settingsOf, setAthleteSettings } = useCoachData();
  if (!me) return <NotJoined />;
  const s = settingsOf(me.id);
  return (
    <MenuPage title="Units" back={backTo("/athlete/menu/account")}>
      <Eyebrow>Weight</Eyebrow>
      <Pills
        value="kg"
        onChange={() => {}}
        options={[{ value: "kg", label: "kg" }]}
      />
      <Eyebrow>Height and measurements</Eyebrow>
      <Pills
        value={s.length}
        onChange={(v) => setAthleteSettings(me.id, { length: v })}
        options={[
          { value: "cm", label: "cm" },
          { value: "ftin", label: "ft / in" },
        ]}
      />
      <Eyebrow>Food portions</Eyebrow>
      <Pills
        value={s.portions}
        onChange={(v) => setAthleteSettings(me.id, { portions: v })}
        options={[
          { value: "indian", label: "Indian units first" },
          { value: "grams", label: "Grams first" },
        ]}
      />
      <InfoCard>
        Weights are in kg. Pounds are coming in a later version.
      </InfoCard>
    </MenuPage>
  );
}
