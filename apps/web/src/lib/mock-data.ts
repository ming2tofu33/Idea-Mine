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
  Keyword,
  MineResponse,
  ProductDesign,
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
