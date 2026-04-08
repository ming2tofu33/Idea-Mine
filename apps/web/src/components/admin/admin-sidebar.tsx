"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, DollarSign, ArrowLeft } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: BarChart3, exact: true },
  { href: "/admin/costs", label: "비용", icon: DollarSign, exact: false },
] as const;

const FUTURE_ITEMS = [
  { label: "사용자", note: "S2" },
  { label: "퍼널", note: "S2" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-white/[0.06] bg-bg-deep/80 backdrop-blur-xl">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-4 py-4">
        <h1 className="text-sm font-semibold tracking-wide text-amber-400">
          IDEA MINE Admin
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3">
        <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/50">
          메뉴
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                isActive
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-text-secondary hover:bg-surface-1/50 hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}

        {/* Future items */}
        <div className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/30">
          예정
        </div>
        {FUTURE_ITEMS.map(({ label, note }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-text-secondary/30"
          >
            <span>{label}</span>
            <span className="rounded bg-surface-1/30 px-1.5 py-0.5 text-[10px]">
              {note}
            </span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-2 py-3">
        <Link
          href="/mine"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-all hover:bg-surface-1/50 hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          앱으로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
