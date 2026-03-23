import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { MINING_LOADER_MESSAGES } from "../../constants/mining";

interface MiningLoaderProps {
  language: "ko" | "en";
}

export function MiningLoader({ language }: MiningLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) =>
        i < MINING_LOADER_MESSAGES.length - 1 ? i + 1 : i
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const message = MINING_LOADER_MESSAGES[messageIndex][language];

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={midnight.accent.gold} />
      <PixelText variant="subtitle" style={styles.text}>
        {message}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.deep,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  text: {
    color: midnight.accent.gold,
    marginTop: 24,
    textAlign: "center",
  },
});
