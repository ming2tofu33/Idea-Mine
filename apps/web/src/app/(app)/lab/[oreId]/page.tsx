"use client";

import { use, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Check, Copy, FlaskConical } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { oreApi } from "@/lib/api";
import type { ProjectSeedBrief } from "@/types/api";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="desktop-instrument-surface rounded-xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-primary">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-text-secondary">{children}</div>
    </section>
  );
}

function CopyButton({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-4 py-2 text-sm font-semibold text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function briefToMarkdown(brief: ProjectSeedBrief): string {
  return [
    "# Project Seed Brief",
    "",
    "## Product Concept",
    brief.product_concept,
    "",
    "## Target User",
    brief.target_user,
    "",
    "## Core Loop",
    ...brief.core_loop.map((item) => `- ${item}`),
    "",
    "## MVP Features",
    ...brief.mvp_features.map((item) => `- ${item}`),
    "",
    "## First Screens",
    ...brief.first_screens.map((item) => `- ${item}`),
    "",
    "## Not To Build",
    ...brief.not_to_build.map((item) => `- ${item}`),
    "",
    "## Data Model Hint",
    brief.data_model_hint,
    "",
    "## API Hint",
    brief.api_hint,
    "",
    "## Vibe Coding Prompt",
    brief.vibe_coding_prompt,
  ].join("\n");
}

function ListItems({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="desktop-instrument-flat rounded-lg px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function LabOrePage({
  params,
}: {
  params: Promise<{ oreId: string }>;
}) {
  const { oreId } = use(params);
  const [brief, setBrief] = useState<ProjectSeedBrief | null>(null);

  const oreQuery = useQuery({
    queryKey: ["ideaOre", oreId],
    queryFn: () => oreApi.getOre(oreId),
  });

  const projectizeMutation = useMutation({
    mutationFn: () => oreApi.projectize(oreId),
    onSuccess: (response) => setBrief(response),
  });

  const briefMarkdown = useMemo(
    () => (brief ? briefToMarkdown(brief) : ""),
    [brief],
  );

  const ore = oreQuery.data;

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <Breadcrumb
            items={[
              { label: "Web Lab", href: "/lab" },
              { label: ore?.title || "Idea Ore" },
            ]}
          />

          {oreQuery.isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 rounded bg-surface-2/60" />
              <div className="h-24 rounded-xl bg-surface-2/35" />
              <div className="h-44 rounded-xl bg-surface-2/25" />
            </div>
          ) : oreQuery.isError || !ore ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">Idea Ore not found.</p>
              <Link
                href="/vault"
                className="mt-4 rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Back to Vault
              </Link>
            </div>
          ) : (
            <>
              <PageHeader
                eyebrow="PROJECTIZE"
                title={ore.title}
                subtitle={ore.one_liner}
                meta={
                  <button
                    type="button"
                    disabled={projectizeMutation.isPending}
                    onClick={() => projectizeMutation.mutate()}
                    className={[
                      "inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
                      projectizeMutation.isPending
                        ? "cursor-wait border border-line-steel/25 bg-surface-2/40 text-text-secondary"
                        : "border border-signal-pink/40 bg-signal-pink text-white hover:bg-signal-pink/90",
                    ].join(" ")}
                  >
                    <FlaskConical className="h-4 w-4" />
                    {projectizeMutation.isPending ? "Projectizing" : "Projectize"}
                  </button>
                }
              />

              <section className="desktop-instrument-surface rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-primary">
                  Idea Ore
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {ore.short_summary}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
                      Interesting point
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {ore.interesting_point}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/55">
                      MVP hint
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {ore.mvp_hint}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {ore.selected_keywords.map((keyword) => (
                    <span
                      key={keyword.id}
                      className="inline-flex items-center rounded-full border border-line-steel/35 bg-bg-base/45 px-2.5 py-1 text-[11px] text-text-secondary"
                    >
                      {keyword.label}
                    </span>
                  ))}
                </div>
              </section>

              {projectizeMutation.isError && (
                <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {projectizeMutation.error instanceof Error
                    ? projectizeMutation.error.message
                    : "Failed to Projectize this Idea Ore."}
                </div>
              )}

              {brief && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-text-primary">
                      Project Seed Brief
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton label="Copy Brief" value={briefMarkdown} />
                      <CopyButton
                        label="Copy Vibe Prompt"
                        value={brief.vibe_coding_prompt}
                      />
                    </div>
                  </div>

                  <Section title="Product Concept">
                    <p>{brief.product_concept}</p>
                  </Section>
                  <Section title="Target User">
                    <p>{brief.target_user}</p>
                  </Section>
                  <Section title="Core Loop">
                    <ListItems items={brief.core_loop} />
                  </Section>
                  <Section title="MVP Features">
                    <ListItems items={brief.mvp_features} />
                  </Section>
                  <Section title="First Screens">
                    <ListItems items={brief.first_screens} />
                  </Section>
                  <Section title="Not To Build">
                    <ListItems items={brief.not_to_build} />
                  </Section>
                  <Section title="Data Model Hint">
                    <p>{brief.data_model_hint}</p>
                  </Section>
                  <Section title="API Hint">
                    <p>{brief.api_hint}</p>
                  </Section>
                  <Section title="Vibe Coding Prompt">
                    <p className="whitespace-pre-wrap">{brief.vibe_coding_prompt}</p>
                  </Section>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
