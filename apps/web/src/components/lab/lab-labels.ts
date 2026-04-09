/**
 * Lab 페이지 다국어 라벨
 */

export type LabLanguage = "ko" | "en";

export const LAB_LABELS = {
  // PageHeader
  eyebrow: { ko: "실험실", en: "LAB" },
  title: { ko: "실험실", en: "The Lab" },
  subtitle: {
    ko: "수집한 아이디어를 분석하고 정제하는 공간입니다",
    en: "Analyze and refine the ideas you've collected",
  },

  // Section headers
  pendingOverview: { ko: "개요 대기", en: "Pending overview" },
  recentDocuments: { ko: "최근 문서", en: "Recent documents" },

  // Status badges
  overview: { ko: "개요", en: "Overview" },
  generateOverview: { ko: "개요 생성", en: "Generate overview" },

  // Empty states
  noIdeasTitle: { ko: "아이디어가 없습니다", en: "No ideas yet" },
  allOverviewsTitle: {
    ko: "모든 아이디어에 개요가 생성되었습니다",
    en: "Every idea already has an overview",
  },
  noIdeasDesc: {
    ko: "금고에 아이디어를 먼저 저장해주세요",
    en: "Save some ideas in the vault first",
  },
  newIdeasDesc: {
    ko: "새로운 아이디어를 채굴해보세요",
    en: "Mine some new ideas",
  },
  goToMine: { ko: "광산으로 이동", en: "Go to the Mine" },
  noDocumentsYet: {
    ko: "아직 생성된 문서가 없습니다",
    en: "No documents generated yet",
  },
} as const;
