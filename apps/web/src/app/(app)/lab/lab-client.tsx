"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FlaskConical, Pickaxe } from "lucide-react";
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
        <div className="mx-auto mb-6 w-full max-w-5xl">
          <PageHeader
            eyebrow="WEB LAB"
            title="Projectize Idea Ores"
            subtitle="Open saved ores and turn them into project-ready documents."
          />
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1">
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
                  className="group flex items-center justify-between gap-4 rounded-xl border border-line-steel/25 bg-surface-1/45 p-4 backdrop-blur-xl transition-all duration-200 hover:border-cold-cyan/25 hover:bg-surface-1/65"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-text-primary group-hover:text-cold-cyan">
                      {ore.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {ore.one_liner}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg border border-cold-cyan/25 bg-cold-cyan/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cold-cyan">
                    Projectize
                  </span>
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
                  className="inline-flex cursor-pointer items-center gap-2 text-xs text-cold-cyan/70 transition-colors duration-200 hover:text-cold-cyan"
                >
                  <Pickaxe className="h-3.5 w-3.5" />
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
