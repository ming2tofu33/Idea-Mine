"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { UserMenu } from "@/components/shared/user-menu";
import { useLanguage } from "@/hooks/use-language";
import { useProfile } from "@/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/api";

const NAV_ITEMS = [
  { href: "/mine", label: "Daily Mine" },
  { href: "/vault", label: "Vault" },
  { href: "/lab", label: "Web Lab" },
] as const;

type AppHeaderProps = {
  user: User | null;
  profile: UserProfile | null;
};

export function AppHeader({ user, profile: serverProfile }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile: clientProfile } = useProfile();
  const isLanding = pathname === "/";

  const profile = clientProfile ?? serverProfile;
  const { lang } = useLanguage(profile);
  const isGuest = !user;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={[
        "z-30 border-b border-line-steel/45 bg-bg-deep/72 px-4 backdrop-blur-xl sm:px-6",
        isLanding
          ? "sticky top-0 py-3"
          : "shrink-0 py-3 md:h-[var(--desktop-header-height)] md:px-5 md:py-0",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex w-full gap-3",
          isLanding
            ? "min-h-11 max-w-7xl items-center justify-between rounded-lg border border-line-steel/45 bg-surface-1/42 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(217,226,240,0.05)]"
            : "min-h-11 flex-col md:h-full md:flex-row md:items-center md:justify-between",
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4 md:flex-1 md:justify-start">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="shrink-0 text-sm font-semibold tracking-[0.16em] text-text-primary transition-colors hover:text-cold-cyan"
            >
              IDEA MINE
            </Link>
            <nav className={isLanding ? "hidden items-center gap-1 sm:flex" : "hidden"}>
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
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
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            {isGuest ? (
              <Link
                href="/auth/sign-in?next=/mine"
                className="rounded-md border border-cold-cyan/40 bg-cold-cyan/15 px-3 py-1.5 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/25"
              >
                Sign in
              </Link>
            ) : (
              <UserMenu
                email={user.email ?? ""}
                profile={profile}
                onSignOut={handleSignOut}
              />
            )}
          </div>
        </div>

        {!isLanding && (
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto pb-0.5 md:hidden">
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "relative shrink-0 rounded-md border px-3 py-1.5 text-sm tracking-wide transition-all duration-200",
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
        )}

        <span className="hidden text-[11px] tracking-[0.18em] text-text-secondary/70 lg:inline">
          observatory online
        </span>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          {isGuest ? (
            <Link
              href="/auth/sign-in?next=/mine"
              className="rounded-md border border-cold-cyan/40 bg-cold-cyan/15 px-3 py-1.5 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/25"
            >
              Sign in
            </Link>
          ) : (
            <UserMenu
              email={user.email ?? ""}
              profile={profile}
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}
