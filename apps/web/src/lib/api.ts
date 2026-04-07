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
} from "@/types/api";

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

export const miningApi = {
  getTodayVeins: () =>
    apiFetch<TodayVeinsResponse>("/mining/veins/today"),

  reroll: () =>
    apiFetch<RerollResponse>("/mining/veins/reroll", { method: "POST" }),

  mine: (veinId: string) =>
    apiFetch<MineResponse>(`/mining/veins/${veinId}/mine`, { method: "POST" }),
};

// --- Ideas API ---

export const ideasApi = {
  vault: (ideaIds: string[], veinId: string) =>
    apiFetch<VaultResponse>("/ideas/vault", {
      method: "PATCH",
      body: JSON.stringify({ idea_ids: ideaIds, vein_id: veinId }),
    }),
};

// --- Vault API (Supabase direct read) ---

export const vaultApi = {
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

// --- Lab API ---

export const labApi = {
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

  async deleteFullOverview(fullOverviewId: string): Promise<void> {
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { error } = await supabase
      .from("full_overviews")
      .delete()
      .eq("id", fullOverviewId);
    if (error) throw error;
  },
};

// --- Profile API ---

export const profileApi = {
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
};

// --- Admin API ---

export const adminApi = {
  setPersona: (personaTier: string | null) =>
    apiFetch<{ status: string; persona_tier: string | null }>("/admin/persona", {
      method: "POST",
      body: JSON.stringify({ persona_tier: personaTier }),
    }),

  resetDailyState: () =>
    apiFetch<{ status: string }>("/admin/reset-daily-state", { method: "POST" }),

  regenerateVeins: () =>
    apiFetch<TodayVeinsResponse>("/admin/regenerate-veins", { method: "POST" }),
};
