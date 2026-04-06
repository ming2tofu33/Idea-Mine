import { createClient } from "@/lib/supabase/client";
import type {
  ApiError,
  TodayVeinsResponse,
  RerollResponse,
  MineResponse,
  VaultResponse,
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
