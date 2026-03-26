import { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
import { MINING_LOADER_MESSAGES } from "../../constants/mining";

interface MiningLoaderProps {
  language: "ko" | "en";
  rarity?: string;
}

// --- 곡괭이 애니메이션 ---
function PickaxeSwing() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swing = Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: -1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0.2,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ])
    );
    swing.start();
    return () => swing.stop();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [-1, 0, 0.2],
    outputRange: ["-45deg", "0deg", "15deg"],
  });

  return (
    <Animated.View
      style={[
        styles.pickaxe,
        { transform: [{ rotate }] },
      ]}
    >
      <PixelText emoji style={{ fontSize: pixel.emoji.hero }}>⛏</PixelText>
    </Animated.View>
  );
}

// --- 파편 이펙트 ---
function Sparks() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sparkle = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -12,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -32,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(750),
      ])
    );
    sparkle.start();
    return () => sparkle.stop();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.sparks,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <PixelText emoji color={midnight.accent.gold} style={{ fontSize: pixel.emoji.icon }}>✦</PixelText>
    </Animated.View>
  );
}

// --- 광맥 블록 ---
function VeinBlock({ stage }: { stage: number }) {
  const scales = [1.5, 1.2, 0.8];
  const s = scales[Math.min(stage, 2)];

  return (
    <Animated.View style={[styles.veinBlock, { transform: [{ scale: s }] }]}>
      <PixelText emoji style={{ fontSize: pixel.emoji.hero }}>🪨</PixelText>
    </Animated.View>
  );
}

// --- 광차 + 원석 ---
function Minecart({ gemCount }: { gemCount: number }) {
  return (
    <View style={styles.minecart}>
      <View style={styles.cartGems}>
        {Array.from({ length: gemCount }).map((_, i) => (
          <PixelText key={i} emoji style={{ fontSize: pixel.emoji.icon, marginHorizontal: -4 }}>
            💎
          </PixelText>
        ))}
      </View>
      <PixelText emoji style={{ fontSize: pixel.emoji.scene, marginTop: -8 }}>
        🛒
      </PixelText>
    </View>
  );
}

// --- 메인 로더 ---
export function MiningLoader({ language, rarity = "common" }: MiningLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MINING_LOADER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const message = MINING_LOADER_MESSAGES[messageIndex][language];

  return (
    <View style={styles.container}>
      <View style={styles.scene}>
        <PickaxeSwing />
        <Sparks />
        <VeinBlock stage={messageIndex} />
      </View>

      <View style={styles.cartArea}>
        <Minecart gemCount={messageIndex + 1} />
      </View>

      <PixelText variant="subtitle" style={styles.message}>
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
  scene: {
    width: 200,
    height: 180,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pickaxe: {
    position: "absolute",
    top: 0,
    left: 20,
    transformOrigin: "bottom right",
    zIndex: 10,
  },
  sparks: {
    position: "absolute",
    top: 20,
    right: 30,
    zIndex: 5,
  },
  veinBlock: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  cartArea: {
    marginTop: 24,
    alignItems: "center",
  },
  minecart: {
    alignItems: "center",
  },
  cartGems: {
    flexDirection: "row",
    height: 24,
    alignItems: "flex-end",
    zIndex: 2,
  },
  message: {
    color: midnight.accent.gold,
    marginTop: 40,
    textAlign: "center",
  },
});
