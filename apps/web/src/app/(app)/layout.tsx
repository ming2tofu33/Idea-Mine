import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./app-shell";
import { QueryProvider } from "@/lib/query-provider";

/**
 * (app) 레이아웃은 게스트도 통과시킨다 — /mine은 게스트에게 데모를 보여주기 때문.
 * 보호가 필요한 페이지는 각 page.tsx에서 자체 가드 (vault, lab, mine/[veinId] 등).
 * 게스트면 user/profile이 null이고 AppShell은 게스트 모드 헤더를 렌더한다.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  return (
    <QueryProvider>
      <AppShell user={user} profile={profile}>
        {children}
      </AppShell>
    </QueryProvider>
  );
}
