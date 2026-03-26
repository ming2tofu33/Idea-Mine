import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../constants/theme";
import { pixel } from "../constants/pixel";
import { PixelText } from "./PixelText";

export function LanternEntry() {
  const lanternOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(lanternOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glow,
          {
            transform: [{ scale: Animated.add(glowScale, glowScale) }],
            opacity: glowScale,
          },
        ]}
      />

      <Animated.View style={{ opacity: lanternOpacity }}>
        <PixelText emoji style={{ fontSize: pixel.emoji.hero }}>
          🕯
        </PixelText>
      </Animated.View>

      <Animated.View style={{ opacity: logoOpacity, marginTop: 16 }}>
        <PixelText
          variant="title"
          color={midnight.accent.gold}
          style={{ fontSize: 28, textAlign: "center" }}
        >
          IDEA MINE
        </PixelText>
      </Animated.View>

      <Animated.View style={{ opacity: subOpacity, marginTop: 12 }}>
        <PixelText variant="caption" color={midnight.text.muted}>
          광산에 입장하는 중...
        </PixelText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: midnight.bg.deep,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(196,176,122,0.12)",
  },
});
