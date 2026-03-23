/**
 * IDEA MINE — Backend API Client
 *
 * Supabase Auth 토큰을 자동으로 첨부하고,
 * 에러 핸들링을 중앙에서 처리합니다.
 */

import { supabase } from "./supabase";
import type {
  TodayVeinsResponse,
  RerollResponse,
  MineResponse,
  VaultResponse,
  ApiError,
} from "../types/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

// --- Core fetch wrapper ---

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

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

// --- Mining API ---

export const miningApi = {
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

// --- Ideas API (Vault 반입) ---

export const ideasApi = {
  vaultIdeas(ideaIds: string[], veinId: string): Promise<VaultResponse> {
    return apiFetch("/ideas/vault", {
      method: "PATCH",
      body: JSON.stringify({ idea_ids: ideaIds, vein_id: veinId }),
    });
  },
};

// --- Admin API ---

export const adminApi = {
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
