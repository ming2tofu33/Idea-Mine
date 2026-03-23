import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../../constants/theme";

interface RerollBlastProps {
  onComplete: () => void;
}

export function RerollBlast({ onComplete }: RerollBlastProps) {
  const blastScale = useRef(new Animated.Value(0)).current;
  const blastOpacity = useRef(new Animated.Value(0)).current;
  const dustOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const particles = useRef(
    Array.from({ length: 6 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const particleAnims = particles.map((p, i) => {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      return Animated.parallel([
        Animated.timing(p.opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(p.x, {
          toValue: Math.cos(angle) * distance,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: Math.sin(angle) * distance,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
    });

    const particleFade = particles.map((p) =>
      Animated.timing(p.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    );

    Animated.sequence([
      Animated.parallel([
        Animated.timing(blastOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(blastScale, { toValue: 1.5, duration: 200, useNativeDriver: true }),
        ...particleAnims,
      ]),
      Animated.parallel([
        Animated.timing(blastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(dustOpacity, { toValue: 0.6, duration: 150, useNativeDriver: true }),
        ...particleFade,
      ]),
      Animated.timing(dustOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Animated.View
        style={[
          styles.blast,
          {
            opacity: blastOpacity,
            transform: [{ scale: blastScale }],
          },
        ]}
      />

      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
              ],
              backgroundColor: i % 2 === 0 ? midnight.accent.gold : "#E8A040",
            },
          ]}
        />
      ))}

      <Animated.View style={[styles.dust, { opacity: dustOpacity }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  blast: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(196,176,122,0.4)",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
  },
  dust: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: midnight.text.muted,
  },
});
