"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Pickaxe, RefreshCw, Save } from "lucide-react";
import { MineBackground } from "@/components/backgrounds/mine-background";
import { PageHeader } from "@/components/shared/page-header";
import { oreApi, setMockMode } from "@/lib/api";
import type { IdeaOre, OreDailyVein } from "@/types/api";

function VeinOptionCard({
  vein,
  isSelected,
  onSelect,
}: {
  vein: OreDailyVein;
  isSelected: boolean;
  onSelect: (veinId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(vein.id)}
      className={[
        "relative flex min-h-36 flex-col overflow-hidden border p-4 text-left transition-all duration-200",
        isSelected
          ? "border-cold-cyan/65 bg-cold-cyan/[0.08] shadow-[inset_0_1px_0_rgba(217,226,240,0.08),_0_0_24px_rgba(92,205,229,0.12)]"
          : "desktop-instrument-flat hover:border-cold-cyan/35 hover:bg-surface-1/55",
      ].join(" ")}
    >
      <span
        className={[
          "absolute inset-x-0 top-0 h-0.5",
          isSelected ? "bg-cold-cyan" : "bg-line-steel/45",
        ].join(" ")}
      />
      <span
        className={[
          "text-[11px] font-semibold uppercase tracking-[0.18em]",
          isSelected ? "text-cold-cyan" : "text-text-secondary/65",
        ].join(" ")}
      >
        Vein {vein.slot_index}
      </span>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {vein.keywords.map((keyword) => (
          <span
            key={keyword.id}
            className="border border-line-steel/45 bg-bg-base/45 px-2 py-1 text-xs text-text-secondary"
          >
            {keyword.label}
          </span>
        ))}
      </div>
    </button>
  );
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-text-secondary">{value}</dd>
    </div>
  );
}

function OreCard({
  ore,
  isSaving,
  onVault,
}: {
  ore: IdeaOre;
  isSaving: boolean;
  onVault: (oreId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="desktop-instrument-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{ore.title}</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-text-primary/90">
            {ore.one_liner}
          </p>
        </div>
        <span className="shrink-0 border border-line-steel/45 bg-bg-base/50 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
          Ore {ore.sort_order}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {ore.selected_keywords.map((keyword) => (
          <span
            key={keyword.id}
            className="border border-line-steel/45 bg-bg-base/45 px-2 py-1 text-[11px] text-text-secondary"
          >
            {keyword.label}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-line-steel/45 bg-bg-base/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary transition-all duration-200 hover:border-cold-cyan/40 hover:text-text-primary"
        >
          Details
          <ChevronDown
            className={[
              "h-4 w-4 transition-transform duration-200",
              isExpanded ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        <button
          type="button"
          disabled={ore.is_vaulted || isSaving}
          onClick={() => onVault(ore.id)}
          className={[
            "inline-flex min-w-32 items-center justify-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
            ore.is_vaulted
              ? "cursor-default border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              : "border-signal-pink/35 bg-signal-pink/10 text-signal-pink hover:border-signal-pink/55 hover:bg-signal-pink/15",
            isSaving ? "cursor-wait opacity-70" : "",
          ].join(" ")}
        >
          {ore.is_vaulted ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving" : "Save to Vault"}
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 border-t border-line-steel/20 pt-5">
          <p className="text-sm leading-relaxed text-text-secondary/85">
            {ore.short_summary}
          </p>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <FieldBlock label="Interesting point" value={ore.interesting_point} />
            <FieldBlock label="Project fit" value={ore.project_fit} />
            <FieldBlock label="Risk" value={ore.risk} />
            <FieldBlock label="MVP hint" value={ore.mvp_hint} />
          </dl>
        </div>
      )}
    </article>
  );
}

export function MineClient({ mockMode = false }: { mockMode?: boolean }) {
  setMockMode(mockMode);
  const queryClient = useQueryClient();
  const [selectedVeinId, setSelectedVeinId] = useState<string | null>(null);
  const [ores, setOres] = useState<IdeaOre[]>([]);
  const [savingOreId, setSavingOreId] = useState<string | null>(null);

  const veinsQuery = useQuery({
    queryKey: ["oreDailyVeins"],
    queryFn: oreApi.getTodayVeins,
  });

  const veins = veinsQuery.data?.veins ?? [];
  const selectedVein =
    veins.find((vein) => vein.id === selectedVeinId) ?? veins[0] ?? null;

  const discoverMutation = useMutation({
    mutationFn: (veinId: string) => oreApi.discover(veinId),
    onSuccess: (response) => {
      setOres([...response.ores].sort((a, b) => a.sort_order - b.sort_order));
      queryClient.invalidateQueries({ queryKey: ["oreDailyVeins"] });
    },
  });

  const rerollMutation = useMutation({
    mutationFn: oreApi.rerollVeins,
    onSuccess: (response) => {
      queryClient.setQueryData(["oreDailyVeins"], response);
      setSelectedVeinId(response.veins[0]?.id ?? null);
      setOres([]);
    },
  });
  const canRefreshVeins =
    !rerollMutation.isPending &&
    !discoverMutation.isPending &&
    !!veinsQuery.data &&
    veinsQuery.data.rerolls_used < veinsQuery.data.rerolls_max;

  const vaultMutation = useMutation({
    mutationFn: oreApi.vault,
    onMutate: (oreId) => {
      setSavingOreId(oreId);
    },
    onSuccess: (response) => {
      setOres((current) =>
        current.map((ore) =>
          ore.id === response.ore_id ? { ...ore, is_vaulted: true } : ore,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["ideaOresVault"] });
    },
    onSettled: () => {
      setSavingOreId(null);
    },
  });

  return (
    <div className="relative flex min-h-0 flex-1">
      <MineBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
          <PageHeader
            eyebrow="DAILY MINE"
            title="Mine Idea Ores"
            subtitle="Mine today's Vein into short ores, then save the ones worth opening in Web Lab."
            className="border-b border-line-steel/45 pb-4"
            meta={
              <>
                <span className="border border-line-steel/45 bg-bg-base/45 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  3 veins / 10 ores
                </span>
                {veinsQuery.data && (
                  <span className="border border-line-steel/45 bg-bg-base/45 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                    Rerolls{" "}
                    <span className="text-text-primary">
                      {veinsQuery.data.rerolls_used}/{veinsQuery.data.rerolls_max}
                    </span>
                  </span>
                )}
              </>
            }
          />

          <section className="desktop-instrument-surface p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-primary">
                  Today&apos;s Veins
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Three pre-given keyword clusters. No manual keyword setup.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    !canRefreshVeins
                  }
                  onClick={() => rerollMutation.mutate()}
                  className={[
                    "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                    canRefreshVeins
                      ? "border-cold-cyan/35 bg-cold-cyan/[0.08] text-cold-cyan hover:border-cold-cyan/55 hover:bg-cold-cyan/[0.12]"
                      : "cursor-not-allowed border-line-steel/25 bg-surface-2/40 text-text-secondary/45",
                  ].join(" ")}
                >
                  <RefreshCw
                    className={[
                      "h-4 w-4",
                      rerollMutation.isPending ? "animate-spin" : "",
                    ].join(" ")}
                  />
                  {rerollMutation.isPending ? "Refreshing" : "Refresh Veins"}
                </button>
                <button
                  type="button"
                  disabled={discoverMutation.isPending || rerollMutation.isPending || !selectedVein}
                  onClick={() => {
                    if (selectedVein) {
                      discoverMutation.mutate(selectedVein.id);
                    }
                  }}
                  className={[
                    "inline-flex min-h-11 items-center justify-center gap-2 border px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                    !discoverMutation.isPending && !rerollMutation.isPending && selectedVein
                      ? "border-signal-pink/45 bg-signal-pink/10 text-signal-pink hover:border-signal-pink/60 hover:bg-signal-pink/15 hover:shadow-[0_0_22px_rgba(255,59,147,0.16)]"
                      : "cursor-not-allowed border-line-steel/25 bg-surface-2/40 text-text-secondary/45",
                  ].join(" ")}
                >
                  <Pickaxe className="h-4 w-4" />
                  {discoverMutation.isPending ? "Mining" : "Mine Ores"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {veinsQuery.isPending ? (
                Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="desktop-instrument-flat min-h-36 animate-pulse"
                  />
                ))
              ) : (
                veins.map((vein) => (
                  <VeinOptionCard
                    key={vein.id}
                    vein={vein}
                    isSelected={vein.id === selectedVein?.id}
                    onSelect={(veinId) => {
                      setSelectedVeinId(veinId);
                      setOres([]);
                    }}
                  />
                ))
              )}
            </div>

          </section>

          {veinsQuery.isError && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {veinsQuery.error instanceof Error
                ? veinsQuery.error.message
                : "Failed to load Daily Veins."}
            </div>
          )}

          {discoverMutation.isError && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {discoverMutation.error instanceof Error
                ? discoverMutation.error.message
                : "Failed to mine Idea Ores."}
            </div>
          )}

          {rerollMutation.isError && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {rerollMutation.error instanceof Error
                ? rerollMutation.error.message
                : "Failed to refresh Daily Veins."}
            </div>
          )}

          {discoverMutation.isPending ? (
            <div className="flex min-h-64 items-center justify-center border border-dashed border-line-steel/45 bg-bg-base/45 backdrop-blur-[10px]">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-px animate-pulse bg-signal-pink" />
                <p className="text-sm text-text-secondary">Extracting short Idea Ores...</p>
              </div>
            </div>
          ) : ores.length > 0 ? (
            <section className="grid gap-4 lg:grid-cols-2">
              {ores.map((ore) => (
                <OreCard
                  key={ore.id}
                  ore={ore}
                  isSaving={savingOreId === ore.id}
                  onVault={(oreId) => vaultMutation.mutate(oreId)}
                />
              ))}
            </section>
          ) : (
            <div className="border border-dashed border-line-steel/45 bg-bg-base/45 p-8 text-center backdrop-blur-[10px]">
              <div className="desktop-signal-line mx-auto mb-4 h-px max-w-72" />
              <p className="text-sm text-text-secondary">
                Today&apos;s Vein is ready to mine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
