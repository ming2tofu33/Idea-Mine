/**
 * IDEA MINE — Backend API Client
 *
 * Supabase Auth 토큰을 자동으로 첨부하고,
 * 에러 핸들링을 중앙에서 처리합니다.
 */

import { supabase } from "./supabase";
import type {
  Idea,
  TodayVeinsResponse,
  RerollResponse,
  MineResponse,
  VaultResponse,
  ApiError,
} from "../types/api";
import type { Overview } from "../types/overview";
import type { Appraisal } from "../types/appraisal";
import { mockMiningApi, mockIdeasApi, mockAdminApi } from "./mock-data";

// 런타임 mock 모드 토글. AdminFab에서 변경 가능.
let _mockMode = process.env.EXPO_PUBLIC_MOCK === "true";
export function isMockMode(): boolean { return _mockMode; }
export function setMockMode(on: boolean): void { _mockMode = on; }

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

// --- Access Token 캐시 ---
// onAuthStateChange로 자동 갱신, getSession() 매번 호출 방지

let _cachedToken: string | null = null;

supabase.auth.onAuthStateChange((_event, session) => {
  _cachedToken = session?.access_token ?? null;
});

// 초기화: 앱 시작 시 기존 세션 토큰 로드
supabase.auth.getSession().then(({ data }) => {
  _cachedToken = data.session?.access_token ?? null;
});

function getAccessToken(): string | null {
  return _cachedToken;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

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

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isDailyLimitReached(): boolean {
    return this.status === 403 && this.body.error === "daily_limit_exceeded";
  }

  get retryAfter(): number | undefined {
    return this.body.retry_after;
  }
}

// --- Real API implementations ---

const realMiningApi = {
  getTodayVeins(): Promise<TodayVeinsResponse> {
    return apiFetch("/mining/veins/today");
  },
  reroll(): Promise<RerollResponse> {
    return apiFetch("/mining/veins/reroll", { method: "POST" });
  },
  mine(veinId: string): Promise<MineResponse> {
    return apiFetch(`/mining/veins/${veinId}/mine`, { method: "POST" });
  },
};

const realIdeasApi = {
  vaultIdeas(ideaIds: string[], veinId: string): Promise<VaultResponse> {
    return apiFetch("/ideas/vault", {
      method: "PATCH",
      body: JSON.stringify({ idea_ids: ideaIds, vein_id: veinId }),
    });
  },
};

const realAdminApi = {
  setPersona(personaTier: string | null): Promise<{ status: string; persona_tier: string | null }> {
    return apiFetch("/admin/persona", {
      method: "POST",
      body: JSON.stringify({ persona_tier: personaTier }),
    });
  },
  resetDailyState(): Promise<{ status: string }> {
    return apiFetch("/admin/reset-daily-state", { method: "POST" });
  },
  regenerateVeins(): Promise<TodayVeinsResponse> {
    return apiFetch("/admin/regenerate-veins", { method: "POST" });
  },
};

// --- Proxy: 호출 시점에 mock/real 판단 ---

function proxy<T extends Record<string, (...args: any[]) => any>>(real: T, mock: T): T {
  const handler: ProxyHandler<T> = {
    get(_, prop: string) {
      return (...args: any[]) => (_mockMode ? mock : real)[prop](...args);
    },
  };
  return new Proxy(real, handler);
}

export const miningApi = proxy(realMiningApi, mockMiningApi);
export const ideasApi = proxy(realIdeasApi, mockIdeasApi);
export const adminApi = proxy(realAdminApi, mockAdminApi);

// --- Vault API (Supabase direct) ---

export const vaultApi = {
  async getVaultedIdeas(): Promise<Idea[]> {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("is_vaulted", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getOverviews(): Promise<Overview[]> {
    const { data, error } = await supabase
      .from("overviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getIdea(ideaId: string): Promise<Idea | null> {
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("id", ideaId)
      .single();
    if (error) throw error;
    return data as Idea | null;
  },

  async getOverview(overviewId: string): Promise<Overview | null> {
    const { data, error } = await supabase
      .from("overviews")
      .select("*")
      .eq("id", overviewId)
      .single();
    if (error) throw error;
    return data as Overview | null;
  },

  async deleteIdea(ideaId: string): Promise<void> {
    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", ideaId);
    if (error) throw error;
  },
};

// --- Lab API (backend) ---

export const labApi = {
  createOverview(ideaId: string): Promise<Overview> {
    return apiFetch("/lab/overview", {
      method: "POST",
      body: JSON.stringify({ idea_id: ideaId }),
    });
  },

  createAppraisal(overviewId: string, depth: string = "basic"): Promise<Appraisal> {
    return apiFetch("/lab/appraisal", {
      method: "POST",
      body: JSON.stringify({ overview_id: overviewId, depth }),
    });
  },
};
