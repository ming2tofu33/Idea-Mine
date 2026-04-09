"use client";

import type { User } from "@supabase/supabase-js";
import { AdminFab } from "@/components/admin/admin-fab";
import { AppHeader } from "@/components/shared/app-header";
import { useProfile } from "@/hooks/use-profile";
import type { UserProfile } from "@/types/api";

export function AppShell({
  user,
  profile: serverProfile,
  children,
}: {
  user: User | null;
  profile: UserProfile | null;
  children: React.ReactNode;
}) {
  const { profile: clientProfile } = useProfile();
  const profile = clientProfile ?? serverProfile;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader user={user} profile={profile} />

      <main className="flex flex-1 flex-col">{children}</main>

      {profile?.role === "admin" && <AdminFab profile={profile} />}
    </div>
  );
}
