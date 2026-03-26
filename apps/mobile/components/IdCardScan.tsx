import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../constants/theme";
import { pixel, pixelGlow } from "../constants/pixel";
import { PixelText } from "./PixelText";

const CARD_HEIGHT = 180;

interface IdCardScanProps {
  /** "preparing" = 로그인 전 (출입증 준비), "scanning" = 로그인 후 (신원 확인) */
  variant?: "preparing" | "scanning";
}

export function IdCardScan({ variant = "scanning" }: IdCardScanProps) {
  const scanY = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(variant === "preparing" ? 0.8 : 1)).current;
  const cardOpacity = useRef(new Animated.Value(variant === "preparing" ? 0 : 1)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant === "preparing") {
      // 카드가 만들어지는 연출: 페이드인 + 스케일업
      Animated.sequence([
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(cardScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(400),
        // 도장 찍히는 연출
        Animated.timing(stampOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 스캔 라인 반복
      const scan = Animated.loop(
        Animated.sequence([
          Animated.timing(scanY, {
            toValue: CARD_HEIGHT - 4,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanY, {
            toValue: 0,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(300),
        ])
      );
      scan.start();
      return () => scan.stop();
    }
  }, [variant, scanY, cardOpacity, cardScale, stampOpacity]);

  const isPreparing = variant === "preparing";
  const borderColor = isPreparing ? midnight.text.muted : midnight.accent.gold;
  const message = isPreparing ? "출입증 준비 중..." : "광부 신원 확인 중...";
  const cardTitle = isPreparing ? "출입증 발급" : "광부 출입증";

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.card,
          {
            borderColor,
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <PixelText
          variant="caption"
          color={isPreparing ? midnight.text.muted : midnight.accent.gold}
          style={{ marginBottom: 12 }}
        >
          IDEA MINE
        </PixelText>

        <PixelText emoji style={{ fontSize: pixel.emoji.scene, marginBottom: 8 }}>
          🪪
        </PixelText>

        <PixelText variant="body" color={midnight.text.primary}>
          {cardTitle}
        </PixelText>

        {/* preparing: 도장 연출 */}
        {isPreparing && (
          <Animated.View style={[styles.stamp, { opacity: stampOpacity }]}>
            <PixelText variant="caption" color={midnight.accent.gold}>
              APPROVED
            </PixelText>
          </Animated.View>
        )}

        {/* scanning: 스캔 라인 */}
        {!isPreparing && (
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanY }] },
            ]}
          />
        )}
      </Animated.View>

      <PixelText
        variant="caption"
        color={midnight.text.muted}
        style={{ marginTop: 16 }}
      >
        {message}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginTop: 24,
  },
  card: {
    width: 200,
    height: CARD_HEIGHT,
    backgroundColor: midnight.bg.elevated,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: midnight.accent.gold,
    ...pixelGlow(midnight.accent.gold, 6),
  },
  stamp: {
    position: "absolute",
    bottom: 12,
    right: 12,
    borderWidth: 2,
    borderColor: midnight.accent.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: "-12deg" }],
  },
});
