import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useCallback, useState, useRef } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SessionContext,
  useSession,
  useSessionProvider,
} from "../hooks/useSession";
import { View } from "react-native";
import { LanternEntry } from "../components/LanternEntry";
import { IdCardScan } from "../components/IdCardScan";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const hadSession = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "sign-in";

    if (!session && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (session && inAuthGroup) {
      // 로그인 직후 — 스캔 연출 후 이동
      setScanning(true);
      const timer = setTimeout(() => {
        setScanning(false);
        router.replace("/");
      }, 2500);
      return () => clearTimeout(timer);
    } else if (session && !hadSession.current) {
      // 앱 재시작 시 기존 세션 — 바로 이동
      hadSession.current = true;
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return <LanternEntry />;
  }

  if (scanning) {
    return (
      <View style={{ flex: 1, backgroundColor: "#101218", justifyContent: "center" }}>
        <IdCardScan variant="scanning" />
      </View>
    );
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
    Pretendard: require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
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
    <View style={{ flex: 1, backgroundColor: "#08090E" }}>
      <View
        style={{ flex: 1, maxWidth: 430, width: "100%", alignSelf: "center" }}
        onLayout={onLayoutRootView}
      >
        <QueryClientProvider client={queryClient}>
          <SessionContext.Provider value={sessionState}>
            <AuthGate />
          </SessionContext.Provider>
        </QueryClientProvider>
      </View>
    </View>
  );
}