import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "./global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Wait a tick for router to be ready
        setTimeout(() => router.replace('/(auth)'), 100);
      }
      setIsInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/(auth)');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isInitializing) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#0D0D14' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" backgroundColor="#0D0D14" />
    </ThemeProvider>
  );
}
