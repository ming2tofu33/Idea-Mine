import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing, Dimensions } from "react-native";
import { midnight } from "../../constants/theme";
import { PixelText } from "../PixelText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_WIDTH = SCREEN_WIDTH - 64;

export function LanternScan() {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: SCAN_WIDTH - 80,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    scan.start();
    return () => scan.stop();
  }, [translateX]);

  return (
    <View style={styles.container}>
      <View style={styles.wall} />

      <Animated.View
        style={[
          styles.lanternLight,
          { transform: [{ translateX }] },
        ]}
      >
        <View style={styles.glow} />
        <PixelText variant="body" emoji style={{ fontSize: 20 }}>
          🏮
        </PixelText>
      </Animated.View>

      <PixelText variant="caption" color={midnight.text.muted} style={styles.text}>
        벽을 살피는 중...
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    marginTop: 20,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  wall: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    backgroundColor: midnight.bg.surface,
    borderWidth: 1,
    borderColor: midnight.border.default,
  },
  lanternLight: {
    position: "absolute",
    top: 16,
    left: 0,
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: 80,
    height: 100,
    borderRadius: 40,
    backgroundColor: "rgba(196,176,122,0.08)",
    top: -20,
  },
  text: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
});
