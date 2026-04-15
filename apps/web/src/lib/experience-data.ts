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
      { category: "ai", label: "Voice Emotion AI" },
      { category: "who", label: "Senior Solo Households" },
      { category: "domain", label: "Mental Health" },
      { category: "tech", label: "Mobile App" },
      { category: "value", label: "Daily Monitoring" },
    ],
    previewLine: "Detect senior isolation through voice signals",
  },
  {
    id: "demo-commerce",
    slug: "demo-commerce",
    codename: "lateral echo",
    rarity: "rare",
    keywords: [
      { category: "ai", label: "Image Generation AI" },
      { category: "who", label: "Small Creators" },
      { category: "domain", label: "Commerce" },
      { category: "tech", label: "Web Platform" },
      { category: "money", label: "Subscription" },
    ],
    previewLine: "Creators finish product images in one minute",
  },
  {
    id: "demo-education",
    slug: "demo-education",
    codename: "edge echo",
    rarity: "common",
    keywords: [
      { category: "ai", label: "Personalized Tutor AI" },
      { category: "who", label: "Elementary School Parents" },
      { category: "domain", label: "EdTech" },
      { category: "tech", label: "Tablet App" },
      { category: "value", label: "Progress Management" },
    ],
    previewLine: "Summarize child learning flow for parents in real time",
  },
];

const DEMO_IDEAS: Record<string, ExperienceIdea[]> = {
  "demo-health": [
    {
      id: "demo-health-1",
      title: "Voice Diary - Senior Isolation Detector",
      summary:
        "AI analyzes five minutes of daily voice from seniors and alerts families about signs of depression, anxiety, or cognitive decline.",
      signalLine: "Continuous observation at home instead of a nursing facility",
    },
    {
      id: "demo-health-2",
      title: "Family Conversation Bridge - Emotion Summary Report",
      summary:
        "Weekly emotion summaries are sent to adult children with suggested topics that energize their parents.",
      signalLine: "Turns weekly calls from obligation into designed care",
    },
    {
      id: "demo-health-3",
      title: "Emergency Signal Escalation Line",
      summary:
        "When acute depression or self-harm signals appear, alerts are sent simultaneously to local emergency services and family.",
      signalLine: "An entry point that connects to public health budgets",
    },
  ],
  "demo-commerce": [
    {
      id: "demo-commerce-1",
      title: "Product Photos Without a Studio",
      summary:
        "AI converts smartphone shots into studio-quality product images and auto-adjusts background and lighting to brand tone.",
      signalLine: "Shrinks monthly photo cost to near zero for solo merchants",
    },
    {
      id: "demo-commerce-2",
      title: "Seasonal Campaign Auto Generator",
      summary:
        "Type a season, holiday, or trend keyword to generate product images, banners, and captions ready for social posts.",
      signalLine: "A creator workflow that eliminates campaign planning meetings",
    },
    {
      id: "demo-commerce-3",
      title: "Brand Memory Vault",
      summary:
        "Learns past colors, fonts, logos, and image styles so every new asset stays on brand.",
      signalLine: "Brand consistency becomes the paid conversion trigger",
    },
  ],
  "demo-education": [
    {
      id: "demo-education-1",
      title: "Daily Learning Report",
      summary:
        "A one-page summary of what the child solved, where they got stuck, and which concepts clicked, delivered to parents.",
      signalLine: "A transparent daily window instead of quarterly tutor meetings",
    },
    {
      id: "demo-education-2",
      title: "Why Did I Miss This? - Explanation Tutor",
      summary:
        "Provides step-by-step explanations matched to the child's level and recommends similar practice problems.",
      signalLine: "A structure where wrong answers become deeper learning",
    },
    {
      id: "demo-education-3",
      title: "Parent Question Translator",
      summary:
        "Translates everyday parent questions into curriculum terms and formats them for sharing with teachers.",
      signalLine: "A tool that removes the language gap between parents and teachers",
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
    slug: keyword.label.toLowerCase().replace(/\s+/g, "-"),
    category: keyword.category,
    label: keyword.label,
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
      slug: keyword.label.toLowerCase().replace(/\s+/g, "-"),
      label: keyword.label,
    })) ?? [];

  return {
    id: idea.id,
    idea_line: idea.signalLine,
    title: idea.title,
    summary: idea.summary,
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
