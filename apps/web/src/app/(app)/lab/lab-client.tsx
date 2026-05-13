"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, FlaskConical, Pickaxe } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonRow } from "@/components/lab/skeleton-row";
import { oreApi, setMockMode } from "@/lib/api";

export function LabClient({ mockMode = false }: { mockMode?: boolean }) {
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
      <LabBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 w-full max-w-6xl">
          <PageHeader
            eyebrow="WEB LAB"
            title="Projectize Idea Ores"
            subtitle="Open saved ores and turn them into project-ready documents."
            className="border-b border-line-steel/45 pb-4"
            meta={
              ores && ores.length > 0 ? (
                <span className="border border-line-steel/45 bg-bg-base/45 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  {ores.length} ready
                </span>
              ) : undefined
            }
          />
        </div>

        <div className="mx-auto w-full max-w-6xl flex-1 pb-8">
          {isLoading ? (
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">Failed to load Web Lab.</p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          ) : ores && ores.length > 0 ? (
            <div className="space-y-3">
              {ores.map((ore) => (
                <Link
                  key={ore.id}
                  href={`/lab/${ore.id}`}
                  className="desktop-instrument-flat group relative flex items-stretch gap-4 overflow-hidden p-4 transition-all duration-200 hover:border-cold-cyan/40 hover:bg-surface-1/55 focus-visible:border-cold-cyan/50 focus-visible:bg-surface-1/55 sm:p-5"
                >
                  <span className="absolute inset-y-0 left-0 w-px bg-cold-cyan opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="min-w-0 text-base font-semibold leading-6 text-text-primary transition-colors group-hover:text-cold-cyan group-focus-visible:text-cold-cyan">
                        {ore.title}
                      </h3>
                      <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-text-secondary/45 transition-colors group-hover:text-cold-cyan group-focus-visible:text-cold-cyan sm:block" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {ore.one_liner}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <span className="border border-cold-cyan/40 bg-cold-cyan/[0.08] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cold-cyan transition-all duration-200 group-hover:border-cold-cyan/60 group-hover:bg-cold-cyan/[0.12] group-focus-visible:border-cold-cyan/60 group-focus-visible:bg-cold-cyan/[0.12]">
                      Projectize
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FlaskConical className="h-10 w-10" />}
              title="No ores ready for Web Lab"
              description="Save an Idea Ore from Daily Mine before projectizing."
              action={
                <Link
                  href="/mine"
                  className="inline-flex cursor-pointer items-center gap-2 border border-cold-cyan/35 bg-cold-cyan/[0.08] px-5 py-2.5 text-sm font-semibold text-cold-cyan transition-all duration-200 hover:border-cold-cyan/55 hover:bg-cold-cyan/[0.12] focus-visible:border-cold-cyan/60 focus-visible:bg-cold-cyan/[0.14]"
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
