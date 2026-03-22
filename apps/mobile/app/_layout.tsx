import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import {
  SessionContext,
  useSession,
  useSessionProvider,
} from "../hooks/useSession";
import { View, ActivityIndicator, StyleSheet } from "react-native";

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
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const sessionState = useSessionProvider();

  return (
    <SessionContext.Provider value={sessionState}>
      <AuthGate />
    </SessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#101218",
    alignItems: "center",
    justifyContent: "center",
  },
});
