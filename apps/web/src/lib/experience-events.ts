/**
 * Minimal analytics for the public demo flow.
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
      keepalive: true,
    });
  } catch {
    // Logging must never break navigation.
  }
}
