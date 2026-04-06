"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/mine", label: "Mine" },
  { href: "/vault", label: "Vault" },
  { href: "/lab", label: "Lab" },
] as const;

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="relative z-20 flex items-center justify-between border-b border-white/[0.06] bg-bg-deep/60 px-6 py-3 backdrop-blur-xl">
        <nav className="flex items-center gap-1.5">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-md border px-4 py-1.5 text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? "border-signal-pink/30 bg-[rgba(255,59,147,0.08)] text-text-primary shadow-[0_0_12px_rgba(255,59,147,0.15)]"
                    : "border-transparent text-text-secondary hover:border-line-steel/50 hover:bg-surface-1/50 hover:text-text-primary"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-signal-pink/60 to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary/70">
            {user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-md border border-transparent px-3 py-1 text-xs text-text-secondary transition-all hover:border-line-steel/40 hover:text-text-primary"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
