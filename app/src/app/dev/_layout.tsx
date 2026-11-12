import { Redirect, Stack } from "expo-router";

import { colors } from "@/theme";

/** Dev-only review screens (token check, later the component gallery). Never reachable in release builds. */
export default function DevLayout() {
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
