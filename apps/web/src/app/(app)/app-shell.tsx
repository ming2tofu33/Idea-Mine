"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, FlaskConical, Pickaxe } from "lucide-react";
import { AdminFab } from "@/components/admin/admin-fab";
import { AppHeader } from "@/components/shared/app-header";
import { useProfile } from "@/hooks/use-profile";
import type { UserProfile } from "@/types/api";

const RAIL_ITEMS = [
  { href: "/mine", label: "Mine", icon: Pickaxe },
  { href: "/vault", label: "Vault", icon: Archive },
  { href: "/lab", label: "Lab", icon: FlaskConical },
] as const;

function DesktopRail() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[var(--desktop-rail-width)] shrink-0 border-r border-line-steel/60 bg-bg-deep/95 text-text-secondary md:flex md:flex-col md:items-center">
      <Link
        href="/"
        aria-label="Idea Mine home"
        className="flex h-[var(--desktop-header-height)] w-full items-center justify-center border-b border-line-steel/60 text-[11px] font-semibold tracking-[0.16em] text-text-primary transition-colors hover:text-cold-cyan"
      >
        IM
      </Link>

      <nav className="flex w-full flex-1 flex-col items-center gap-2 px-2 py-5">
        {RAIL_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              title={label}
              className={[
                "group relative flex h-14 w-full flex-col items-center justify-center gap-1 rounded-md border text-[10px] font-medium transition-all duration-200",
                isActive
                  ? "border-cold-cyan/45 bg-cold-cyan/12 text-cold-cyan shadow-[inset_0_1px_0_rgba(217,226,240,0.08),0_0_18px_rgba(92,205,229,0.12)]"
                  : "border-transparent text-text-secondary hover:border-line-steel/70 hover:bg-surface-1/45 hover:text-text-primary",
              ].join(" ")}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-8 w-px -translate-y-1/2 bg-cold-cyan shadow-[0_0_12px_rgba(92,205,229,0.75)]" />
              )}
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

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
    <div className="relative flex min-h-screen overflow-hidden bg-bg-deep text-text-primary">
      <DesktopRail />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} profile={profile} />

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>

      {profile?.role === "admin" && <AdminFab profile={profile} />}
    </div>
  );
}
