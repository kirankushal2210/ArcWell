// Recovery is part of Arcwell Plus (D5a, D57). The tab shows the locked page to free athletes; this
// wraps each inner Recovery page so a direct link sends them back to it instead of opening the page.
import { Redirect } from "expo-router";
import type { ComponentType } from "react";

import { useCoachData } from "@/features/coach/CoachData";

export function plusOnly<P extends object>(Page: ComponentType<P>) {
  function PlusOnly(props: P) {
    const { meTier } = useCoachData();
    if (meTier === "free") return <Redirect href="/athlete/recovery" />;
    return <Page {...props} />;
  }
  PlusOnly.displayName = `PlusOnly(${Page.displayName ?? Page.name ?? "Page"})`;
  return PlusOnly;
}
