/**
 * IDEA MINE — Mining Constants
 * 카테고리 색상, 희귀도 설정, 가방 용량, 로딩 메시지
 */

import { midnight } from "./theme";

export const CATEGORY_COLORS: Record<string, string> = {
  ai: "#8B5CF6",
  who: "#EC4899",
  domain: "#4E9A6B",
  tech: "#6496FF",
  value: "#C9A044",
  money: "#B85450",
};

export const CATEGORY_LABELS: Record<string, { ko: string; en: string }> = {
  ai: { ko: "AI", en: "AI" },
  who: { ko: "누구", en: "Who" },
  domain: { ko: "분야", en: "Domain" },
  tech: { ko: "기술", en: "Tech" },
  value: { ko: "가치", en: "Value" },
  money: { ko: "수익", en: "Money" },
};

export const RARITY_CONFIG: Record<string, {
  label: { ko: string; en: string };
  icon?: string;
  color: string;
  borderColor: string;
}> = {
  common: {
    label: { ko: "일반", en: "Common" },
    color: midnight.text.muted,
    borderColor: midnight.border.default,
  },
  rare: {
    label: { ko: "희귀", en: "Rare" },
    icon: "✦",
    color: midnight.purple.default,
    borderColor: midnight.purple.default,
  },
  golden: {
    label: { ko: "금빛", en: "Golden" },
    icon: "★",
    color: midnight.accent.gold,
    borderColor: midnight.accent.gold,
  },
  legend: {
    label: { ko: "전설", en: "Legend" },
    icon: "◆",
    color: "#E0E0E0",
    borderColor: "#E0E0E0",
  },
};

/** tier_type → rarity 변환. 아이디어(tier_type)와 광맥(rarity) 용어 매핑. */
export function tierToRarity(tierType: string): string {
  const map: Record<string, string> = {
    stable: "common",
    expanded: "rare",
    pivot: "golden",
    rare: "legend",
  };
  return map[tierType] ?? "common";
}

/** rarity에 대응하는 gem 스프라이트 require */
export const GEM_SPRITES: Record<string, ReturnType<typeof require>> = {
  common: require("../assets/sprites/items/32/gem-vaulted-common.png"),
  rare: require("../assets/sprites/items/32/gem-vaulted-rare.png"),
  golden: require("../assets/sprites/items/32/gem-vaulted-golden.png"),
  legend: require("../assets/sprites/items/32/gem-vaulted-legend.png"),
};

export const BAG_CAPACITY_BY_LEVEL: Record<number, number> = {
  1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 5, 10: 5,
};

export function getBagCapacity(level: number): number {
  if (level <= 0) return 2;
  if (level > 10) return 5;
  return BAG_CAPACITY_BY_LEVEL[level] ?? 2;
}

export const MINING_LOADER_MESSAGES = [
  { ko: "광맥을 스캔하는 중...", en: "Scanning the vein..." },
  { ko: "결정 구조를 분석하는 중...", en: "Analyzing crystal structure..." },
  { ko: "아이디어 결정을 추출하는 중...", en: "Extracting idea crystals..." },
  { ko: "원석의 순도를 측정하는 중...", en: "Measuring gem purity..." },
  { ko: "아이디어를 결정화하는 중...", en: "Crystallizing ideas..." },
  { ko: "거의 다 캤어요...", en: "Almost done mining..." },
  { ko: "마지막 결정을 다듬는 중...", en: "Polishing the final crystal..." },
];
