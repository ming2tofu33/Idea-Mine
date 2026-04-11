"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { StatusRail } from "@/components/shared/status-rail";
import { UserMenu } from "@/components/shared/user-menu";
import { useLanguage } from "@/hooks/use-language";
import { useProfile } from "@/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/api";

const NAV_ITEMS = [
  { href: "/mine", label: "Mine" },
  { href: "/vault", label: "Vault" },
  { href: "/lab", label: "Lab" },
] as const;

const HEADER_LABELS = {
  center: {
    ko: "관측소 연결됨",
    en: "observatory online",
  },
  toggleTitle: {
    ko: "영어로 전환",
    en: "한국어로 전환",
  },
  signIn: {
    ko: "로그인",
    en: "Sign in",
  },
} as const;

type AppHeaderProps = {
  user: User | null;
  profile: UserProfile | null;
};

/**
 * 모든 페이지 공통 헤더.
 * 좌측: [IDEA MINE 로고] [Mine | Vault | Lab] — Linear/Notion 패턴
 * 중앙: Observatory status
 * 우측: [KO/EN] [UserMenu or Sign in]
 *
 * 게스트도 동일한 헤더 레이아웃을 보며 KO/EN 토글을 사용할 수 있다.
 */
export function AppHeader({ user, profile: serverProfile }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile: clientProfile } = useProfile();
  const isLanding = pathname === "/";

  // 클라이언트 프로필이 있으면 우선 사용 (optimistic update 반영)
  const profile = clientProfile ?? serverProfile;
  const { lang, toggle, isUpdating } = useLanguage(profile);
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
    <header className="sticky top-0 z-30 border-b border-line-steel/20 bg-bg-deep/70 px-4 py-3 backdrop-blur-xl sm:px-6">
      <StatusRail
        variant="app"
        left={
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.16em] text-text-primary transition-colors hover:text-cold-cyan"
            >
              IDEA MINE
            </Link>
            <nav className={isLanding ? "hidden items-center gap-1 sm:flex" : "flex items-center gap-1"}>
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
          </div>
        }
        center={
          <span className="hidden text-[11px] tracking-[0.18em] text-text-secondary/70 lg:inline">
            {HEADER_LABELS.center[lang]}
          </span>
        }
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              disabled={isUpdating}
              title={HEADER_LABELS.toggleTitle[lang]}
              className="cursor-pointer rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-text-secondary transition-all hover:border-cold-cyan/40 hover:text-cold-cyan disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={lang === "ko" ? "text-cold-cyan" : ""}>KO</span>
              <span className="mx-1 text-text-secondary/40">/</span>
              <span className={lang === "en" ? "text-cold-cyan" : ""}>EN</span>
            </button>
            {isGuest ? (
              <Link
                href="/auth/sign-in?next=/mine"
                className="rounded-md border border-cold-cyan/40 bg-cold-cyan/15 px-3 py-1.5 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/25"
              >
                {HEADER_LABELS.signIn[lang]}
              </Link>
            ) : (
              <UserMenu
                email={user.email ?? ""}
                profile={profile}
                onSignOut={handleSignOut}
              />
            )}
          </div>
        }
      />
    </header>
  );
}
