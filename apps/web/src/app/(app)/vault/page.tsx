import { DemoVault } from "@/components/experience/demo-vault";
import { createClient } from "@/lib/supabase/server";
import { VaultClient } from "./vault-client";

/**
 * /vault 라우트 — 인증 상태에 따라 분기.
 * - 로그인 유저: 실제 Vault (VaultClient)
 * - 게스트: 데모 Vault (DemoVault) — 정적 샘플 데이터
 */
export default async function VaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <DemoVault />;
  }

  return <VaultClient />;
}
