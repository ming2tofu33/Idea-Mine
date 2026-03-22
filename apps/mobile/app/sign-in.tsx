import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signInWithOAuth } from "../lib/supabase";
import { midnight } from "../constants/theme";

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
        <Text style={styles.title}>IDEA MINE</Text>
        <Text style={styles.subtitle}>Start mining your ideas</Text>

        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={() => handleOAuth("google")}
          disabled={loading !== null}
        >
          <Text style={styles.buttonText}>
            {loading === "google" ? "..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.githubButton]}
          onPress={() => handleOAuth("github")}
          disabled={loading !== null}
        >
          <Text style={styles.buttonText}>
            {loading === "github" ? "..." : "Continue with GitHub"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101218",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#EC4899",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A6B4",
    textAlign: "center",
    marginBottom: 48,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: "#222433",
    borderWidth: 1,
    borderColor: "#2E3242",
  },
  githubButton: {
    backgroundColor: "#222433",
    borderWidth: 1,
    borderColor: "#2E3242",
  },
  buttonText: {
    color: "#C8CDD8",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    color: "#7E8596",
    textAlign: "center",
    fontSize: 12,
    marginTop: 24,
  },
});
