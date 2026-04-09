import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ExperienceEventBody = {
  sessionId: string;
  eventName:
    | "landing_experience_click"
    | "experience_entry_view"
    | "experience_vein_select"
    | "experience_result_view"
    | "experience_gate_impression"
    | "experience_gate_click";
  route: string;
  veinId?: string;
  metadata?: Record<string, unknown>;
};

const ALLOWED_EVENTS = new Set([
  "landing_experience_click",
  "experience_entry_view",
  "experience_vein_select",
  "experience_result_view",
  "experience_gate_impression",
  "experience_gate_click",
]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ExperienceEventBody>;

    // Validate minimum fields
    if (
      !body.sessionId ||
      typeof body.sessionId !== "string" ||
      !body.eventName ||
      !ALLOWED_EVENTS.has(body.eventName) ||
      !body.route ||
      typeof body.route !== "string"
    ) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("experience_events").insert({
      session_id: body.sessionId,
      event_name: body.eventName,
      route: body.route,
      vein_id: body.veinId ?? null,
      metadata: body.metadata ?? {},
    });

    if (error) {
      // Fail silently — logging must not break UX
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
