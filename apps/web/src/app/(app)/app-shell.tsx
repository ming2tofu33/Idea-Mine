"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AdminFab } from "@/components/admin/admin-fab";
import { PersonaBadge } from "@/components/admin/persona-badge";
import { SignalButton } from "@/components/shared/signal-button";
import { StatusRail } from "@/components/shared/status-rail";
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
      <header className="relative z-20 px-4 py-3 sm:px-6">
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
            <div className="flex items-center gap-2.5">
              {profile && <PersonaBadge profile={profile} />}
              <button
                type="button"
                onClick={handleToggleLanguage}
                disabled={isUpdatingLanguage}
                title={currentLang === "ko" ? "Switch to English" : "한국어로 전환"}
                className="cursor-pointer rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary transition-all hover:border-cold-cyan/40 hover:text-cold-cyan disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={currentLang === "ko" ? "text-cold-cyan" : ""}>한</span>
                <span className="mx-1 text-text-secondary/40">/</span>
                <span className={currentLang === "en" ? "text-cold-cyan" : ""}>EN</span>
              </button>
              <span className="hidden max-w-[220px] truncate text-xs text-text-secondary/70 md:inline">
                {user.email}
              </span>
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-md border border-amber-400/25 px-2.5 py-1 text-xs text-amber-300 transition-all hover:border-amber-300/45 hover:bg-amber-400/8"
                >
                  Admin
                </Link>
              )}
              <SignalButton
                type="button"
                variant="ghost"
                onClick={handleSignOut}
                className="px-2.5 py-1 text-xs"
              >
                Sign out
              </SignalButton>
            </div>
          }
        />
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      {profile?.role === "admin" && <AdminFab profile={profile} />}
    </div>
  );
}
