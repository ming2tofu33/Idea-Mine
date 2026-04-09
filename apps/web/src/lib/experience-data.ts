/**
 * 공개 체험 데모 데이터
 *
 * 비로그인 사용자를 위한 큐레이션된 데모 광맥과 아이디어.
 * 실제 API 호출 없이 정적 데이터를 사용하여 비용과 남용 리스크 제어.
 */

import type {
  Idea,
  Keyword,
  KeywordComboEntry,
  Overview,
  TodayVeinsResponse,
  Vein,
} from "@/types/api";
import type { ExperienceIdea, ExperienceVein } from "@/types/experience";

const DEMO_VEINS: ExperienceVein[] = [
  {
    id: "demo-health",
    slug: "demo-health",
    codename: "apex return",
    rarity: "golden",
    keywords: [
      { category: "ai", ko: "음성 감정 분석", en: "Voice Emotion AI" },
      { category: "who", ko: "1인 가구 시니어", en: "Senior Solo Households" },
      { category: "domain", ko: "정신 건강", en: "Mental Health" },
      { category: "tech", ko: "모바일 앱", en: "Mobile App" },
      { category: "value", ko: "일상 모니터링", en: "Daily Monitoring" },
    ],
    previewLineKo: "1인 가구 시니어의 고립감을 음성으로 감지",
    previewLineEn: "Detect senior isolation through voice signals",
  },
  {
    id: "demo-commerce",
    slug: "demo-commerce",
    codename: "lateral echo",
    rarity: "rare",
    keywords: [
      { category: "ai", ko: "이미지 생성 AI", en: "Image Generation AI" },
      { category: "who", ko: "소규모 크리에이터", en: "Small Creators" },
      { category: "domain", ko: "커머스", en: "Commerce" },
      { category: "tech", ko: "웹 플랫폼", en: "Web Platform" },
      { category: "money", ko: "구독형", en: "Subscription" },
    ],
    previewLineKo: "크리에이터가 1분 만에 상품 이미지를 완성",
    previewLineEn: "Creators finish product images in one minute",
  },
  {
    id: "demo-education",
    slug: "demo-education",
    codename: "edge echo",
    rarity: "common",
    keywords: [
      { category: "ai", ko: "개인화 튜터 AI", en: "Personalized Tutor AI" },
      { category: "who", ko: "초등 학부모", en: "Elementary School Parents" },
      { category: "domain", ko: "에듀테크", en: "EdTech" },
      { category: "tech", ko: "태블릿 앱", en: "Tablet App" },
      { category: "value", ko: "학습 진도 관리", en: "Progress Management" },
    ],
    previewLineKo: "아이의 학습 흐름을 부모에게 실시간 요약",
    previewLineEn: "Summarize child learning flow for parents in real time",
  },
];

const DEMO_IDEAS: Record<string, ExperienceIdea[]> = {
  "demo-health": [
    {
      id: "demo-health-1",
      titleKo: "목소리 일기 — 시니어 고립 감지기",
      titleEn: "Voice Diary — Senior Isolation Detector",
      summaryKo:
        "매일 5분간 시니어가 자유롭게 말하는 음성을 AI가 분석해 우울, 불안, 인지 저하 신호를 가족에게 알립니다.",
      summaryEn:
        "AI analyzes 5 minutes of daily voice from seniors and alerts families about signs of depression, anxiety, or cognitive decline.",
      signalLineKo: "요양원 대신 집에서도 가능한 지속 관찰",
      signalLineEn: "Continuous observation at home instead of a nursing facility",
    },
    {
      id: "demo-health-2",
      titleKo: "가족 대화 브릿지 — 감정 요약 리포트",
      titleEn: "Family Conversation Bridge — Emotion Summary Report",
      summaryKo:
        "주 1회 시니어의 감정 흐름을 요약해 자녀에게 발송하고, 어떤 대화 주제가 시니어에게 활력을 주는지 추천합니다.",
      summaryEn:
        "Weekly emotion summaries are sent to adult children with suggested topics that energize their parents.",
      signalLineKo: "자녀와의 대화가 의무가 아니라 설계된 돌봄으로 변환",
      signalLineEn: "Turns weekly calls from obligation into designed care",
    },
    {
      id: "demo-health-3",
      titleKo: "응급 신호 에스컬레이션 라인",
      titleEn: "Emergency Signal Escalation Line",
      summaryKo:
        "음성에서 급성 우울 또는 자해 신호가 감지되면 근처 응급 서비스와 가족에게 동시에 알림을 전송합니다.",
      summaryEn:
        "When acute depression or self-harm signals appear, alerts are sent simultaneously to local emergency services and family.",
      signalLineKo: "B2G 공공 헬스 예산과 연결 가능한 진입점",
      signalLineEn: "An entry point that connects to public health budgets",
    },
  ],
  "demo-commerce": [
    {
      id: "demo-commerce-1",
      titleKo: "스튜디오 없이 찍는 상품 사진",
      titleEn: "Product Photos Without a Studio",
      summaryKo:
        "스마트폰으로 찍은 상품 사진을 AI가 스튜디오급 이미지로 변환하고, 배경과 조명을 브랜드 톤에 맞게 자동 조정합니다.",
      summaryEn:
        "AI converts smartphone shots into studio-quality product images and auto-adjusts background and lighting to brand tone.",
      signalLineKo: "1인 스토어 운영자의 월 사진 비용을 0에 수렴시킴",
      signalLineEn: "Shrinks monthly photo cost to near zero for solo merchants",
    },
    {
      id: "demo-commerce-2",
      titleKo: "시즌 캠페인 자동 생성기",
      titleEn: "Seasonal Campaign Auto-Generator",
      summaryKo:
        "계절, 절기, 트렌드 키워드를 입력하면 상품 이미지, 배너, 캡션을 한 번에 생성해 SNS에 바로 게시할 수 있습니다.",
      summaryEn:
        "Type a season, holiday, or trend keyword to generate product images, banners, and captions ready for social posts.",
      signalLineKo: "캠페인 기획 회의가 사라지는 크리에이터 워크플로우",
      signalLineEn: "A creator workflow that eliminates campaign planning meetings",
    },
    {
      id: "demo-commerce-3",
      titleKo: "브랜드 기억 보관소",
      titleEn: "Brand Memory Vault",
      summaryKo:
        "과거에 사용했던 색감, 폰트, 로고, 이미지 스타일을 학습해 이후 모든 생성물이 일관된 브랜드 톤을 유지합니다.",
      summaryEn:
        "Learns past colors, fonts, logos, and image styles so every new asset stays on brand.",
      signalLineKo: "브랜드 일관성이 유료 전환 포인트로 작동",
      signalLineEn: "Brand consistency becomes the paid conversion trigger",
    },
  ],
  "demo-education": [
    {
      id: "demo-education-1",
      titleKo: "학습 일일 리포트",
      titleEn: "Daily Learning Report",
      summaryKo:
        "아이가 오늘 어떤 문제를 풀고, 어디서 멈췄고, 어떤 개념을 이해했는지 AI가 한 장으로 요약해 부모에게 전달합니다.",
      summaryEn:
        "A one-page summary of what the child solved, where they got stuck, and which concepts clicked, delivered to parents.",
      signalLineKo: "학원 상담 대신 매일 확인하는 투명한 학습 창",
      signalLineEn: "A transparent daily window instead of quarterly tutor meetings",
    },
    {
      id: "demo-education-2",
      titleKo: "이 문제 왜 틀렸을까? — 설명 튜터",
      titleEn: "Why did I miss this? — Explanation Tutor",
      summaryKo:
        "틀린 문제에 대해 아이 수준에 맞춘 단계별 해설을 제공하고, 비슷한 유형의 연습 문제를 자동으로 추천합니다.",
      summaryEn:
        "Provides step-by-step explanations matched to the child's level and recommends similar practice problems.",
      signalLineKo: "틀린 문제가 더 많은 학습으로 연결되는 구조",
      signalLineEn: "A structure where wrong answers become deeper learning",
    },
    {
      id: "demo-education-3",
      titleKo: "학부모 질문 번역기",
      titleEn: "Parent Question Translator",
      summaryKo:
        "부모가 입력한 일상 질문을 교과 과정 용어로 번역하고, 교사와 공유할 수 있는 형식으로 정리해줍니다.",
      summaryEn:
        "Translates everyday parent questions into curriculum terms and formats them for sharing with teachers.",
      signalLineKo: "학부모와 교사 사이 언어 장벽을 해소하는 도구",
      signalLineEn: "A tool that removes the language gap between parents and teachers",
    },
  ],
};

export function getExperienceVeins(): ExperienceVein[] {
  return DEMO_VEINS;
}

export function getExperienceVeinById(id: string): ExperienceVein | null {
  return DEMO_VEINS.find((vein) => vein.id === id) ?? null;
}

export function getExperienceIdeasByVeinId(id: string): ExperienceIdea[] {
  return DEMO_IDEAS[id] ?? [];
}

// --- Adapters: ExperienceVein → real Vein shape ---
// 실제 Mine 컴포넌트(SectorScanStage, SelectedVeinPanel)를 데모에서 그대로
// 재사용하기 위한 타입 변환. 데모용이므로 id는 데모 prefix 유지.

function experienceKeywordToKeyword(
  kw: ExperienceVein["keywords"][number],
  veinId: string,
  index: number,
): Keyword {
  return {
    id: `${veinId}-kw-${index}`,
    slug: `${veinId}-kw-${index}`,
    category: kw.category,
    ko: kw.ko,
    en: kw.en,
    is_premium: false,
  };
}

export function experienceVeinToVein(
  experience: ExperienceVein,
  slotIndex: number,
): Vein {
  // legend는 데모에 없으므로 golden까지만. 타입 캐스트로 호환.
  const rarity =
    experience.rarity === "common" ||
    experience.rarity === "rare" ||
    experience.rarity === "golden"
      ? experience.rarity
      : "common";

  const keywords = experience.keywords.map((kw, i) =>
    experienceKeywordToKeyword(kw, experience.id, i),
  );

  return {
    id: experience.id,
    slot_index: slotIndex,
    keyword_ids: keywords.map((k) => k.id),
    keywords,
    rarity,
    is_selected: false,
  };
}

/**
 * 데모용 TodayVeinsResponse 생성. 실제 useQuery 응답과 동일한 모양.
 * 카운터(rerolls/generations)는 데모에서 의미 없지만 UI 일관성을 위해 0/0으로.
 */
export function getDemoTodayVeinsResponse(): TodayVeinsResponse {
  const veins = DEMO_VEINS.map((v, i) => experienceVeinToVein(v, i + 1));
  return {
    veins,
    rerolls_used: 0,
    rerolls_max: 0,
    generations_used: 0,
    generations_max: 0,
  };
}

// --- Adapters: ExperienceIdea → real Idea / Overview ---

/**
 * ExperienceIdea를 실제 Idea 타입으로 변환.
 * keyword_combo는 해당 vein의 키워드 4개를 사용.
 */
export function experienceIdeaToIdea(
  exp: ExperienceIdea,
  veinId: string,
  sortOrder: number,
): Idea {
  const vein = getExperienceVeinById(veinId);
  const keyword_combo: KeywordComboEntry[] =
    vein?.keywords.slice(0, 4).map((kw) => ({
      category: kw.category,
      slug: kw.ko,
      ko: kw.ko,
      en: kw.en,
    })) ?? [];

  return {
    id: exp.id,
    title_ko: exp.titleKo,
    title_en: exp.titleEn,
    summary_ko: exp.summaryKo,
    summary_en: exp.summaryEn,
    keyword_combo,
    tier_type: "stable",
    sort_order: sortOrder,
    is_vaulted: true,
  };
}

/**
 * 데모용 금고 아이디어 목록 — 9개 (3 vein × 3 idea).
 * Vault와 Lab 페이지가 공유.
 */
export function getDemoVaultedIdeas(): Idea[] {
  return DEMO_VEINS.flatMap((vein) =>
    (DEMO_IDEAS[vein.id] ?? []).map((exp, i) =>
      experienceIdeaToIdea(exp, vein.id, i),
    ),
  );
}

/**
 * 데모용 overview map — 9개 idea 중 4개에만 가짜 overview 부여.
 * Lab의 "Pending overview" vs "Recent documents" 섹션을 자연스럽게 채움.
 * concept은 idea의 summary 재사용, 나머지 필드는 빈 문자열.
 */
export function getDemoOverviewMap(): Record<string, Overview | null> {
  const ideas = getDemoVaultedIdeas();
  const withOverviewIndices = new Set([0, 2, 5, 7]);
  const map: Record<string, Overview | null> = {};

  ideas.forEach((idea, i) => {
    if (withOverviewIndices.has(i)) {
      const now = new Date().toISOString();
      map[idea.id] = {
        id: `${idea.id}-ov`,
        idea_id: idea.id,
        user_id: "demo",
        concept_ko: idea.summary_ko,
        concept_en: idea.summary_en,
        problem_ko: "",
        problem_en: "",
        target_ko: "",
        target_en: "",
        features_ko: "",
        features_en: "",
        differentiator_ko: "",
        differentiator_en: "",
        revenue_ko: "",
        revenue_en: "",
        mvp_scope_ko: "",
        mvp_scope_en: "",
        created_at: now,
        updated_at: now,
      };
    } else {
      map[idea.id] = null;
    }
  });

  return map;
}
