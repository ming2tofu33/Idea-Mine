/**
 * IDEA MINE — Mock Data
 * API 없이 UI/UX 테스트용. EXPO_PUBLIC_MOCK=true 로 활성화.
 */

import type {
  TodayVeinsResponse,
  RerollResponse,
  MineResponse,
  VaultResponse,
  Keyword,
  Vein,
  Idea,
  UserProfile,
} from "../types/api";

// --- 딜레이 유틸 ---

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- 키워드 풀 ---

const KEYWORDS: Keyword[] = [
  { id: "k1", slug: "healthcare", category: "domain", ko: "헬스케어", en: "Healthcare", is_premium: false },
  { id: "k2", slug: "gen-z", category: "who", ko: "Z세대", en: "Gen Z", is_premium: false },
  { id: "k3", slug: "voice-ai", category: "tech", ko: "음성 AI", en: "Voice AI", is_premium: false },
  { id: "k4", slug: "time-saving", category: "value", ko: "시간 절약", en: "Time Saving", is_premium: false },
  { id: "k5", slug: "subscription", category: "money", ko: "구독", en: "Subscription", is_premium: false },
  { id: "k6", slug: "edtech", category: "domain", ko: "에듀테크", en: "EdTech", is_premium: false },
  { id: "k7", slug: "freelancer", category: "who", ko: "프리랜서", en: "Freelancer", is_premium: false },
  { id: "k8", slug: "llm", category: "ai", ko: "LLM", en: "LLM", is_premium: true },
  { id: "k9", slug: "pet-care", category: "domain", ko: "펫케어", en: "Pet Care", is_premium: false },
  { id: "k10", slug: "multimodal", category: "ai", ko: "멀티모달 AI", en: "Multimodal AI", is_premium: true },
  { id: "k11", slug: "convenience", category: "value", ko: "편의성", en: "Convenience", is_premium: false },
  { id: "k12", slug: "marketplace", category: "money", ko: "마켓플레이스", en: "Marketplace", is_premium: false },
  { id: "k13", slug: "senior", category: "who", ko: "시니어", en: "Senior", is_premium: false },
  { id: "k14", slug: "computer-vision", category: "ai", ko: "컴퓨터 비전", en: "Computer Vision", is_premium: true },
  { id: "k15", slug: "fintech", category: "domain", ko: "핀테크", en: "FinTech", is_premium: false },
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// --- 광맥 생성 ---

function makeVein(slot: number): Vein {
  const kws = pickRandom(KEYWORDS, 5);
  const rarities: Array<"common" | "rare" | "golden" | "legend"> = ["common", "rare", "golden", "legend"];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  return {
    id: `vein-${randomId()}`,
    slot_index: slot,
    keyword_ids: kws.map((k) => k.id),
    keywords: kws,
    rarity,
    is_selected: false,
  };
}

function makeVeins(): Vein[] {
  return [makeVein(1), makeVein(2), makeVein(3)];
}

// --- 아이디어 생성 ---

const IDEA_TEMPLATES: { title: string; summary: string }[] = [
  { title: "AI 음성 건강 코치", summary: "음성 AI로 매일 건강 상태를 체크하고 맞춤 운동/식단을 추천하는 서비스" },
  { title: "Z세대 마이크로 투자 앱", summary: "소액으로 시작하는 Z세대 맞춤 투자 플랫폼. 숏폼 콘텐츠로 금융 리터러시 교육" },
  { title: "프리랜서 프로젝트 매칭", summary: "AI가 프리랜서의 포트폴리오를 분석해 최적의 프로젝트를 자동 매칭" },
  { title: "펫 행동 분석 카메라", summary: "컴퓨터 비전으로 반려동물의 행동 패턴을 분석하고 건강 이상 징후를 조기 감지" },
  { title: "시니어 음성 일기", summary: "말로 기록하는 일기. AI가 감정 분석과 기억 정리를 도와주는 시니어 케어 서비스" },
  { title: "구독형 이러닝 큐레이션", summary: "LLM이 학습 수준을 파악하고 개인화된 커리큘럼을 매주 업데이트" },
  { title: "멀티모달 회의록 자동화", summary: "화상회의 영상+음성+화면을 동시 분석해 요약, 액션아이템, 의사결정을 자동 추출" },
  { title: "마켓플레이스 리뷰 분석기", summary: "리뷰 텍스트를 LLM으로 분석해 실제 구매 만족도와 제품 개선점을 시각화" },
  { title: "편의점 재고 예측 AI", summary: "날씨, 이벤트, 주변 유동인구 데이터를 조합해 편의점 발주량을 최적화" },
  { title: "핀테크 가계부 AI 코치", summary: "소비 패턴을 분석하고 절약 목표를 설정해주는 AI 재정 코치. 게이미피케이션 요소 포함" },
];

const TIER_TYPES: Array<"stable" | "expanded" | "pivot" | "rare"> = [
  "stable", "stable", "stable",
  "expanded", "expanded", "expanded",
  "pivot", "pivot",
  "rare", "rare",
];

function makeIdeas(veinId: string): Idea[] {
  const shuffled = [...IDEA_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.map((t, i) => ({
    id: `idea-${randomId()}`,
    title_ko: t.title,
    title_en: t.title,
    summary_ko: t.summary,
    summary_en: t.summary,
    keyword_combo: pickRandom(KEYWORDS, 3).map((k) => ({
      category: k.category,
      slug: k.slug,
      ko: k.ko,
      en: k.en,
    })),
    tier_type: TIER_TYPES[i],
    sort_order: i + 1,
    is_vaulted: false,
  }));
}

// --- Mock state ---

let mockRerollCount = 0;
let mockGenerationCount = 0;
let currentVeins = makeVeins();

// --- Mock API exports ---

export const mockMiningApi = {
  async getTodayVeins(): Promise<TodayVeinsResponse> {
    await delay(300);
    return {
      veins: currentVeins,
      rerolls_used: mockRerollCount,
      rerolls_max: 2,
      generations_used: mockGenerationCount,
      generations_max: 1,
    };
  },

  async reroll(): Promise<RerollResponse> {
    await delay(400);
    mockRerollCount++;
    currentVeins = makeVeins();
    return {
      veins: currentVeins,
      rerolls_used: mockRerollCount,
      rerolls_max: 2,
    };
  },

  async mine(veinId: string): Promise<MineResponse> {
    await delay(2000);
    mockGenerationCount++;
    return {
      ideas: makeIdeas(veinId),
      vein_id: veinId,
    };
  },
};

export const mockIdeasApi = {
  async vaultIdeas(ideaIds: string[], veinId: string): Promise<VaultResponse> {
    await delay(300);
    return {
      vaulted_count: ideaIds.length,
      idea_ids: ideaIds,
    };
  },
};

export const mockAdminApi = {
  async setPersona(personaTier: string | null): Promise<{ status: string; persona_tier: string | null }> {
    await delay(100);
    return { status: "ok", persona_tier: personaTier };
  },

  async resetDailyState(): Promise<{ status: string }> {
    await delay(200);
    mockRerollCount = 0;
    mockGenerationCount = 0;
    return { status: "ok" };
  },

  async regenerateVeins(): Promise<TodayVeinsResponse> {
    await delay(400);
    currentVeins = makeVeins();
    return {
      veins: currentVeins,
      rerolls_used: mockRerollCount,
      rerolls_max: 2,
      generations_used: mockGenerationCount,
      generations_max: 1,
    };
  },
};

export const MOCK_PROFILE: UserProfile = {
  id: "mock-user-001",
  nickname: "테스트 광부",
  language: "ko",
  tier: "free",
  miner_level: 3,
  streak_days: 7,
  role: "admin",
  persona_tier: null,
};
