// Asks before throwing away the running workout (D102), from the logger or the minimised bar.
import { alert } from "@/lib/alert";

export function confirmDiscard(onDiscard: () => void) {
  alert("Discard this workout?", "Nothing from this session will be saved.", [
    { text: "Keep going", style: "cancel" },
    { text: "Discard", style: "destructive", onPress: onDiscard },
  ]);
}
