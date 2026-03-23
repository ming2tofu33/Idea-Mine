import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useCallback } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  SessionContext,
  useSession,
  useSessionProvider,
} from "../hooks/useSession";
import { View } from "react-native";
import { LanternEntry } from "../components/LanternEntry";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "sign-in";

    if (!session && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return <LanternEntry />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const sessionState = useSessionProvider();

  const [fontsLoaded] = useFonts({
    Galmuri11: require("../assets/fonts/Galmuri11.ttf"),
    "Galmuri11-Bold": require("../assets/fonts/Galmuri11-Bold.ttf"),
    Mona12: require("../assets/fonts/Mona12.ttf"),
    "Mona12-Bold": require("../assets/fonts/Mona12-Bold.ttf"),
    Mona12ColorEmoji: require("../assets/fonts/Mona12ColorEmoji.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SessionContext.Provider value={sessionState}>
        <AuthGate />
      </SessionContext.Provider>
    </View>
  );
}