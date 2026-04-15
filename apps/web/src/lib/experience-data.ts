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
      { category: "ai", ko: "Voice Emotion AI", en: "Voice Emotion AI" },
      { category: "who", ko: "Senior Solo Households", en: "Senior Solo Households" },
      { category: "domain", ko: "Mental Health", en: "Mental Health" },
      { category: "tech", ko: "Mobile App", en: "Mobile App" },
      { category: "value", ko: "Daily Monitoring", en: "Daily Monitoring" },
    ],
    previewLineKo: "Detect senior isolation through voice signals",
    previewLineEn: "Detect senior isolation through voice signals",
  },
  {
    id: "demo-commerce",
    slug: "demo-commerce",
    codename: "lateral echo",
    rarity: "rare",
    keywords: [
      { category: "ai", ko: "Image Generation AI", en: "Image Generation AI" },
      { category: "who", ko: "Small Creators", en: "Small Creators" },
      { category: "domain", ko: "Commerce", en: "Commerce" },
      { category: "tech", ko: "Web Platform", en: "Web Platform" },
      { category: "money", ko: "Subscription", en: "Subscription" },
    ],
    previewLineKo: "Creators finish product images in one minute",
    previewLineEn: "Creators finish product images in one minute",
  },
  {
    id: "demo-education",
    slug: "demo-education",
    codename: "edge echo",
    rarity: "common",
    keywords: [
      { category: "ai", ko: "Personalized Tutor AI", en: "Personalized Tutor AI" },
      { category: "who", ko: "Elementary School Parents", en: "Elementary School Parents" },
      { category: "domain", ko: "EdTech", en: "EdTech" },
      { category: "tech", ko: "Tablet App", en: "Tablet App" },
      { category: "value", ko: "Progress Management", en: "Progress Management" },
    ],
    previewLineKo: "Summarize child learning flow for parents in real time",
    previewLineEn: "Summarize child learning flow for parents in real time",
  },
];

const DEMO_IDEAS: Record<string, ExperienceIdea[]> = {
  "demo-health": [
    {
      id: "demo-health-1",
      titleKo: "Voice Diary - Senior Isolation Detector",
      titleEn: "Voice Diary - Senior Isolation Detector",
      summaryKo:
        "AI analyzes five minutes of daily voice from seniors and alerts families about signs of depression, anxiety, or cognitive decline.",
      summaryEn:
        "AI analyzes five minutes of daily voice from seniors and alerts families about signs of depression, anxiety, or cognitive decline.",
      signalLineKo: "Continuous observation at home instead of a nursing facility",
      signalLineEn: "Continuous observation at home instead of a nursing facility",
    },
    {
      id: "demo-health-2",
      titleKo: "Family Conversation Bridge - Emotion Summary Report",
      titleEn: "Family Conversation Bridge - Emotion Summary Report",
      summaryKo:
        "Weekly emotion summaries are sent to adult children with suggested topics that energize their parents.",
      summaryEn:
        "Weekly emotion summaries are sent to adult children with suggested topics that energize their parents.",
      signalLineKo: "Turns weekly calls from obligation into designed care",
      signalLineEn: "Turns weekly calls from obligation into designed care",
    },
    {
      id: "demo-health-3",
      titleKo: "Emergency Signal Escalation Line",
      titleEn: "Emergency Signal Escalation Line",
      summaryKo:
        "When acute depression or self-harm signals appear, alerts are sent simultaneously to local emergency services and family.",
      summaryEn:
        "When acute depression or self-harm signals appear, alerts are sent simultaneously to local emergency services and family.",
      signalLineKo: "An entry point that connects to public health budgets",
      signalLineEn: "An entry point that connects to public health budgets",
    },
  ],
  "demo-commerce": [
    {
      id: "demo-commerce-1",
      titleKo: "Product Photos Without a Studio",
      titleEn: "Product Photos Without a Studio",
      summaryKo:
        "AI converts smartphone shots into studio-quality product images and auto-adjusts background and lighting to brand tone.",
      summaryEn:
        "AI converts smartphone shots into studio-quality product images and auto-adjusts background and lighting to brand tone.",
      signalLineKo: "Shrinks monthly photo cost to near zero for solo merchants",
      signalLineEn: "Shrinks monthly photo cost to near zero for solo merchants",
    },
    {
      id: "demo-commerce-2",
      titleKo: "Seasonal Campaign Auto Generator",
      titleEn: "Seasonal Campaign Auto Generator",
      summaryKo:
        "Type a season, holiday, or trend keyword to generate product images, banners, and captions ready for social posts.",
      summaryEn:
        "Type a season, holiday, or trend keyword to generate product images, banners, and captions ready for social posts.",
      signalLineKo: "A creator workflow that eliminates campaign planning meetings",
      signalLineEn: "A creator workflow that eliminates campaign planning meetings",
    },
    {
      id: "demo-commerce-3",
      titleKo: "Brand Memory Vault",
      titleEn: "Brand Memory Vault",
      summaryKo:
        "Learns past colors, fonts, logos, and image styles so every new asset stays on brand.",
      summaryEn:
        "Learns past colors, fonts, logos, and image styles so every new asset stays on brand.",
      signalLineKo: "Brand consistency becomes the paid conversion trigger",
      signalLineEn: "Brand consistency becomes the paid conversion trigger",
    },
  ],
  "demo-education": [
    {
      id: "demo-education-1",
      titleKo: "Daily Learning Report",
      titleEn: "Daily Learning Report",
      summaryKo:
        "A one-page summary of what the child solved, where they got stuck, and which concepts clicked, delivered to parents.",
      summaryEn:
        "A one-page summary of what the child solved, where they got stuck, and which concepts clicked, delivered to parents.",
      signalLineKo: "A transparent daily window instead of quarterly tutor meetings",
      signalLineEn: "A transparent daily window instead of quarterly tutor meetings",
    },
    {
      id: "demo-education-2",
      titleKo: "Why Did I Miss This? - Explanation Tutor",
      titleEn: "Why Did I Miss This? - Explanation Tutor",
      summaryKo:
        "Provides step-by-step explanations matched to the child's level and recommends similar practice problems.",
      summaryEn:
        "Provides step-by-step explanations matched to the child's level and recommends similar practice problems.",
      signalLineKo: "A structure where wrong answers become deeper learning",
      signalLineEn: "A structure where wrong answers become deeper learning",
    },
    {
      id: "demo-education-3",
      titleKo: "Parent Question Translator",
      titleEn: "Parent Question Translator",
      summaryKo:
        "Translates everyday parent questions into curriculum terms and formats them for sharing with teachers.",
      summaryEn:
        "Translates everyday parent questions into curriculum terms and formats them for sharing with teachers.",
      signalLineKo: "A tool that removes the language gap between parents and teachers",
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

function experienceKeywordToKeyword(
  keyword: ExperienceVein["keywords"][number],
  veinId: string,
  index: number,
): Keyword {
  return {
    id: `${veinId}-kw-${index}`,
    slug: keyword.en.toLowerCase().replace(/\s+/g, "-"),
    category: keyword.category,
    ko: keyword.en,
    en: keyword.en,
    is_premium: false,
  };
}

export function experienceVeinToVein(
  experience: ExperienceVein,
  slotIndex: number,
): Vein {
  const rarity =
    experience.rarity === "common" ||
    experience.rarity === "rare" ||
    experience.rarity === "golden"
      ? experience.rarity
      : "common";

  const keywords = experience.keywords.map((keyword, index) =>
    experienceKeywordToKeyword(keyword, experience.id, index),
  );

  return {
    id: experience.id,
    slot_index: slotIndex,
    keyword_ids: keywords.map((keyword) => keyword.id),
    keywords,
    rarity,
    is_selected: false,
  };
}

export function getDemoTodayVeinsResponse(): TodayVeinsResponse {
  const veins = DEMO_VEINS.map((vein, index) => experienceVeinToVein(vein, index + 1));
  return {
    veins,
    rerolls_used: 0,
    rerolls_max: 0,
    generations_used: 0,
    generations_max: 0,
  };
}

export function experienceIdeaToIdea(
  idea: ExperienceIdea,
  veinId: string,
  sortOrder: number,
): Idea {
  const vein = getExperienceVeinById(veinId);
  const keyword_combo: KeywordComboEntry[] =
    vein?.keywords.slice(0, 4).map((keyword) => ({
      category: keyword.category,
      slug: keyword.en.toLowerCase().replace(/\s+/g, "-"),
      ko: keyword.en,
      en: keyword.en,
    })) ?? [];

  return {
    id: idea.id,
    idea_line: idea.signalLineEn,
    title: idea.titleEn,
    summary: idea.summaryEn,
    keyword_combo,
    sort_order: sortOrder,
    is_vaulted: true,
  };
}

export function getDemoVaultedIdeas(): Idea[] {
  return DEMO_VEINS.flatMap((vein) =>
    (DEMO_IDEAS[vein.id] ?? []).map((idea, index) =>
      experienceIdeaToIdea(idea, vein.id, index),
    ),
  );
}

export function getDemoOverviewMap(): Record<string, Overview | null> {
  const ideas = getDemoVaultedIdeas();
  const withOverviewIndices = new Set([0, 2, 5, 7]);
  const map: Record<string, Overview | null> = {};

  ideas.forEach((idea, index) => {
    if (withOverviewIndices.has(index)) {
      const now = new Date().toISOString();
      map[idea.id] = {
        id: `${idea.id}-ov`,
        idea_id: idea.id,
        user_id: "demo",
        concept: idea.summary,
        problem: "",
        target: "",
        features: "",
        differentiator: "",
        revenue: "",
        mvp_scope: "",
        created_at: now,
        updated_at: now,
      };
    } else {
      map[idea.id] = null;
    }
  });

  return map;
}
