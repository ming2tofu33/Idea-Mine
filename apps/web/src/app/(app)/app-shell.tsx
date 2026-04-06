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
      <header className="flex items-center justify-between border-b border-line-steel bg-bg-base px-6 py-3">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-surface-2 text-signal-pink"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-xs text-text-secondary">
            {user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
