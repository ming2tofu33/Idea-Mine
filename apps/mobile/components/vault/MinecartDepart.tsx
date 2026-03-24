import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing, useWindowDimensions } from "react-native";
import { midnight } from "../../constants/theme";
import { PixelText } from "../PixelText";

interface MinecartDepartProps {
  gemCount: number;
}

export function MinecartDepart({ gemCount }: MinecartDepartProps) {
  const { width } = useWindowDimensions();
  const targetX = Math.min(width, 430);

  const cartX = useRef(new Animated.Value(0)).current;
  const gemsOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cartX, {
        toValue: targetX,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cartX, textOpacity, targetX]);

  const wobble = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const shake = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: -2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: 2,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );
    shake.start();
    return () => shake.stop();
  }, [wobble]);

  return (
    <View style={styles.container}>
      <View style={styles.rail} />

      <Animated.View
        style={[
          styles.cart,
          {
            transform: [
              { translateX: cartX },
              { translateY: wobble },
            ],
          },
        ]}
      >
        <Animated.View style={[styles.gems, { opacity: gemsOpacity }]}>
          {Array.from({ length: Math.min(gemCount, 5) }).map((_, i) => (
            <PixelText key={i} variant="body" emoji style={{ fontSize: 12, marginHorizontal: -1 }}>
              💎
            </PixelText>
          ))}
        </Animated.View>

        <View style={styles.cartBody} />

        <View style={styles.wheels}>
          <View style={styles.wheel} />
          <View style={styles.wheel} />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity }}>
        <PixelText variant="caption" color={midnight.text.muted} style={styles.text}>
          금고로 운반하는 중...
        </PixelText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  rail: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#4A3728",
    borderTopWidth: 1,
    borderTopColor: "#5A4738",
  },
  cart: {
    position: "absolute",
    bottom: 32,
    alignItems: "center",
  },
  gems: {
    flexDirection: "row",
    marginBottom: -2,
  },
  cartBody: {
    width: 48,
    height: 24,
    backgroundColor: "#4A3728",
    borderWidth: 2,
    borderTopColor: "#5A4738",
    borderLeftColor: "#5A4738",
    borderBottomColor: "#3A2718",
    borderRightColor: "#3A2718",
  },
  wheels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 36,
    marginTop: 1,
  },
  wheel: {
    width: 8,
    height: 8,
    backgroundColor: "#5A4738",
    borderWidth: 1,
    borderColor: "#3A2718",
  },
  text: {
    textAlign: "center",
    marginTop: 4,
  },
});
