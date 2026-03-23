import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { midnight } from "../constants/theme";

interface PixelLoadingBarProps {
  /** 블록 개수 (기본 8) */
  blocks?: number;
  /** 바 색상 (기본 accent.gold) */
  color?: string;
  /** 한 사이클 시간 ms (기본 2000) */
  duration?: number;
  /** 바 너비 (기본 200) */
  width?: number;
}

export function PixelLoadingBar({
  blocks = 8,
  color = midnight.accent.gold,
  duration = 2000,
  width = 200,
}: PixelLoadingBarProps) {
  const anims = useRef(
    Array.from({ length: blocks }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const stagger = duration / blocks;

    const forward = Animated.stagger(
      stagger,
      anims.map((a) =>
        Animated.timing(a, {
          toValue: 1,
          duration: stagger * 0.6,
          useNativeDriver: false,
        })
      )
    );

    const backward = Animated.stagger(
      stagger,
      anims.map((a) =>
        Animated.timing(a, {
          toValue: 0,
          duration: stagger * 0.6,
          useNativeDriver: false,
        })
      )
    );

    const loop = Animated.loop(
      Animated.sequence([forward, Animated.delay(200), backward, Animated.delay(400)])
    );

    loop.start();
    return () => loop.stop();
  }, [anims, blocks, duration]);

  const blockSize = Math.floor((width - (blocks - 1) * 2 - 4) / blocks);

  return (
    <View
      style={[
        styles.container,
        {
          width,
          borderColor: color,
        },
      ]}
    >
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.block,
            {
              width: blockSize,
              height: 12,
              backgroundColor: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ["transparent", color],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 2,
    padding: 2,
    gap: 2,
    alignSelf: "center",
  },
  block: {},
});
