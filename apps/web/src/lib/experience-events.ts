/**
 * 공개 체험 플로우를 위한 최소 계측.
 * 비로그인 세션을 localStorage sessionId로 식별하고,
 * /api/experience-events로 fire-and-forget 전송.
 */

export type ExperienceEventName =
  | "landing_experience_click"
  | "experience_entry_view"
  | "experience_vein_select"
  | "experience_result_view"
  | "experience_gate_impression"
  | "experience_gate_click";

const STORAGE_KEY = "idea-mine:experience:session-id";

export function getExperienceSessionId(): string {
  if (typeof window === "undefined") return "ssr";

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const fresh = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return "no-storage";
  }
}

type TrackArgs = {
  eventName: ExperienceEventName;
  route: string;
  veinId?: string;
  metadata?: Record<string, unknown>;
};

export async function trackExperienceEvent(args: TrackArgs): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getExperienceSessionId();
    await fetch("/api/experience-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...args }),
      // Fire-and-forget: don't block navigation on logging
      keepalive: true,
    });
  } catch {
    // Silent fail — logging must never break user flow
  }
}
