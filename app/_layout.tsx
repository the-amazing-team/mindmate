import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    import("@/services/auth.service").then(({ authService }) => {
      authService.getSession().then((session) => {
        const inAuthGroup = segments[0] === "(auth)";
        const atRoot = segments.length === 0 || (segments.length === 1 && segments[0] === "index");

        if (!session && !inAuthGroup) {
          // Redirect unauthenticated users to the auth screen
          router.replace("/(auth)");
        } else if (session && (inAuthGroup || atRoot)) {
          // Redirect authenticated users away from auth screens to the main app
          router.replace("/(tabs)");
        }
      });
    });
  }, [segments]);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#0D0D14' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <InitialLayout />
      <StatusBar style="light" backgroundColor="#0D0D14" />
    </ThemeProvider>
  );
}
