/**
 * IDEA MINE — Theme Tokens
 * 기반: Midnight (쿨 잉크) + IDEA MINE 세계관 컬러
 * 골드 기본, 핑크는 포인트로만.
 */

export const midnight = {
  // 배경 — 깊은 잉크빛 동굴
  bg: {
    deep: "#08090E",
    primary: "#101218",
    elevated: "#1A1C25",
    surface: "#222433",
  },

  // 텍스트 — 은빛
  text: {
    primary: "#C8CDD8",
    secondary: "#A0A6B4",
    muted: "#7E8596",
    onAccent: "#FFFFFF",
  },

  // 경계
  border: {
    default: "#2E3242",
    subtle: "rgba(255,255,255,0.06)",
  },

  // 그림자
  shadow: {
    default: "rgba(0,0,0,0.6)",
  },

  // 골드 — 기본 액센트 (보상, 레벨업)
  accent: {
    gold: "#C4B07A",
    goldHover: "#D4C08A",
    goldDark: "#8A7A50",
    goldGlow: "rgba(196,176,122,0.15)",
    goldSubtle: "rgba(196,176,122,0.08)",
    inactive: "#4A5170",
  },

  // 핑크 — 포인트 (CTA, 핑크 결정)
  pink: {
    default: "#EC4899",
    hover: "#F472B6",
    pressed: "#DB2777",
    dark: "#B03570",
    glow: "rgba(236,72,153,0.15)",
    subtle: "rgba(236,72,153,0.08)",
  },

  // 퍼플 — 희귀/Pro
  purple: {
    default: "#8B5CF6",
    hover: "#A78BFA",
    glow: "rgba(139,92,246,0.15)",
  },

  // 블루 — 탐색/호버
  blue: {
    default: "#6496FF",
    glow: "rgba(100,150,255,0.12)",
    subtle: "rgba(100,150,255,0.06)",
  },

  // 상태
  status: {
    success: "#4E9A6B",
    warning: "#C9A044",
    error: "#B85450",
  },
} as const;

/**
 * Lab — 민트 블루 실험실
 * 레퍼런스: lab-screen-direction.md + 민트 톤 픽셀 아트
 */
export const lab = {
  // 배경
  bg: {
    wall: "#2A4A4A",
    floor: "#3A5A5A",
    wallTranslucent: "rgba(42,74,74,0.7)",
    wallSolid: "rgba(42,74,74,0.85)",
    itemBg: "rgba(58,90,90,0.6)",
    hudBadge: "rgba(16,18,24,0.6)",
  },

  // 작업대
  bench: {
    default: "#5BBFAA",
    light: "#7AD4BC",
    dark: "#4A9A8A",
  },

  // 패널/UI 영역
  panel: {
    default: "#A8E6CF",
    border: "#7AC4A8",
  },

  // 소품/장비
  equipment: {
    default: "#3D6B6B",
    light: "#4A7A7A",
  },

  // 발광
  glow: "rgba(168,230,207,0.12)",
} as const;
