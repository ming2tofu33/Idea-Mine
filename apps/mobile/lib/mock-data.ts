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
import type { Overview } from "../types/overview";
import type { Appraisal, AppraisalDepth } from "../types/appraisal";
import type { FullOverview } from "../types/full_overview";

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
  const timestamp = new Date().toISOString();
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

const TIER_TYPES: Array<"stable" | "expansion" | "pivot" | "rare"> = [
  "stable", "stable", "stable",
  "expansion", "expansion", "expansion",
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
let lastMinedIdeas: Idea[] = [];

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
    const ideas = makeIdeas(veinId);
    lastMinedIdeas = ideas;
    return {
      ideas,
      vein_id: veinId,
    };
  },
};

export const mockIdeasApi = {
  async vaultIdeas(ideaIds: string[], veinId: string): Promise<VaultResponse> {
    await delay(300);
    // Mock: 마지막 채굴 결과에서 해당 아이디어를 금고에 추가
    const lastMined = lastMinedIdeas.filter((i) => ideaIds.includes(i.id));
    for (const idea of lastMined) {
      idea.is_vaulted = true;
      if (!mockVaultedIdeas.find((v) => v.id === idea.id)) {
        mockVaultedIdeas.push(idea);
      }
    }
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

// --- Mock Vault state ---

let mockVaultedIdeas: Idea[] = [];
let mockOverviews: Overview[] = [];

export const mockVaultApi = {
  async getVaultedIdeas(): Promise<Idea[]> {
    await delay(200);
    return mockVaultedIdeas;
  },

  async getOverviews(): Promise<Overview[]> {
    await delay(200);
    return mockOverviews;
  },

  async getIdea(ideaId: string): Promise<Idea | null> {
    await delay(150);
    return mockVaultedIdeas.find((i) => i.id === ideaId) ?? null;
  },

  async getOverview(overviewId: string): Promise<Overview | null> {
    await delay(150);
    return mockOverviews.find((o) => o.id === overviewId) ?? null;
  },

  async deleteIdea(ideaId: string): Promise<void> {
    await delay(150);
    mockVaultedIdeas = mockVaultedIdeas.filter((i) => i.id !== ideaId);
  },

  async getAppraisal(appraisalId: string): Promise<Appraisal | null> {
    await delay(150);
    return mockAppraisals.find((a) => a.id === appraisalId) ?? null;
  },

  async getAppraisalsByOverview(overviewId: string): Promise<Appraisal[]> {
    await delay(150);
    return mockAppraisals.filter((a) => a.overview_id === overviewId);
  },
};

// --- Mock Lab ---

let mockAppraisals: Appraisal[] = [];

function makeMockOverview(ideaId: string): Overview {
  const idea = mockVaultedIdeas.find((i) => i.id === ideaId);
  const title = idea?.title_ko ?? "Mock 아이디어";
  return {
    id: `overview-${randomId()}`,
    idea_id: ideaId,
    user_id: "mock-user",
    concept_ko: `${title}의 핵심 컨셉입니다. AI 기술을 활용해 사용자 문제를 해결합니다.`,
    concept_en: `Core concept for ${title}. Uses AI to solve user problems.`,
    problem_ko: "기존 솔루션은 사용자 맞춤이 부족하고, 수동 작업이 많아 비효율적입니다.",
    problem_en: "Existing solutions lack personalization and require too much manual work.",
    target_ko: "25-35세 직장인 중 업무 효율화에 관심 있는 얼리어답터",
    target_en: "Working professionals aged 25-35 interested in productivity optimization",
    features_ko: "1. AI 맞춤 추천\n2. 자동 분석 대시보드\n3. 실시간 알림 시스템",
    features_en: "1. AI personalized recommendations\n2. Auto-analysis dashboard\n3. Real-time notification system",
    differentiator_ko: "경쟁사 대비 AI 정확도와 UX 간결성에서 차별화됩니다.",
    differentiator_en: "Differentiated by AI accuracy and UX simplicity vs competitors.",
    revenue_ko: "프리미엄 구독 모델 ($9.99/월). 무료 체험 후 전환.",
    revenue_en: "Premium subscription ($9.99/mo). Free trial conversion.",
    mvp_scope_ko: "핵심 기능 3개 + 온보딩 + 기본 분석. 4주 내 출시 목표.",
    mvp_scope_en: "3 core features + onboarding + basic analytics. 4-week launch target.",
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function makeMockAppraisal(overviewId: string, depth: AppraisalDepth): Appraisal {
  const base: Appraisal = {
    id: `appraisal-${randomId()}`,
    overview_id: overviewId,
    depth,
    market_fit_ko: "헬스케어 AI 시장이 연 23% 성장 중. 타이밍이 좋지만 경쟁 진입이 빠른 영역.",
    market_fit_en: "Healthcare AI market growing 23% YoY. Good timing but fast-moving competition.",
    feasibility_ko: "기술적으로 현재 API 생태계로 MVP 구현 가능. 데이터 수집이 관건.",
    feasibility_en: "Technically feasible with current API ecosystem. Data collection is key challenge.",
    risk_ko: "규제 리스크가 가장 큼. 개인정보 처리 방침 및 의료법 검토 필요.",
    risk_en: "Regulatory risk is highest. Privacy policy and health law review needed.",
    created_at: new Date().toISOString(),
  };

  if (depth !== "basic_free") {
    base.problem_fit_ko = "타겟 유저의 페인포인트와 솔루션 방향이 잘 맞음. 다만 '얼마나 자주' 겪는 문제인지 검증 필요.";
    base.problem_fit_en = "Good alignment between pain point and solution direction. Frequency validation needed.";
    base.differentiation_ko = "AI 정확도 자체보다 UX 간결성이 진짜 차별점. 경쟁사들은 기능 과잉 경향.";
    base.differentiation_en = "UX simplicity over AI accuracy is the real differentiator. Competitors tend to over-feature.";
    base.scalability_ko = "B2C에서 시작해 B2B로 확장 가능. 단, 초기 PMF 확보가 선행 조건.";
    base.scalability_en = "Can expand from B2C to B2B. But initial PMF is prerequisite.";
  }

  return base;
}

function makeMockFullOverview(overviewId: string): FullOverview {
  const timestamp = new Date().toISOString();
  return {
    id: `full-overview-${randomId()}`,
    user_id: "mock-user",
    overview_id: overviewId,
    concept: "AI 기반 개인 건강 코치 — 음성 입력으로 매일 건강 상태를 기록하고 맞춤 조언을 제공",
    problem: "건강 관리 앱이 너무 많지만 '꾸준히 쓰는 앱'은 없음. 입력이 번거롭고 조언이 일반적.",
    target_user: "25-35세 직장인, 건강에 관심은 있지만 시간이 없는 사람. 특히 재택근무 증가로 활동량 감소를 체감하는 층.",
    features_must: ["음성 건강 체크인 (1분)", "AI 맞춤 운동/식단 추천", "주간 건강 리포트"],
    features_should: ["감정 상태 트래킹", "수면 패턴 분석", "운동 루틴 자동 생성"],
    features_later: ["전문가 연결", "웨어러블 연동", "가족 건강 대시보드"],
    user_flow: ["앱 진입", "음성으로 오늘 상태 기록 (1분)", "AI 분석 결과 확인", "오늘의 추천 행동 확인", "실행 체크 + 기록"],
    screens: ["온보딩 (3단계)", "홈 (오늘의 체크인)", "기록 상세", "주간 리포트", "설정/프로필"],
    business_model: "프리미엄 구독 $9.99/월. 무료: 기본 체크인 + 주간 리포트. 유료: AI 맞춤 추천 + 심층 분석 + 전문가.",
    business_rules: ["무료 체크인 1일 1회", "유료 체크인 무제한", "데이터 30일 보관 (무료) / 무제한 (유료)"],
    mvp_scope: "음성 체크인 + AI 추천 + 주간 리포트. 4주 개발, 2주 테스트.",
    tech_stack: { frontend: "React Native (Expo)", backend: "Supabase + Python", ai: "OpenAI Whisper + GPT-4o", push: "Expo Notifications" },
    data_model_sql: "users, health_records, recommendations, weekly_reports",
    api_endpoints: ["POST /checkin", "GET /recommendations", "GET /reports/weekly", "POST /auth/signup"],
    file_structure: "app/(tabs)/ — 홈, 기록, 리포트, 설정\nlib/ — api, supabase\ncomponents/ — 체크인, 추천카드, 리포트",
    external_services: ["OpenAI API (Whisper + GPT-4o)", "Supabase Auth + DB", "Expo Notifications"],
    auth_flow: ["이메일/소셜 가입", "Supabase Auth 토큰 발급", "프로필 생성", "온보딩 완료"],
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export const mockLabApi = {
  async createOverview(ideaId: string): Promise<Overview> {
    await delay(2500);
    const overview = makeMockOverview(ideaId);
    mockOverviews.push(overview);
    return overview;
  },

  async createAppraisal(overviewId: string, depth: AppraisalDepth = "basic"): Promise<Appraisal> {
    await delay(2000);
    const appraisal = makeMockAppraisal(overviewId, depth);
    mockAppraisals.push(appraisal);
    return appraisal;
  },

  async createFullOverview(overviewId: string): Promise<FullOverview> {
    await delay(3000);
    return makeMockFullOverview(overviewId);
  },
};

// --- Mock Profile ---

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
