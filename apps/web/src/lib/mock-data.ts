import type {
  Appraisal,
  AppraisalDepth,
  Blueprint,
  CostByDateFeature,
  CostByFeature,
  CostLogEntry,
  CostSummaryResponse,
  FullOverview,
  Idea,
  IdeaOre,
  Keyword,
  MineResponse,
  OreDiscoverResponse,
  OreDailyVein,
  OreKeyword,
  OreTodayVeinsResponse,
  OreVaultResponse,
  ProductDesign,
  ProjectSeedBrief,
  RerollResponse,
  Roadmap,
  TodayVeinsResponse,
  UsageInfo,
  UserProfile,
  VaultResponse,
  Vein,
  Overview,
} from "@/types/api";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const KEYWORDS: Keyword[] = [
  { id: "k1", slug: "healthcare", category: "domain", label: "Healthcare", is_premium: false },
  { id: "k2", slug: "gen-z", category: "who", label: "Gen Z", is_premium: false },
  { id: "k3", slug: "voice-ai", category: "tech", label: "Voice AI", is_premium: false },
  { id: "k4", slug: "time-saving", category: "value", label: "Time Saving", is_premium: false },
  { id: "k5", slug: "subscription", category: "money", label: "Subscription", is_premium: false },
  { id: "k6", slug: "edtech", category: "domain", label: "EdTech", is_premium: false },
  { id: "k7", slug: "freelancer", category: "who", label: "Freelancer", is_premium: false },
  { id: "k8", slug: "llm", category: "ai", label: "LLM", is_premium: true },
  { id: "k9", slug: "pet-care", category: "domain", label: "Pet Care", is_premium: false },
  { id: "k10", slug: "multimodal", category: "ai", label: "Multimodal AI", is_premium: true },
];

function makeVein(slot: number): Vein {
  const kws = pickRandom(KEYWORDS, 5);
  const rarities: Array<"common" | "rare" | "golden" | "legend"> = ["common", "rare", "golden", "legend"];
  return {
    id: `vein-${randomId()}`,
    slot_index: slot,
    keyword_ids: kws.map((k) => k.id),
    keywords: kws,
    rarity: rarities[Math.floor(Math.random() * rarities.length)],
    is_selected: false,
  };
}

function makeVeins(): Vein[] {
  return [makeVein(1), makeVein(2), makeVein(3)];
}

const IDEA_TEMPLATES = [
  {
    title: "Voice Coach for Daily Recovery",
    idea_line: "Talk for a minute, get a recovery readout, and leave with one action for today.",
    summary:
      "A voice-first recovery coach helps busy professionals log how they feel in under a minute and receive a practical next step for sleep, energy, or focus.",
  },
  {
    title: "Freelancer Project Matchmaker",
    idea_line: "Upload your portfolio once and get matched to client briefs that actually fit.",
    summary:
      "This tool analyzes a freelancer's past work and surfaces projects with the right scope, tone, and budget instead of generic job listings.",
  },
  {
    title: "Pet Behavior Watch",
    idea_line: "A phone camera turns everyday pet footage into early warning signs for owners.",
    summary:
      "Computer vision watches routine pet behavior, flags unusual movement patterns, and explains when an owner should pay closer attention.",
  },
  {
    title: "Campaign Assets in One Minute",
    idea_line: "Type the campaign angle once and leave with images, captions, and banners that fit the brand.",
    summary:
      "Small sellers generate launch assets for product drops without hiring a designer or setting up a manual content workflow.",
  },
  {
    title: "Family Meal Planner",
    idea_line: "Plan the week around what the family will actually eat, not what looked good in a recipe app.",
    summary:
      "A meal planning app learns household preferences, turns them into a realistic weekly plan, and cuts the number of last-minute dinner decisions.",
  },
];

function makeIdeas(): Idea[] {
  const shuffled = [...IDEA_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.map((template, index) => ({
    id: `idea-${randomId()}`,
    idea_line: template.idea_line,
    title: template.title,
    summary: template.summary,
    keyword_combo: pickRandom(KEYWORDS, 3).map((keyword) => ({
      category: keyword.category,
      slug: keyword.slug,
      label: keyword.label,
    })),
    sort_order: index + 1,
    is_vaulted: false,
  }));
}

function makeMockOverview(ideaId: string): Overview {
  const idea = mockVaultedIdeas.find((item) => item.id === ideaId);
  const title = idea?.title ?? "Mock Idea";
  return {
    id: `overview-${randomId()}`,
    idea_id: ideaId,
    user_id: "mock-user-001",
    concept: `Core concept for ${title}.`,
    problem: "Existing options require too much manual effort and still feel generic.",
    target: "Professionals aged 25-35 who want practical, low-friction tools.",
    features: "1. Fast setup\n2. Actionable dashboard\n3. Daily prompts",
    differentiator: "It reduces setup time and gives users a clearer next step than competitors.",
    revenue: "Premium subscription at $9.99/month with a 7-day trial.",
    mvp_scope: "Launch with the three core features, onboarding, and basic analytics in four weeks.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function makeMockAppraisal(overviewId: string, depth: AppraisalDepth): Appraisal {
  const appraisal: Appraisal = {
    id: `appraisal-${randomId()}`,
    overview_id: overviewId,
    depth,
    market_fit: "The category is active, but timing and positioning will matter.",
    feasibility: "A focused MVP is technically feasible with current APIs and standard web infrastructure.",
    risk: "The main risk is weak repeat usage if the first-session value is not obvious.",
  };

  if (depth !== "basic_free") {
    appraisal.problem_fit = "The problem is real, but the frequency and urgency still need validation.";
    appraisal.differentiation = "The strongest angle is speed to value, not raw model sophistication.";
    appraisal.scalability = "There is room to expand into adjacent workflows after initial product-market fit.";
  }

  return appraisal;
}

function makeMockFullOverview(overviewId: string): FullOverview {
  return {
    id: `full-overview-${randomId()}`,
    user_id: "mock-user-001",
    overview_id: overviewId,
    concept: "A focused AI assistant for everyday decision support.",
    problem: "Users juggle too many small decisions with tools that feel heavy and generic.",
    target_user: "Busy professionals who want practical recommendations with minimal setup.",
    features_must: ["Fast onboarding", "One core workflow", "Clear recommendation output"],
    features_should: ["History view", "Notification nudges"],
    features_later: ["Collaboration layer", "Advanced automation"],
    user_flow: ["Open app", "Set context", "Receive recommendation", "Act on result"],
    screens: ["Onboarding", "Home", "Recommendation", "History"],
    business_model: "Subscription at $9.99/month.",
    business_rules: ["Free tier is limited", "Recommendations are stored for 30 days"],
    mvp_scope: "Ship one core workflow and validate repeat usage.",
    tech_stack: { frontend: "Next.js", backend: "FastAPI", database: "Postgres" },
    data_model_sql: "CREATE TABLE users (...);",
    api_endpoints: ["POST /api/session", "GET /api/recommendations"],
    file_structure: "app/\ncomponents/\nlib/",
    external_services: ["OpenAI API", "Supabase"],
    auth_flow: ["Sign up", "Confirm account", "Receive session", "Use product"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function makeMockDesign(overviewId: string): ProductDesign {
  return {
    id: `design-${randomId()}`,
    user_id: "mock-user-001",
    overview_id: overviewId,
    user_flow: ["Open app", "Complete setup", "Use main workflow", "Review result"],
    screens: ["Onboarding", "Home", "Result", "Settings"],
    features_must: ["Setup flow", "Main workflow", "Result view"],
    features_should: ["Saved history", "Notification reminders"],
    features_later: ["Team sharing", "Automations"],
    business_model: "Subscription with a 7-day free trial.",
    business_rules: ["Free users are rate-limited", "Paid users can save more history"],
    mvp_scope: "Deliver the core workflow in one sprint cycle.",
    axes: {
      interface_complexity: "medium",
      business_complexity: "low",
      technical_complexity: "medium",
    },
    created_at: new Date().toISOString(),
  };
}

function makeMockBlueprint(designId: string): Blueprint {
  return {
    id: `blueprint-${randomId()}`,
    user_id: "mock-user-001",
    design_id: designId,
    tech_stack: ["Next.js", "TypeScript", "Supabase", "FastAPI", "OpenAI API"],
    data_model_sql: "CREATE TABLE users (...);\nCREATE TABLE sessions (...);",
    api_endpoints: ["POST /api/auth/signup", "POST /api/session", "GET /api/history"],
    file_structure: "app/\ncomponents/\nlib/\nbackend/",
    external_services: ["OpenAI API", "Supabase Auth", "Supabase Postgres"],
    auth_flow: ["Sign up", "Create session", "Check tier", "Load product"],
    created_at: new Date().toISOString(),
  };
}

function makeMockRoadmap(blueprintId: string): Roadmap {
  return {
    id: `roadmap-${randomId()}`,
    user_id: "mock-user-001",
    blueprint_id: blueprintId,
    phase_0: ["Initialize project", "Set up auth", "Create database schema"],
    phase_1: ["Build onboarding", "Build core workflow", "Ship first analytics"],
    phase_2: ["Launch billing", "Improve retention loops", "Prepare launch assets"],
    validation_checkpoints: ["Users complete the first session", "Users come back within three days"],
    estimated_complexity: "Medium: an MVP should fit in 4-6 weeks.",
    first_sprint_tasks: [
      "Initialize the Next.js app with TypeScript",
      "Set up Supabase auth and environment variables",
      "Create the first database migration",
      "Build the onboarding page",
      "Implement the core recommendation request",
    ],
    created_at: new Date().toISOString(),
  };
}

function makeMockCostsSummary(days: number): CostSummaryResponse {
  const features = ["mining", "overview", "appraisal", "full_overview"];
  const by_feature: CostByFeature[] = features.map((feature) => ({
    feature_type: feature,
    cost: Math.random() * 0.5,
    calls: Math.floor(Math.random() * 30) + 5,
  }));

  const by_date_feature: CostByDateFeature[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    by_date_feature.push({
      date: date.toISOString().split("T")[0],
      mining: Math.random() * 0.15,
      overview: Math.random() * 0.1,
      appraisal: Math.random() * 0.08,
      full_overview: Math.random() * 0.05,
    });
  }

  const recent_logs: CostLogEntry[] = Array.from({ length: 10 }, (_, index) => ({
    id: `log-${randomId()}`,
    feature_type: features[index % features.length],
    model: "gpt-5-mini",
    input_tokens: Math.floor(Math.random() * 2000) + 500,
    output_tokens: Math.floor(Math.random() * 1000) + 200,
    total_cost_usd: Math.random() * 0.05,
    status: "success",
    created_at: new Date(Date.now() - index * 3600000).toISOString(),
  }));

  const total_cost = by_feature.reduce((sum, entry) => sum + entry.cost, 0);
  const total_calls = by_feature.reduce((sum, entry) => sum + entry.calls, 0);

  return {
    total_cost_usd: total_cost,
    total_calls,
    avg_cost_per_call: total_calls > 0 ? total_cost / total_calls : 0,
    by_feature,
    by_date_feature,
    recent_logs,
  };
}

let mockRerollCount = 0;
let mockGenerationCount = 0;
let currentVeins = makeVeins();
let lastMinedIdeas: Idea[] = [];
let mockVaultedIdeas: Idea[] = [];
let mockOverviews: Overview[] = [];
let mockAppraisals: Appraisal[] = [];
let mockFullOverviews: FullOverview[] = [];
let mockDesigns: ProductDesign[] = [];
let mockBlueprints: Blueprint[] = [];
let mockRoadmaps: Roadmap[] = [];
let mockDiscoveredOres: IdeaOre[] = [];
let mockDiscoveredOresByVein: Record<string, IdeaOre[]> = {};
let mockVaultedOres: IdeaOre[] = [];
let mockProjectSeedBriefs: ProjectSeedBrief[] = [];
let currentOreVeins: OreDailyVein[] = makeOreDailyVeins();

export function resetMockState(): void {
  mockRerollCount = 0;
  mockGenerationCount = 0;
  currentVeins = makeVeins();
  lastMinedIdeas = [];
  mockVaultedIdeas = [];
  mockOverviews = [];
  mockAppraisals = [];
  mockFullOverviews = [];
  mockDesigns = [];
  mockBlueprints = [];
  mockRoadmaps = [];
  mockDiscoveredOres = [];
  mockDiscoveredOresByVein = {};
  mockVaultedOres = [];
  mockProjectSeedBriefs = [];
  currentOreVeins = makeOreDailyVeins();
}

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
    mockRerollCount += 1;
    currentVeins = makeVeins();
    return { veins: currentVeins, rerolls_used: mockRerollCount, rerolls_max: 2 };
  },

  async mine(veinId: string): Promise<MineResponse> {
    void veinId;
    await delay(1500);
    mockGenerationCount += 1;
    const ideas = makeIdeas();
    lastMinedIdeas = ideas;
    return { ideas, vein_id: veinId };
  },
};

function makeOreDailyVeins(): OreDailyVein[] {
  return makeVeins().map((vein) => ({
    id: vein.id,
    slot_index: vein.slot_index,
    keywords: vein.keywords.map((keyword) => ({
      id: keyword.id,
      label: keyword.label,
    })),
    is_mined: false,
  }));
}

function makeMockOres(veinId: string, keywords: OreKeyword[]): IdeaOre[] {
  const keywordLabels = keywords.map((keyword) => keyword.label).join(", ");
  const now = randomId();
  const templates = [
    {
      title: "Cat Dream Archive",
      one_liner: "A cozy archive where a guide turns small reflections into collectible symbol cards.",
      short_summary:
        "The user captures a short dream, mood, or memory and receives a compact symbolic card. The archive becomes a private trail of recurring emotions and images.",
      interesting_point:
        "The selected materials make reflection feel collectible instead of clinical.",
      project_fit:
        "This can start as a small MVP with only input, generated cards, and an archive.",
      risk:
        "If the output leans into vague fortune telling, it can feel generic quickly.",
      mvp_hint: "Start with input -> symbol card -> saved archive.",
    },
    {
      title: "One-Minute Ritual Desk",
      one_liner: "A tiny desktop ritual that turns selected themes into one useful daily prompt.",
      short_summary:
        "The user opens a focused desktop surface and receives one short prompt shaped by the chosen materials. The loop is fast enough to repeat daily without becoming a journal app.",
      interesting_point:
        "The constraint of one minute keeps the product from becoming a heavy planning tool.",
      project_fit:
        "The first version only needs keyword state, prompt generation, and a simple history.",
      risk:
        "It may feel too thin if the saved history does not become meaningful over time.",
      mvp_hint: "Build keyword state -> daily prompt -> lightweight history.",
    },
    {
      title: "Private Pattern Cards",
      one_liner: "A private card stack that helps users notice patterns across small personal notes.",
      short_summary:
        `Using ${keywordLabels}, the product turns repeated notes into compact pattern cards. The user gets a quiet way to revisit signals without writing long reports.`,
      interesting_point:
        "Cards make repeated personal signals easier to scan and compare.",
      project_fit:
        "A narrow MVP can focus on note input, card extraction, and saved card review.",
      risk:
        "The product needs a clear emotional tone or it may feel like another notes wrapper.",
      mvp_hint: "Ship note input -> pattern card -> card stack.",
    },
    {
      title: "Soft Signal Journal",
      one_liner: "A lightweight journal that turns recurring feelings into named signals.",
      short_summary:
        "The user writes one small note and receives a short signal label. Over time, the product helps them see what keeps returning.",
      interesting_point:
        "Signal labels give loose personal material enough structure without turning it into analysis.",
      project_fit:
        "The MVP can be just note input, signal naming, and a simple timeline.",
      risk:
        "If signal names are too abstract, users may not trust the archive.",
      mvp_hint: "Start with note input -> signal label -> timeline.",
    },
    {
      title: "Tiny Companion Archive",
      one_liner: "A small companion that remembers your recurring symbols and turns them into cards.",
      short_summary:
        "The user adds fragments and the companion groups them into recurring motifs. The result is a personal archive that feels alive but remains private.",
      interesting_point:
        "A companion frame can make repeat use warmer than a utility-only notes app.",
      project_fit:
        "The first build needs fragment capture, motif grouping, and card display.",
      risk:
        "The companion tone could become distracting if it talks too much.",
      mvp_hint: "Build fragment input -> motif card -> archive.",
    },
    {
      title: "Mood Object Shelf",
      one_liner: "A shelf of generated objects that represent what keeps showing up in your notes.",
      short_summary:
        "The user saves short entries and receives small object-like cards for repeated themes. The shelf becomes a visual memory surface.",
      interesting_point:
        "Objects are easier to revisit than raw journal text.",
      project_fit:
        "A simple MVP can use text input, object cards, and a shelf view.",
      risk:
        "The generated objects need enough specificity to avoid feeling random.",
      mvp_hint: "Ship text input -> object card -> shelf.",
    },
    {
      title: "Dream Thread Board",
      one_liner: "A board that connects repeated dream fragments into short visual threads.",
      short_summary:
        "The user logs fragments and sees recurring symbols linked across entries. The product stays short and visual instead of becoming a long dream diary.",
      interesting_point:
        "Threading gives old entries new meaning without asking the user to reread everything.",
      project_fit:
        "The MVP needs fragment logging, thread extraction, and a board view.",
      risk:
        "Too many automatic links could make the board feel noisy.",
      mvp_hint: "Start with fragment input -> thread extraction -> board.",
    },
    {
      title: "Personal Myth Cards",
      one_liner: "A card generator that turns private recurring themes into a tiny personal mythology.",
      short_summary:
        "The user adds short reflections and gets cards that name characters, objects, or places that keep appearing. The tone is playful but private.",
      interesting_point:
        "Myth language makes self-reflection feel creative rather than clinical.",
      project_fit:
        "The first version can be reflection input, card generation, and saved card detail.",
      risk:
        "If the tone becomes too fantasy-heavy, practical users may bounce.",
      mvp_hint: "Build reflection input -> myth card -> saved deck.",
    },
    {
      title: "Gentle Recurrence Map",
      one_liner: "A quiet map of the ideas and feelings that repeat across small entries.",
      short_summary:
        "The user enters tiny notes and sees repeated patterns arranged as a simple map. The map helps them notice continuity without requiring long writing.",
      interesting_point:
        "A map gives lightweight entries a sense of progression.",
      project_fit:
        "An MVP can use note capture, recurrence detection, and a minimal map.",
      risk:
        "The map could feel empty until enough entries exist.",
      mvp_hint: "Start with notes -> recurrence labels -> map.",
    },
    {
      title: "Archive Prompt Lantern",
      one_liner: "A daily prompt that lights up one saved symbol and asks a tiny follow-up.",
      short_summary:
        "The user gets a small follow-up prompt from a previous symbol or card. This turns the archive into a repeatable daily ritual.",
      interesting_point:
        "The archive becomes active without adding a heavy planning workflow.",
      project_fit:
        "The MVP needs saved symbols, prompt generation, and completion history.",
      risk:
        "If prompts feel generic, the ritual will not stick.",
      mvp_hint: "Ship saved symbols -> daily prompt -> completion log.",
    },
  ];

  return templates.map((template, index) => ({
    id: `ore-${veinId}-${now}-${index + 1}`,
    ...template,
    selected_keywords: keywords,
    sort_order: index + 1,
    is_vaulted: false,
  }));
}

function makeMockProjectSeedBrief(ore: IdeaOre): ProjectSeedBrief {
  return {
    id: `brief-${randomId()}`,
    ore_id: ore.id,
    product_concept: `${ore.title} is a focused MVP built around ${ore.mvp_hint.toLowerCase()}`,
    target_user:
      "An indie builder or reflective user who wants a lightweight personal tool without a heavy planning workflow.",
    core_loop: [
      "Open the product",
      "Enter one short personal input",
      "Receive a compact generated artifact",
      "Save or revisit the result",
    ],
    mvp_features: [
      "Single input flow",
      "Generated result card",
      "Saved archive",
      "Basic empty and loading states",
    ],
    first_screens: ["Home", "Input", "Generated card", "Archive"],
    not_to_build: ["Social sharing", "Team workspaces", "Advanced analytics", "Marketplace mechanics"],
    data_model_hint:
      "Use tables for users, ores, generated cards, and saved archive entries. Keep generated fields flat and copy-friendly.",
    api_hint:
      "Start with POST /entries to create input, POST /entries/{id}/generate to create a card, and GET /archive to list saved cards.",
    vibe_coding_prompt:
      `Build ${ore.title} as a small Next.js MVP. Start with the core loop: ${ore.mvp_hint} Keep the UI lightweight, private, and card-based.`,
  };
}

export const mockOreApi = {
  async getTodayVeins(): Promise<OreTodayVeinsResponse> {
    await delay(300);
    return {
      veins: currentOreVeins,
      rerolls_used: mockRerollCount,
      rerolls_max: 2,
      generations_used: mockGenerationCount,
      generations_max: 1,
    };
  },

  async rerollVeins(): Promise<OreTodayVeinsResponse> {
    await delay(500);
    mockRerollCount += 1;
    currentOreVeins = makeOreDailyVeins();
    mockDiscoveredOres = [];
    mockDiscoveredOresByVein = {};
    return {
      veins: currentOreVeins,
      rerolls_used: mockRerollCount,
      rerolls_max: 2,
      generations_used: mockGenerationCount,
      generations_max: 1,
    };
  },

  async discover(veinId: string): Promise<OreDiscoverResponse> {
    await delay(1200);
    const vein = currentOreVeins.find((item) => item.id === veinId) ?? currentOreVeins[0];
    const existing = mockDiscoveredOresByVein[vein.id];
    if (existing) {
      mockDiscoveredOres = existing;
      return {
        vein: {
          id: vein.id,
          keywords: vein.keywords,
        },
        ores: existing,
      };
    }
    const ores = makeMockOres(vein.id, vein.keywords);
    mockDiscoveredOres = ores;
    mockDiscoveredOresByVein[vein.id] = ores;
    vein.is_mined = true;
    mockGenerationCount += 1;
    return {
      vein: {
        id: vein.id,
        keywords: vein.keywords,
      },
      ores,
    };
  },

  async vault(oreId: string): Promise<OreVaultResponse> {
    await delay(250);
    const ore = mockDiscoveredOres.find((item) => item.id === oreId)
      ?? mockVaultedOres.find((item) => item.id === oreId);
    if (ore) {
      ore.is_vaulted = true;
      if (!mockVaultedOres.some((item) => item.id === ore.id)) {
        mockVaultedOres.push(ore);
      }
    }
    return { ore_id: oreId, is_vaulted: true };
  },

  async getVaultedOres(): Promise<IdeaOre[]> {
    await delay(200);
    return mockVaultedOres;
  },

  async getOre(oreId: string): Promise<IdeaOre> {
    await delay(200);
    const discovered = Object.values(mockDiscoveredOresByVein).flat();
    const ore = [...mockVaultedOres, ...mockDiscoveredOres, ...discovered].find((item) => item.id === oreId);
    if (!ore) {
      throw new Error("Idea Ore not found");
    }
    return ore;
  },

  async projectize(oreId: string): Promise<ProjectSeedBrief> {
    await delay(1400);
    const existing = mockProjectSeedBriefs.find((brief) => brief.ore_id === oreId);
    if (existing) {
      return existing;
    }
    const ore = await this.getOre(oreId);
    const brief = makeMockProjectSeedBrief(ore);
    mockProjectSeedBriefs.push(brief);
    return brief;
  },
};

export const mockIdeasApi = {
  async vault(ideaIds: string[], veinId: string): Promise<VaultResponse> {
    void veinId;
    await delay(300);
    const toVault = lastMinedIdeas.filter((idea) => ideaIds.includes(idea.id));
    for (const idea of toVault) {
      idea.is_vaulted = true;
      if (!mockVaultedIdeas.find((item) => item.id === idea.id)) {
        mockVaultedIdeas.push(idea);
      }
    }
    return { vaulted_count: ideaIds.length, idea_ids: ideaIds };
  },
};

export const mockVaultApi = {
  async getVaultedIdeas(): Promise<Idea[]> {
    await delay(200);
    return mockVaultedIdeas;
  },

  async getOverviewsByIdea(ideaId: string): Promise<Overview[]> {
    await delay(200);
    return mockOverviews.filter((overview) => overview.idea_id === ideaId);
  },

  async deleteOverview(overviewId: string): Promise<void> {
    await delay(150);
    mockOverviews = mockOverviews.filter((overview) => overview.id !== overviewId);
  },

  async deleteIdea(ideaId: string): Promise<void> {
    await delay(150);
    mockVaultedIdeas = mockVaultedIdeas.filter((idea) => idea.id !== ideaId);
    mockOverviews = mockOverviews.filter((overview) => overview.idea_id !== ideaId);
  },
};

export const mockLabApi = {
  async createOverview(ideaId: string): Promise<Overview> {
    await delay(2000);
    const overview = makeMockOverview(ideaId);
    mockOverviews.push(overview);
    return overview;
  },

  async createAppraisal(overviewId: string, depth: AppraisalDepth = "basic_free"): Promise<Appraisal> {
    await delay(1500);
    const appraisal = makeMockAppraisal(overviewId, depth);
    mockAppraisals.push(appraisal);
    return appraisal;
  },

  async createFullOverview(overviewId: string): Promise<FullOverview> {
    await delay(2500);
    const fullOverview = makeMockFullOverview(overviewId);
    mockFullOverviews.push(fullOverview);
    return fullOverview;
  },

  async getAppraisalsByOverview(overviewId: string): Promise<Appraisal[]> {
    await delay(200);
    return mockAppraisals.filter((appraisal) => appraisal.overview_id === overviewId);
  },

  async getFullOverviewsByOverview(overviewId: string): Promise<FullOverview[]> {
    await delay(200);
    return mockFullOverviews.filter((overview) => overview.overview_id === overviewId);
  },

  async deleteFullOverview(fullOverviewId: string): Promise<void> {
    await delay(150);
    mockFullOverviews = mockFullOverviews.filter((overview) => overview.id !== fullOverviewId);
  },

  async getUsage(): Promise<UsageInfo> {
    await delay(100);
    return {
      tier: "free",
      overviews: { used: mockOverviews.length, limit: 1 },
      generations: { used: mockGenerationCount, limit: 1 },
    };
  },
};

export const mockCollectionApi = {
  async createDesign(overviewId: string): Promise<ProductDesign> {
    await delay(2000);
    const design = makeMockDesign(overviewId);
    mockDesigns.push(design);
    return design;
  },

  async createBlueprint(designId: string): Promise<Blueprint> {
    await delay(2000);
    const blueprint = makeMockBlueprint(designId);
    mockBlueprints.push(blueprint);
    return blueprint;
  },

  async createRoadmap(blueprintId: string): Promise<Roadmap> {
    await delay(2000);
    const roadmap = makeMockRoadmap(blueprintId);
    mockRoadmaps.push(roadmap);
    return roadmap;
  },

  async generateAll(overviewId: string): Promise<{ design: ProductDesign; blueprint: Blueprint; roadmap: Roadmap }> {
    await delay(4000);
    const design = makeMockDesign(overviewId);
    mockDesigns.push(design);
    const blueprint = makeMockBlueprint(design.id);
    mockBlueprints.push(blueprint);
    const roadmap = makeMockRoadmap(blueprint.id);
    mockRoadmaps.push(roadmap);
    return { design, blueprint, roadmap };
  },

  async getDesignsByOverview(overviewId: string): Promise<ProductDesign[]> {
    await delay(200);
    return mockDesigns.filter((design) => design.overview_id === overviewId);
  },

  async getBlueprintsByDesign(designId: string): Promise<Blueprint[]> {
    await delay(200);
    return mockBlueprints.filter((blueprint) => blueprint.design_id === designId);
  },

  async getRoadmapsByBlueprint(blueprintId: string): Promise<Roadmap[]> {
    await delay(200);
    return mockRoadmaps.filter((roadmap) => roadmap.blueprint_id === blueprintId);
  },

  async deleteDesign(id: string): Promise<void> {
    await delay(150);
    mockDesigns = mockDesigns.filter((design) => design.id !== id);
  },

  async deleteBlueprint(id: string): Promise<void> {
    await delay(150);
    mockBlueprints = mockBlueprints.filter((blueprint) => blueprint.id !== id);
  },

  async deleteRoadmap(id: string): Promise<void> {
    await delay(150);
    mockRoadmaps = mockRoadmaps.filter((roadmap) => roadmap.id !== id);
  },
};

const MOCK_PROFILE: UserProfile = {
  id: "mock-user-001",
  nickname: "Test Miner",
  tier: "free",
  role: "admin",
  persona_tier: null,
  miner_level: 3,
  streak_days: 7,
};

export const mockProfileApi = {
  async getProfile(): Promise<UserProfile> {
    await delay(100);
    return MOCK_PROFILE;
  },
};

export const mockAdminApi = {
  async setPersona(personaTier: string | null): Promise<{ status: string; persona_tier: string | null }> {
    await delay(100);
    MOCK_PROFILE.persona_tier = personaTier as UserProfile["persona_tier"];
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

  async getCostsSummary(days: number = 7): Promise<CostSummaryResponse> {
    await delay(300);
    return makeMockCostsSummary(days);
  },
};
