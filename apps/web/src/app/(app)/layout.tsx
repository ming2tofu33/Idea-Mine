import { createClient } from "@/lib/supabase/server";
import { AppShell } from "./app-shell";

/**
 * The app shell stays accessible to guests so /mine, /vault, and /lab can
 * render demo experiences. Protected detail routes enforce their own guards.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <AppShell user={user} profile={profile}>
      {children}
    </AppShell>
  );
}
