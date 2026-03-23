import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../constants/theme";
import { PixelText } from "./PixelText";

const CARD_HEIGHT = 180;

export function IdCardScan() {
  const scanY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, [scanY]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <PixelText
          variant="caption"
          color={midnight.accent.gold}
          style={{ marginBottom: 12 }}
        >
          IDEA MINE
        </PixelText>

        <PixelText variant="body" emoji style={{ fontSize: 40, marginBottom: 8 }}>
          ⛏
        </PixelText>

        <PixelText variant="body" color={midnight.text.primary}>
          광부 출입증
        </PixelText>

        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanY }] },
          ]}
        />
      </View>

      <PixelText
        variant="caption"
        color={midnight.text.muted}
        style={{ marginTop: 16 }}
      >
        광부 신원 확인 중...
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
    borderColor: midnight.accent.gold,
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
    shadowColor: midnight.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
