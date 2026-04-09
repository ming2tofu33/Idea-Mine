"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Shield, User as UserIcon } from "lucide-react";
import { PersonaBadge } from "@/components/admin/persona-badge";
import type { UserProfile } from "@/types/api";

type UserMenuProps = {
  email: string;
  profile: UserProfile | null;
  onSignOut: () => void;
};

export function UserMenu({ email, profile, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const isAdmin = profile?.role === "admin";
  const displayName = email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-line-steel/40 bg-surface-1/50 px-2 py-1 text-xs text-text-secondary transition-all hover:border-cold-cyan/40 hover:text-text-primary"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cold-cyan/40 bg-cold-cyan/10 text-[11px] font-semibold text-cold-cyan">
          {initial}
        </span>
        {profile && <PersonaBadge profile={profile} />}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-lg border border-line-steel/40 bg-bg-deep/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <div className="border-b border-line-steel/20 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 text-text-secondary/60" />
              <p className="truncate text-xs font-medium text-text-primary">
                {displayName}
              </p>
            </div>
            <p className="mt-0.5 truncate pl-5 text-[11px] text-text-secondary/60">
              {email}
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-amber-300 transition-colors hover:bg-amber-400/10"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:bg-surface-1/60 hover:text-text-primary"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
