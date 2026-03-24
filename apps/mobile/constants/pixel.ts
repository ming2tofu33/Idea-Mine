import { Platform } from "react-native";

export const pixel = {
  // 4px 그리드 간격
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // 테두리
  border: {
    width: 2,
  },

  // 하드 섀도우 (blur 없음)
  shadow: {
    hard: {
      shadowColor: "#000000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 0,
      elevation: 2,
    },
  },

  // 애니메이션 duration
  anim: {
    snap: 50,
    quick: 100,
    normal: 300,
  },
} as const;

/**
 * 4방향 하이라이트/섀도우 테두리 생성 헬퍼.
 * highlight: 밝은 면 (상, 좌), shadow: 어두운 면 (하, 우)
 */
export function pixelBorder(highlight: string, shadow: string) {
  return {
    borderWidth: pixel.border.width,
    borderTopColor: highlight,
    borderLeftColor: highlight,
    borderBottomColor: shadow,
    borderRightColor: shadow,
  };
}
