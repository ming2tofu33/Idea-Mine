"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronDown, ChevronUp, Copy, Loader2, Sparkles } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { GenerateAllLoading } from "@/components/lab/generate-all-loading";
import { LockedItem } from "@/components/lab/locked-item";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionCard } from "@/components/shared/section-card";
import { collectionApi, labApi, profileApi, vaultApi } from "@/lib/api";
import type { Appraisal, Blueprint, Overview, ProductDesign, Roadmap } from "@/types/api";

const LOCKED = {
  design: {
    description: "User flows, screens, priorities, and product rules.",
    tier: "lite" as const,
  },
  blueprint: {
    description: "Tech stack, data model, API surface, and structure.",
    tier: "pro" as const,
  },
  roadmap: {
    description: "Phase plan, checkpoints, and sprint sequencing.",
    tier: "pro" as const,
  },
};

function DotBar({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary/60">Collection:</span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={i < count ? "h-2.5 w-2.5 rounded-full bg-cold-cyan" : "h-2.5 w-2.5 rounded-full bg-surface-2/60"}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary/80">{count}/5</span>
    </div>
  );
}

function Item({
  number,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  number: number;
  title: string;
  badge: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="desktop-instrument-flat overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left hover:bg-surface-1/60"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2/50 text-xs font-bold text-text-secondary/70">
          {number}
        </span>
        <span className="flex-1 text-sm font-medium text-text-primary">{title}</span>
        <span className="rounded-full border border-line-steel/20 bg-surface-2/30 px-2 py-0.5 text-[10px] text-text-secondary/60">
          {badge}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-text-secondary/40" /> : <ChevronDown className="h-4 w-4 text-text-secondary/40" />}
      </button>
      {open && <div className="space-y-4 border-t border-line-steel/10 px-5 py-4">{children}</div>}
    </div>
  );
}

function GenerateButton({
  label,
  pending,
  onClick,
  disabled,
  disabledReason,
}: {
  label: string;
  pending: boolean;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-line-steel/20 bg-surface-1/15 px-5 py-4 text-xs text-text-secondary/40">
        {disabledReason}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cold-cyan/30 bg-cold-cyan/5 px-5 py-3 text-sm font-medium text-cold-cyan hover:bg-cold-cyan/10 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {pending ? "Generating..." : label}
    </button>
  );
}

function CardText({ title, content }: { title: string; content: string | undefined }) {
  return (
    <SectionCard title={title}>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{content || "-"}</p>
    </SectionCard>
  );
}

function CardList({ title, items }: { title: string; items: string[] }) {
  return (
    <SectionCard title={title}>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
        {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </SectionCard>
  );
}

function buildMarkdown(
  title: string,
  overview: Overview,
  appraisal: Appraisal,
  design: ProductDesign,
  blueprint: Blueprint,
  roadmap: Roadmap,
) {
  return `# ${title} - Project Collection

## Overview
Concept
${overview.concept}

Problem
${overview.problem}

Target user
${overview.target}

Core features
${overview.features}

Differentiator
${overview.differentiator}

Business model
${overview.revenue}

MVP scope
${overview.mvp_scope}

## Appraisal
Market fit
${appraisal.market_fit}

${appraisal.problem_fit ? `Problem fit\n${appraisal.problem_fit}\n\n` : ""}Feasibility
${appraisal.feasibility}

${appraisal.differentiation ? `Differentiation\n${appraisal.differentiation}\n\n` : ""}${appraisal.scalability ? `Scalability\n${appraisal.scalability}\n\n` : ""}Risk
${appraisal.risk}

## Product Design
User flow
${design.user_flow.join("\n")}

Screens
${design.screens.join("\n")}

Must-have features
${design.features_must.join("\n")}

Should-have features
${design.features_should.join("\n")}

Later features
${design.features_later.join("\n")}

Business model
${design.business_model}

Business rules
${design.business_rules.join("\n")}

MVP scope
${design.mvp_scope}

## Blueprint
Tech stack
${blueprint.tech_stack.join("\n")}

Data model
${blueprint.data_model_sql}

API endpoints
${blueprint.api_endpoints.join("\n")}

File structure
${blueprint.file_structure}

External services
${blueprint.external_services.join("\n")}

Auth flow
${blueprint.auth_flow.join("\n")}

## Roadmap
Phase 0 - foundation
${roadmap.phase_0.join("\n")}

Phase 1 - core product
${roadmap.phase_1.join("\n")}

Phase 2 - expansion
${roadmap.phase_2.join("\n")}

Validation checkpoints
${roadmap.validation_checkpoints.join("\n")}

Estimated complexity
${roadmap.estimated_complexity}

First sprint tasks
${roadmap.first_sprint_tasks.join("\n")}
`;
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = use(params);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  const toggle = (n: number) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    return next;
  });

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: profileApi.getProfile });
  const ideaQuery = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
    select: (ideas) => ideas.find((idea) => idea.id === ideaId),
  });
  const overviewsQuery = useQuery({
    queryKey: ["overviews", ideaId],
    queryFn: () => vaultApi.getOverviewsByIdea(ideaId),
    enabled: !!ideaId,
  });

  const overview = overviewsQuery.data?.[0];
  const appraisalsQuery = useQuery({
    queryKey: ["appraisals", overview?.id],
    queryFn: () => labApi.getAppraisalsByOverview(overview!.id),
    enabled: !!overview,
  });
  const appraisal = appraisalsQuery.data?.[0];

  const designsQuery = useQuery({
    queryKey: ["designs", overview?.id],
    queryFn: () => collectionApi.getDesignsByOverview(overview!.id),
    enabled: !!overview,
  });
  const design = designsQuery.data?.[0];

  const blueprintsQuery = useQuery({
    queryKey: ["blueprints", design?.id],
    queryFn: () => collectionApi.getBlueprintsByDesign(design!.id),
    enabled: !!design,
  });
  const blueprint = blueprintsQuery.data?.[0];

  const roadmapsQuery = useQuery({
    queryKey: ["roadmaps", blueprint?.id],
    queryFn: () => collectionApi.getRoadmapsByBlueprint(blueprint!.id),
    enabled: !!blueprint,
  });
  const roadmap = roadmapsQuery.data?.[0];

  const profile = profileQuery.data;
  const idea = ideaQuery.data;
  const tier = profile?.persona_tier ?? profile?.tier ?? "free";
  const isAdmin = profile?.role === "admin";
  const canDesign = tier === "lite" || tier === "pro" || isAdmin;
  const canBlueprint = tier === "pro" || isAdmin;
  const canRoadmap = tier === "pro" || isAdmin;

  const count = [overview, appraisal, design, blueprint, roadmap].filter(Boolean).length;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["overviews", ideaId] });
    queryClient.invalidateQueries({ queryKey: ["appraisals"] });
    queryClient.invalidateQueries({ queryKey: ["designs"] });
    queryClient.invalidateQueries({ queryKey: ["blueprints"] });
    queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
  };

  const appraisalMutation = useMutation({
    mutationFn: () => labApi.createAppraisal(overview!.id),
    onSuccess: refresh,
  });
  const designMutation = useMutation({
    mutationFn: () => collectionApi.createDesign(overview!.id),
    onSuccess: refresh,
  });
  const blueprintMutation = useMutation({
    mutationFn: () => collectionApi.createBlueprint(design!.id),
    onSuccess: refresh,
  });
  const roadmapMutation = useMutation({
    mutationFn: () => collectionApi.createRoadmap(blueprint!.id),
    onSuccess: refresh,
  });
  const generateAllMutation = useMutation({
    mutationFn: () => collectionApi.generateAll(overview!.id),
    onSuccess: refresh,
  });

  const copyAll = async () => {
    if (!(idea && overview && appraisal && design && blueprint && roadmap)) return;
    await navigator.clipboard.writeText(buildMarkdown(idea.title, overview, appraisal, design, blueprint, roadmap));
  };

  const isLoading = ideaQuery.isLoading || overviewsQuery.isLoading;

  if (generateAllMutation.isPending) {
    return (
      <div className="relative flex min-h-0 flex-1">
        <LabBackground />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <GenerateAllLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <Breadcrumb
            items={[
              { label: "Lab", href: "/lab" },
              { label: "Collection" },
              ...(idea ? [{ label: idea.title }] : []),
            ]}
          />

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-2/3 rounded bg-surface-2/60" />
              <div className="h-4 w-full rounded bg-surface-2/40" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-surface-2/30" />)}
              </div>
            </div>
          ) : !idea ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">Idea not found.</p>
              <Link href="/lab" className="mt-4 cursor-pointer rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary">
                Back to lab
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-text-primary">{idea.title}</h2>
                <div className="mt-2"><DotBar count={count} /></div>
              </div>

              {!overview ? (
                <div className="desktop-instrument-flat rounded-xl border-dashed p-8 text-center">
                  <p className="mb-4 text-sm text-text-secondary">Generate an overview first to unlock the collection.</p>
                  <Link href={`/lab/overview/${ideaId}`} className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-6 py-3 text-sm font-medium text-cold-cyan hover:bg-cold-cyan/20">
                    Go to overview
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Item number={1} title="Overview" badge="Done" open={open.has(1)} onToggle={() => toggle(1)}>
                    <CardText title="Concept" content={overview.concept} />
                    <CardText title="Problem" content={overview.problem} />
                    <CardText title="Target user" content={overview.target} />
                    <CardText title="Core features" content={overview.features} />
                    <CardText title="Differentiator" content={overview.differentiator} />
                    <CardText title="Business model" content={overview.revenue} />
                    <CardText title="MVP scope" content={overview.mvp_scope} />
                  </Item>

                  {appraisal ? (
                    <Item number={2} title="Appraisal" badge="Done" open={open.has(2)} onToggle={() => toggle(2)}>
                      <CardText title="Market fit" content={appraisal.market_fit} />
                      {appraisal.problem_fit && <CardText title="Problem fit" content={appraisal.problem_fit} />}
                      <CardText title="Feasibility" content={appraisal.feasibility} />
                      {appraisal.differentiation && <CardText title="Differentiation" content={appraisal.differentiation} />}
                      {appraisal.scalability && <CardText title="Scalability" content={appraisal.scalability} />}
                      <CardText title="Risk" content={appraisal.risk} />
                    </Item>
                  ) : (
                    <GenerateButton label="Generate appraisal" pending={appraisalMutation.isPending} onClick={() => appraisalMutation.mutate()} />
                  )}

                  {!canDesign ? (
                    <LockedItem number={3} title="Product design" description={LOCKED.design.description} requiredTier={LOCKED.design.tier} />
                  ) : design ? (
                    <Item number={3} title="Product design" badge="Done" open={open.has(3)} onToggle={() => toggle(3)}>
                      <CardList title="User flow" items={design.user_flow} />
                      <CardList title="Screens" items={design.screens} />
                      <CardList title="Must-have features" items={design.features_must} />
                      <CardList title="Should-have features" items={design.features_should} />
                      <CardList title="Later features" items={design.features_later} />
                      <CardText title="Business model" content={design.business_model} />
                      <CardList title="Business rules" items={design.business_rules} />
                      <CardText title="MVP scope" content={design.mvp_scope} />
                    </Item>
                  ) : (
                    <GenerateButton label="Generate product design" pending={designMutation.isPending} onClick={() => designMutation.mutate()} disabled={!overview} disabledReason="Overview is required first." />
                  )}

                  {!canBlueprint ? (
                    <LockedItem number={4} title="Blueprint" description={LOCKED.blueprint.description} requiredTier={LOCKED.blueprint.tier} />
                  ) : blueprint ? (
                    <Item number={4} title="Blueprint" badge="Done" open={open.has(4)} onToggle={() => toggle(4)}>
                      <CardList title="Tech stack" items={blueprint.tech_stack} />
                      <CardText title="Data model" content={blueprint.data_model_sql} />
                      <CardList title="API endpoints" items={blueprint.api_endpoints} />
                      <CardText title="File structure" content={blueprint.file_structure} />
                      <CardList title="External services" items={blueprint.external_services} />
                      <CardList title="Auth flow" items={blueprint.auth_flow} />
                    </Item>
                  ) : (
                    <GenerateButton label="Generate blueprint" pending={blueprintMutation.isPending} onClick={() => blueprintMutation.mutate()} disabled={!design} disabledReason="Product design is required first." />
                  )}

                  {!canRoadmap ? (
                    <LockedItem number={5} title="Roadmap" description={LOCKED.roadmap.description} requiredTier={LOCKED.roadmap.tier} />
                  ) : roadmap ? (
                    <Item number={5} title="Roadmap" badge="Done" open={open.has(5)} onToggle={() => toggle(5)}>
                      <CardList title="Phase 0 - foundation" items={roadmap.phase_0} />
                      <CardList title="Phase 1 - core product" items={roadmap.phase_1} />
                      <CardList title="Phase 2 - expansion" items={roadmap.phase_2} />
                      <CardList title="Validation checkpoints" items={roadmap.validation_checkpoints} />
                      <CardText title="Estimated complexity" content={roadmap.estimated_complexity} />
                      <CardList title="First sprint tasks" items={roadmap.first_sprint_tasks} />
                    </Item>
                  ) : (
                    <GenerateButton label="Generate roadmap" pending={roadmapMutation.isPending} onClick={() => roadmapMutation.mutate()} disabled={!blueprint} disabledReason="Blueprint is required first." />
                  )}
                </div>
              )}

              {overview && (
                <div className="flex flex-wrap items-center gap-3 border-t border-line-steel/15 pt-6">
                  {(tier === "pro" || isAdmin) && count < 5 && (
                    <button
                      type="button"
                      onClick={() => generateAllMutation.mutate()}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-signal-pink/30 bg-signal-pink/5 px-5 py-3 text-sm font-medium text-signal-pink hover:bg-signal-pink/10"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate the rest
                    </button>
                  )}

                  {count === 5 && idea && overview && appraisal && design && blueprint && roadmap && (
                    <button
                      type="button"
                      onClick={copyAll}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-line-steel/30 bg-surface-1/40 px-5 py-3 text-sm font-medium text-text-secondary hover:border-cold-cyan/20 hover:text-text-primary"
                    >
                      <Copy className="h-4 w-4" />
                      Copy collection
                    </button>
                  )}

                  {(appraisalMutation.isError || designMutation.isError || blueprintMutation.isError || roadmapMutation.isError || generateAllMutation.isError) && (
                    <p className="text-xs text-red-400">
                      A generation step failed. Retry the specific document.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
