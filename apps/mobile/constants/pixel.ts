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

  // 이모지 사이즈 체계
  emoji: {
    hero: 80,    // 화면 포컬 포인트 (입장, 로더 등)
    scene: 48,   // 장면 속 오브젝트 (광맥, 소품, 장비)
    icon: 24,    // 인라인 아이콘, 스탯, 라벨
  },

  // 테두리
  border: {
    width: 2,
  },

  // ── 그림자 규칙 ──
  // hard: 기본값. 버튼, 카드, 입력필드 등 인터랙티브 UI
  // glow: 특별한 상태에만. 희귀도 강조, 선택/활성 상태, 마법적 연출
  shadow: {
    hard: {
      shadowColor: "#000000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 0,
      elevation: 2,
    },
  },

  // 오버레이 투명도
  overlay: {
    modal: "rgba(0,0,0,0.7)",
    sheet: "rgba(0,0,0,0.5)",
    scene: "rgba(8,9,14,0.35)",
    hud: "rgba(8,9,14,0.6)",
  },

  // 애니메이션 duration
  anim: {
    snap: 50,
    quick: 100,
    fast: 150,
    normal: 300,
    slow: 600,
    loading: 1200,
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

/**
 * 글로우 효과 헬퍼. 희귀도 강조 · 선택 상태 · 마법적 연출에만 사용.
 * color: 발광 색상 (테마 accent 색상), radius: 확산 범위 (기본 8)
 */
export function pixelGlow(color: string, radius = 8) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 } as const,
    shadowOpacity: 0.4,
    shadowRadius: radius,
    elevation: radius,
  };
}
