import { createClient } from "@/lib/supabase/client";
import type {
  ApiError,
  TodayVeinsResponse,
  RerollResponse,
  MineResponse,
  VaultResponse,
  Idea,
  Overview,
  Appraisal,
  UserProfile,
  AppraisalDepth,
  FullOverview,
  UsageInfo,
  CostSummaryResponse,
  ProductDesign,
  Blueprint,
  Roadmap,
} from "@/types/api";
import {
  mockMiningApi,
  mockIdeasApi,
  mockVaultApi,
  mockLabApi,
  mockCollectionApi,
  mockProfileApi,
  mockAdminApi,
} from "./mock-data";

// --- Mock mode toggle (runtime) ---

let _mockMode = false;
export function isMockMode(): boolean { return _mockMode; }
export function setMockMode(on: boolean): void { _mockMode = on; }

// --- Proxy: dispatches to mock or real at call time ---

function proxy<T extends Record<string, (...args: any[]) => any>>(real: T, mock: T): T {
  return new Proxy(real, {
    get(_, prop: string) {
      return (...args: any[]) => (_mockMode ? mock : real)[prop](...args);
    },
  });
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// --- Error class ---

export class ApiClientError extends Error {
  status: number;
  body: ApiError;

  constructor(status: number, body: ApiError) {
    super(body.message);
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }

  get isRateLimited() {
    return this.status === 429;
  }

  get retryAfter() {
    return this.body.retry_after;
  }
}

// --- Fetch wrapper ---

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body: ApiError = await res.json().catch(() => ({
      error: "unknown",
      message: res.statusText,
    }));
    throw new ApiClientError(res.status, body);
  }

  return res.json();
}

// --- Mining API ---

const realMiningApi = {
  getTodayVeins: () =>
    apiFetch<TodayVeinsResponse>("/mining/veins/today"),

  reroll: () =>
    apiFetch<RerollResponse>("/mining/veins/reroll", { method: "POST" }),

  mine: (veinId: string) =>
    apiFetch<MineResponse>(`/mining/veins/${veinId}/mine`, { method: "POST" }),
};

export const miningApi = proxy(realMiningApi, mockMiningApi);

// --- Ideas API ---

const realIdeasApi = {
  vault: (ideaIds: string[], veinId: string) =>
    apiFetch<VaultResponse>("/ideas/vault", {
      method: "PATCH",
      body: JSON.stringify({ idea_ids: ideaIds, vein_id: veinId }),
    }),
};

export const ideasApi = proxy(realIdeasApi, mockIdeasApi);

// --- Vault API (Supabase direct read) ---

const realVaultApi = {
  async getVaultedIdeas(): Promise<Idea[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("is_vaulted", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getOverviewsByIdea(ideaId: string): Promise<Overview[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("overviews")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Overview[];
  },

  async deleteOverview(overviewId: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { error } = await supabase
      .from("overviews")
      .delete()
      .eq("id", overviewId);
    if (error) throw error;
  },

  async deleteIdea(ideaId: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", ideaId);
    if (error) throw error;
  },
};

export const vaultApi = proxy(realVaultApi, mockVaultApi);

// --- Lab API ---

const realLabApi = {
  createOverview: (ideaId: string) =>
    apiFetch<Overview>("/lab/overview", {
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId }),
    }),

  createAppraisal: (overviewId: string, depth: AppraisalDepth = "basic_free") =>
    apiFetch<Appraisal>("/lab/appraisal", {
      method: "POST",
      body: JSON.stringify({ overview_id: overviewId, depth }),
    }),

  createFullOverview: (overviewId: string) =>
    apiFetch<FullOverview>("/lab/overview/full", {
      method: "POST",
      body: JSON.stringify({ overview_id: overviewId }),
    }),

  async getAppraisalsByOverview(overviewId: string): Promise<Appraisal[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("appraisals")
      .select("*")
      .eq("overview_id", overviewId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Appraisal[];
  },

  async getFullOverviewsByOverview(overviewId: string): Promise<FullOverview[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("full_overviews")
      .select("*")
      .eq("overview_id", overviewId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FullOverview[];
  },

  getUsage: () => apiFetch<UsageInfo>("/lab/usage"),

  async deleteFullOverview(fullOverviewId: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { error } = await supabase
      .from("full_overviews")
      .delete()
      .eq("id", fullOverviewId);
    if (error) throw error;
  },
};

export const labApi = proxy(realLabApi, mockLabApi);

// --- Collection API ---

const realCollectionApi = {
  createDesign: (overviewId: string) =>
    apiFetch<ProductDesign>("/lab/design", {
      method: "POST",
      body: JSON.stringify({ overview_id: overviewId }),
    }),

  createBlueprint: (designId: string) =>
    apiFetch<Blueprint>("/lab/blueprint", {
      method: "POST",
      body: JSON.stringify({ design_id: designId }),
    }),

  createRoadmap: (blueprintId: string) =>
    apiFetch<Roadmap>("/lab/roadmap", {
      method: "POST",
      body: JSON.stringify({ blueprint_id: blueprintId }),
    }),

  generateAll: (overviewId: string) =>
    apiFetch<{ design: ProductDesign; blueprint: Blueprint; roadmap: Roadmap }>(
      "/lab/generate-all",
      { method: "POST", body: JSON.stringify({ overview_id: overviewId }) },
    ),

  async getDesignsByOverview(overviewId: string): Promise<ProductDesign[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("product_designs")
      .select("*")
      .eq("overview_id", overviewId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ProductDesign[];
  },

  async getBlueprintsByDesign(designId: string): Promise<Blueprint[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("blueprints")
      .select("*")
      .eq("design_id", designId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Blueprint[];
  },

  async getRoadmapsByBlueprint(blueprintId: string): Promise<Roadmap[]> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Roadmap[];
  },

  async deleteDesign(id: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.from("product_designs").delete().eq("id", id);
  },

  async deleteBlueprint(id: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.from("blueprints").delete().eq("id", id);
  },

  async deleteRoadmap(id: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.from("roadmaps").delete().eq("id", id);
  },
};

export const collectionApi = proxy(realCollectionApi, mockCollectionApi);

// --- Profile API ---

const realProfileApi = {
  async getProfile(): Promise<UserProfile> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data as UserProfile;
  },

  async updateLanguage(language: "ko" | "en"): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ language })
      .eq("id", user.id);
    if (error) throw error;
  },
};

export const profileApi = proxy(realProfileApi, mockProfileApi);

// --- Admin API ---

const realAdminApi = {
  setPersona: (personaTier: string | null) =>
    apiFetch<{ status: string; persona_tier: string | null }>("/admin/persona", {
      method: "POST",
      body: JSON.stringify({ persona_tier: personaTier }),
    }),

  resetDailyState: () =>
    apiFetch<{ status: string }>("/admin/reset-daily-state", { method: "POST" }),

  regenerateVeins: () =>
    apiFetch<TodayVeinsResponse>("/admin/regenerate-veins", { method: "POST" }),

  getCostsSummary: (days: number = 7) =>
    apiFetch<CostSummaryResponse>(`/admin/costs/summary?days=${days}`),
};

export const adminApi = proxy(realAdminApi, mockAdminApi);
