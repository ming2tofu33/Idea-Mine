import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Easing } from "react-native";
import { midnight } from "../../constants/theme";
import { pixel } from "../../constants/pixel";
import { PixelText } from "../PixelText";

interface RerollBlastProps {
  onComplete: () => void;
}

export function RerollBlast({ onComplete }: RerollBlastProps) {
  const blastScale = useRef(new Animated.Value(0)).current;
  const blastOpacity = useRef(new Animated.Value(0)).current;
  const dustOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const particles = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const particleAnims = particles.map((p, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 50 + Math.random() * 40;
      return Animated.parallel([
        Animated.timing(p.opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(p.x, {
          toValue: Math.cos(angle) * distance,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: Math.sin(angle) * distance,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
    });

    const particleFade = particles.map((p) =>
      Animated.timing(p.opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    );

    Animated.sequence([
      // 1. 폭발 + 파티클 확산 (750ms)
      Animated.parallel([
        Animated.timing(blastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(blastScale, { toValue: 2, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ...particleAnims,
      ]),
      // 2. 폭발 사라짐 + 먼지 등장 + 파티클 페이드 (400ms)
      Animated.parallel([
        Animated.timing(blastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(dustOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
        ...particleFade,
      ]),
      // 3. 먼지 천천히 사라짐 (600ms)
      Animated.timing(dustOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 4. 컨테이너 페이드아웃 (150ms)
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 150,
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
      >
        <PixelText emoji style={{ fontSize: pixel.emoji.scene, textAlign: 'center' }}>
          💥
        </PixelText>
      </Animated.View>

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
              backgroundColor: i % 3 === 0 ? midnight.accent.gold : i % 3 === 1 ? "#E8A040" : "#D4C08A",
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
    width: 70,
    height: 70,
    borderRadius: 35,
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
