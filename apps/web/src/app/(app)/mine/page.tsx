import { createClient } from "@/lib/supabase/server";
import { DemoMine } from "@/components/experience/demo-mine";
import { MineClient } from "./mine-client";

/**
 * /mine 라우트 — 인증 상태에 따라 분기.
 * - 로그인 유저: 실제 Mine (MineClient) — API 호출, 매일 새 광맥
 * - 게스트: 데모 모드 (DemoMine) — 정적 샘플 데이터, 액션은 sign-in 유도
 */
export default async function MinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <DemoMine />;
  }

  return <MineClient />;
}
