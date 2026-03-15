import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

export const unstable_settings = {
  anchor: "(tabs)",
};

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // We only want to redirect when we have a definitive user state
    if (loading && !user) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inInitialGroup = !segments[0] || (segments[0] as string) === 'index';

    if (!user && !inAuthGroup && !inInitialGroup) {
      // Redirect to the welcome screen if not logged in
      router.replace('/(auth)');
    } else if (user && (inAuthGroup || inInitialGroup)) {
      // Redirect to the app if logged in
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

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
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="light" backgroundColor="#0D0D14" />
      </ThemeProvider>
    </AuthProvider>
  );
}
