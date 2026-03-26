import { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight, lab } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
import { PixelText } from "../PixelText";

const MESSAGES: { ko: string; en: string }[] = [
  { ko: "원석을 살펴보는 중이에요", en: "Examining the gem..." },
  { ko: "결정 구조를 분석하는 중이에요", en: "Analyzing crystal structure..." },
  { ko: "광물의 순도를 측정하는 중이에요", en: "Measuring mineral purity..." },
  { ko: "감정서를 작성하는 중이에요", en: "Writing the appraisal..." },
];

interface AppraisalLoaderProps {
  language: "ko" | "en";
}

export function AppraisalLoader({ language }: AppraisalLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Gem float animation
  const gemFloat = useRef(new Animated.Value(0)).current;

  // Magnifying glass position (sweep left → center → right)
  const scanX = useRef(new Animated.Value(-40)).current;

  // Sparkle pulse
  const sparkle = useRef(new Animated.Value(0.3)).current;

  // Gem float
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gemFloat, { toValue: -6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(gemFloat, { toValue: 6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [gemFloat]);

  // Magnifying glass sweep
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanX, { toValue: 40, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scanX, { toValue: -40, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [scanX]);

  // Sparkle pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [sparkle]);

  // Message rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Gem + magnifying glass */}
      <View style={styles.gemArea}>
        {/* Glow behind gem */}
        <Animated.View style={[styles.glow, { opacity: sparkle }]} />

        {/* Gem */}
        <Animated.View style={{ transform: [{ translateY: gemFloat }] }}>
          <PixelText emoji style={{ fontSize: pixel.emoji.hero, textAlign: "center" }}>
            💎
          </PixelText>
        </Animated.View>

        {/* Magnifying glass sweeping */}
        <Animated.View style={[styles.magnifier, { transform: [{ translateX: scanX }] }]}>
          <PixelText emoji style={{ fontSize: pixel.emoji.scene }}>
            🔍
          </PixelText>
        </Animated.View>
      </View>

      {/* Message */}
      <PixelText variant="caption" color={midnight.text.muted} style={styles.message}>
        {MESSAGES[messageIndex][language]}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lab.bg.wall,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  gemArea: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
  },
  glow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(168,230,207,0.2)",
  },
  magnifier: {
    position: "absolute",
    bottom: 10,
  },
  message: {
    marginTop: 48,
    textAlign: "center",
  },
});
