import { DemoLab } from "@/components/experience/demo-lab";
import { createClient } from "@/lib/supabase/server";
import { LabClient } from "./lab-client";

/**
 * /lab 라우트 — 인증 상태에 따라 분기.
 * - 로그인 유저: 실제 Lab (LabClient)
 * - 게스트: 데모 Lab (DemoLab) — 정적 샘플 데이터
 */
export default async function LabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <DemoLab />;
  }

  return <LabClient />;
}
