import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { signInWithOAuth } from "../lib/supabase";
import { midnight } from "../constants/theme";
import { PixelText } from "../components/PixelText";
import { PixelButton } from "../components/PixelButton";

export default function SignInScreen() {
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  async function handleOAuth(provider: "google" | "github") {
    setLoading(provider);
    try {
      await signInWithOAuth(provider);
    } catch (error: any) {
      Alert.alert("Sign In Error", error.message);
    }
    setLoading(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <PixelText
          variant="title"
          style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}
        >
          IDEA MINE
        </PixelText>
        <PixelText
          variant="caption"
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          Start mining your ideas
        </PixelText>

        <View style={styles.buttons}>
          <PixelButton
            variant="secondary"
            size="lg"
            onPress={() => handleOAuth("google")}
            disabled={loading !== null}
          >
            {loading === "google" ? "..." : "Continue with Google"}
          </PixelButton>

          <PixelButton
            variant="secondary"
            size="lg"
            onPress={() => handleOAuth("github")}
            disabled={loading !== null}
          >
            {loading === "github" ? "..." : "Continue with GitHub"}
          </PixelButton>
        </View>

        <PixelText
          variant="muted"
          style={{ textAlign: "center", marginTop: 24 }}
        >
          By continuing, you agree to our Terms of Service
        </PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.primary,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttons: {
    gap: 12,
    alignItems: "center",
  },
});
