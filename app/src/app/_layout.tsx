import "../../global.css";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import { NavigationBar } from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/features/auth/AuthProvider";
import { CoachDataProvider } from "@/features/coach/CoachData";
import { colors } from "@/theme";

// Keep the splash up until Inter has loaded (D48: runtime fonts until dev builds exist).
SplashScreen.preventAutoHideAsync();
// Root background behind every screen and behind the edge-to-edge system bars (C3).
SystemUI.setBackgroundColorAsync(colors.bg);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const ready = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* Light app (D49): dark status-bar and navigation-bar content. */}
        <StatusBar style="light" />
        <NavigationBar style="dark" />
        {/* Sample data shared by the coach and athlete sides until the backend exists. */}
        <AuthProvider>
          <CoachDataProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              {/* Once in the coach app, a swipe back must not land in onboarding again. */}
              <Stack.Screen name="coach" options={{ gestureEnabled: false }} />
              <Stack.Screen
                name="athlete"
                options={{ gestureEnabled: false }}
              />
            </Stack>
          </CoachDataProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
