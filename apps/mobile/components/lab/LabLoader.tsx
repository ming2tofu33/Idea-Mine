import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";

const MESSAGES = [
  { ko: "원석의 결을 정리하는 중이에요", en: "Organizing the gem's structure..." },
  { ko: "프로젝트 개요 틀을 맞추고 있어요", en: "Shaping the project outline..." },
  { ko: "읽기 좋은 문서로 다듬는 중이에요", en: "Polishing into a readable document..." },
];

interface LabLoaderProps { language: "ko" | "en"; }

export function LabLoader({ language }: LabLoaderProps) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => { setIndex((i) => (i < MESSAGES.length - 1 ? i + 1 : i)); }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={midnight.accent.gold} />
      <PixelText variant="subtitle" style={styles.text}>{MESSAGES[index][language]}</PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: midnight.bg.deep, alignItems: "center", justifyContent: "center", padding: 32 },
  text: { color: midnight.accent.gold, marginTop: 24, textAlign: "center" },
});
