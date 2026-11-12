// /join/<token or code>: where a coach's personal invite link lands (D56). With Android App Links the
// public link arcwell.app/j/<token> opens here; after a fresh install the Play Install Referrer
// carries the token instead (needs a development build).
import { useLocalSearchParams } from "expo-router";

import { JoinScreen } from "@/features/join/JoinScreen";

export default function JoinFromLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  return <JoinScreen code={code} />;
}
