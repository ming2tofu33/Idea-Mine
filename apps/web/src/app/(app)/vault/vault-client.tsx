"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Lock, Pickaxe } from "lucide-react";
import { VaultBackground } from "@/components/backgrounds/vault-background";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonCard } from "@/components/vault/skeleton-card";
import { oreApi, setMockMode } from "@/lib/api";
import type { IdeaOre, OreKeyword } from "@/types/api";

function KeywordPill({ keyword }: { keyword: OreKeyword }) {
  return (
    <span className="inline-flex items-center border border-line-steel/45 bg-bg-base/45 px-2 py-1 text-[11px] text-text-secondary">
      {keyword.label}
    </span>
  );
}

function VaultOreCard({ ore }: { ore: IdeaOre }) {
  return (
    <Link
      href={`/lab/${ore.id}`}
      className="desktop-instrument-flat group relative flex min-h-64 flex-col overflow-hidden p-5 transition-all duration-200 hover:border-cold-cyan/40 hover:bg-surface-1/55"
    >
      <span className="absolute inset-y-0 left-0 w-px bg-cold-cyan opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-cold-cyan">
          {ore.title}
        </h3>
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary/45 transition-colors group-hover:text-cold-cyan" />
      </div>

      <p className="mt-3 text-sm font-medium leading-relaxed text-text-primary/85">
        {ore.one_liner}
      </p>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-text-secondary">
        {ore.short_summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ore.selected_keywords.slice(0, 5).map((keyword) => (
          <KeywordPill key={keyword.id} keyword={keyword} />
        ))}
      </div>

      <div className="mt-5 border-t border-line-steel/25 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cold-cyan">
          Open in Web Lab
        </span>
      </div>
    </Link>
  );
}

export function VaultClient({ mockMode = false }: { mockMode?: boolean }) {
  const {
    data: ores,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ideaOresVault"],
    queryFn: () => {
      setMockMode(mockMode);
      return oreApi.getVaultedOres();
    },
  });

  return (
    <div className="relative flex min-h-0 flex-1">
      <VaultBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 w-full max-w-7xl">
          <PageHeader
            eyebrow="VAULT"
            title="Saved Idea Ores"
            subtitle="Short directions worth opening in Web Lab."
            className="border-b border-line-steel/45 pb-4"
            meta={
              ores && ores.length > 0 ? (
                <span className="border border-line-steel/45 bg-bg-base/45 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  {ores.length} saved
                </span>
              ) : undefined
            }
          />
        </div>

        <div className="mx-auto w-full max-w-7xl flex-1 pb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">Failed to load Vault.</p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          ) : ores && ores.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ores.map((ore) => (
                <VaultOreCard key={ore.id} ore={ore} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Lock className="h-12 w-12" />}
              title="No Idea Ores saved yet"
              description="Vault stores the ores you want to projectize later."
              action={
                <Link
                  href="/mine"
                  className="inline-flex cursor-pointer items-center gap-2 border border-cold-cyan/35 bg-cold-cyan/[0.08] px-5 py-2.5 text-sm font-semibold text-cold-cyan transition-all duration-200 hover:border-cold-cyan/55 hover:bg-cold-cyan/[0.12]"
                >
                  <Pickaxe className="h-4 w-4" />
                  Go to Daily Mine
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
