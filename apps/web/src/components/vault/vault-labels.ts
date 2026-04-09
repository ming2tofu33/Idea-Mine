/**
 * Vault 페이지 다국어 라벨
 *
 * Mine 라벨과 동일한 패턴: 컴포넌트에서 lang prop을 받아 사용.
 */

export type VaultLanguage = "ko" | "en";

export const VAULT_LABELS = {
  // PageHeader
  eyebrow: { ko: "금고", en: "VAULT" },
  title: { ko: "금고", en: "The Vault" },
  subtitle: {
    ko: "채굴한 아이디어를 보관하고 관리하는 공간입니다",
    en: "Store and manage the ideas you've mined",
  },
  ideasCount: {
    ko: (n: number) => `아이디어 ${n}개`,
    en: (n: number) => `${n} ideas`,
  },

  // Workflow steps
  workflow: {
    raw: { ko: "원석", en: "Raw" },
    overview: { ko: "개요", en: "Overview" },
    appraisal: { ko: "감정", en: "Appraisal" },
    fullOverview: { ko: "풀 개요", en: "Full overview" },
  },
  overviewComplete: { ko: "개요 완료", en: "Overview ready" },
  rawStone: { ko: "원석", en: "Raw stone" },

  // Delete confirm
  deleteConfirm: { ko: "삭제?", en: "Delete?" },
  deleting: { ko: "...", en: "..." },

  // Error / empty states
  loadFailed: {
    ko: "금고를 불러오지 못했습니다",
    en: "Couldn't load the vault",
  },
  unknownError: { ko: "알 수 없는 오류", en: "Unknown error" },
  emptyTitle: { ko: "아직 아이디어가 없어요", en: "No ideas yet" },
  emptyHint: {
    ko: "광산에서 마음에 드는 아이디어를 채굴해 금고에 반입해보세요",
    en: "Mine some ideas you like and bring them into the vault",
  },
  goToMine: { ko: "광산으로 가기", en: "Go to the Mine" },
} as const;
