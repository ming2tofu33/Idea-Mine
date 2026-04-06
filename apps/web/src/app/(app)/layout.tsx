import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./app-shell";
import { QueryProvider } from "@/lib/query-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <QueryProvider>
      <AppShell user={user}>{children}</AppShell>
    </QueryProvider>
  );
}
