"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AdminFab } from "@/components/admin/admin-fab";
import { StatusRail } from "@/components/shared/status-rail";
import { UserMenu } from "@/components/shared/user-menu";
import { useProfile } from "@/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/api";

const NAV_ITEMS = [
  { href: "/mine", label: "Mine" },
  { href: "/vault", label: "Vault" },
  { href: "/lab", label: "Lab" },
] as const;

export function AppShell({
  user,
  profile: serverProfile,
  children,
}: {
  user: User;
  profile: UserProfile | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile: clientProfile, updateLanguage, isUpdatingLanguage } = useProfile();

  // 클라이언트 프로필이 있으면 우선, 없으면 서버 SSR 프로필
  const profile = clientProfile ?? serverProfile;
  const currentLang = profile?.language ?? "ko";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleToggleLanguage() {
    updateLanguage(currentLang === "ko" ? "en" : "ko");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-line-steel/20 bg-bg-deep/70 px-4 py-3 backdrop-blur-xl sm:px-6">
        <StatusRail
          variant="app"
          left={
            <nav className="flex items-center gap-1.5">
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "relative rounded-md border px-3 py-1.5 text-sm tracking-wide transition-all duration-200",
                      isActive
                        ? "border-signal-pink/35 bg-[rgba(255,59,147,0.08)] text-text-primary signal-glow-pink"
                        : "border-transparent text-text-secondary hover:border-line-steel/55 hover:bg-surface-1/40 hover:text-text-primary",
                    ].join(" ")}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-signal-pink/70 to-transparent" />
                    )}
                  </Link>
                );
              })}
            </nav>
          }
          center={
            <span className="hidden text-[11px] uppercase tracking-[0.22em] text-text-secondary/70 lg:inline">
              observatory online
            </span>
          }
          right={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleLanguage}
                disabled={isUpdatingLanguage}
                title={currentLang === "ko" ? "Switch to English" : "Switch to Korean"}
                className="cursor-pointer rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary transition-all hover:border-cold-cyan/40 hover:text-cold-cyan disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={currentLang === "ko" ? "text-cold-cyan" : ""}>KO</span>
                <span className="mx-1 text-text-secondary/40">/</span>
                <span className={currentLang === "en" ? "text-cold-cyan" : ""}>EN</span>
              </button>
              <UserMenu
                email={user.email ?? ""}
                profile={profile}
                onSignOut={handleSignOut}
              />
            </div>
          }
        />
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      {profile?.role === "admin" && <AdminFab profile={profile} />}
    </div>
  );
}
