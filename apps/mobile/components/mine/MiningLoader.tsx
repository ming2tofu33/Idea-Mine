import { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { PixelText } from "../PixelText";
import { midnight } from "../../constants/theme";
import { MINING_LOADER_MESSAGES } from "../../constants/mining";

interface MiningLoaderProps {
  language: "ko" | "en";
}

// --- 곡괭이 애니메이션 ---

function PickaxeSwing() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swing = Animated.loop(
      Animated.sequence([
        // 들어올리기
        Animated.timing(rotation, {
          toValue: -1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // 내리치기
        Animated.timing(rotation, {
          toValue: 0.2,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // 반동
        Animated.timing(rotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        // 잠깐 쉬기
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
      <PixelText variant="body" emoji style={{ fontSize: 40 }}>
        ⛏
      </PixelText>
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
        Animated.delay(600), // 곡괭이 내리치는 타이밍에 맞춤
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
            toValue: -24,
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
      <PixelText variant="body" color={midnight.accent.gold} style={{ fontSize: 14 }}>
        ✦ ✦
      </PixelText>
    </Animated.View>
  );
}

// --- 광맥 블록 ---

function VeinBlock({ stage }: { stage: number }) {
  // stage 0: 큰 광맥, 1: 중간, 2: 작은
  const sizes = [
    { width: 64, height: 48 },
    { width: 48, height: 40 },
    { width: 32, height: 32 },
  ];
  const size = sizes[Math.min(stage, 2)];

  return (
    <View style={[styles.veinBlock, size]}>
      <View style={styles.veinInner} />
    </View>
  );
}

// --- 광차 + 원석 ---

function Minecart({ gemCount }: { gemCount: number }) {
  return (
    <View style={styles.minecart}>
      {/* 원석들 */}
      <View style={styles.cartGems}>
        {Array.from({ length: gemCount }).map((_, i) => (
          <PixelText
            key={i}
            variant="body"
            emoji
            style={{ fontSize: 14, marginHorizontal: -2 }}
          >
            💎
          </PixelText>
        ))}
      </View>
      {/* 광차 본체 */}
      <View style={styles.cartBody}>
        <PixelText variant="muted" style={{ fontSize: 8 }}>
          광차
        </PixelText>
      </View>
      {/* 바퀴 */}
      <View style={styles.cartWheels}>
        <View style={styles.wheel} />
        <View style={styles.wheel} />
      </View>
    </View>
  );
}

// --- 메인 로더 ---

export function MiningLoader({ language }: MiningLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) =>
        i < MINING_LOADER_MESSAGES.length - 1 ? i + 1 : i
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const message = MINING_LOADER_MESSAGES[messageIndex][language];

  return (
    <View style={styles.container}>
      {/* 채굴 씬 */}
      <View style={styles.scene}>
        {/* 곡괭이 */}
        <PickaxeSwing />

        {/* 파편 */}
        <Sparks />

        {/* 광맥 */}
        <VeinBlock stage={messageIndex} />
      </View>

      {/* 레일 */}
      <View style={styles.rail} />

      {/* 광차 */}
      <View style={styles.cartArea}>
        <Minecart gemCount={messageIndex + 1} />
      </View>

      {/* 메시지 */}
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

  // 채굴 씬
  scene: {
    width: 200,
    height: 120,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  // 곡괭이
  pickaxe: {
    position: "absolute",
    top: 0,
    left: 40,
    transformOrigin: "bottom right",
  },

  // 파편
  sparks: {
    position: "absolute",
    top: 20,
    right: 40,
  },

  // 광맥
  veinBlock: {
    backgroundColor: "#3A3E52",
    borderWidth: 2,
    borderTopColor: "#4A4E62",
    borderLeftColor: "#4A4E62",
    borderBottomColor: "#2A2E42",
    borderRightColor: "#2A2E42",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  veinInner: {
    width: "60%",
    height: "40%",
    backgroundColor: midnight.accent.gold,
    opacity: 0.6,
  },

  // 레일
  rail: {
    width: 240,
    height: 4,
    backgroundColor: "#4A3728",
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#5A4738",
  },

  // 광차 영역
  cartArea: {
    marginTop: 8,
    alignItems: "center",
  },

  // 광차
  minecart: {
    alignItems: "center",
  },
  cartGems: {
    flexDirection: "row",
    marginBottom: -4,
    height: 20,
    alignItems: "flex-end",
  },
  cartBody: {
    width: 56,
    height: 28,
    backgroundColor: "#4A3728",
    borderWidth: 2,
    borderTopColor: "#5A4738",
    borderLeftColor: "#5A4738",
    borderBottomColor: "#3A2718",
    borderRightColor: "#3A2718",
    alignItems: "center",
    justifyContent: "center",
  },
  cartWheels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 40,
    marginTop: 2,
  },
  wheel: {
    width: 10,
    height: 10,
    backgroundColor: "#5A4738",
    borderWidth: 1,
    borderColor: "#3A2718",
    borderRadius: 1,
  },

  // 메시지
  message: {
    color: midnight.accent.gold,
    marginTop: 32,
    textAlign: "center",
  },
});
