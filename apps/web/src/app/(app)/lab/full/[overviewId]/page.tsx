"use client";

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
import { SectionCard } from "@/components/shared/section-card";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { labApi } from "@/lib/api";
import type { FullOverview } from "@/types/api";

const LOADING_MESSAGES = [
  "Reading product structure",
  "Drafting the technical shape",
  "Assembling the full document",
];

function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timers = LOADING_MESSAGES.slice(1).map((_, i) =>
      setTimeout(() => setIndex(i + 1), (i + 1) * 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const progress = ((index + 1) / LOADING_MESSAGES.length) * 100;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-6 h-1 w-48 overflow-hidden rounded-full bg-surface-2/60">
        <div
          className="h-full rounded-full bg-cold-cyan/60 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-text-secondary">{LOADING_MESSAGES[index]}</p>
      <p className="mt-2 text-[11px] text-text-secondary/40">
        {index + 1} / {LOADING_MESSAGES.length}
      </p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line-steel/30 bg-surface-1/40 px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-cold-cyan/20 hover:text-text-primary"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy markdown"}
    </button>
  );
}

function TextCard({ title, content }: { title: string; content: string }) {
  return (
    <SectionCard title={title}>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{content}</p>
    </SectionCard>
  );
}

function ListCard({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  return (
    <SectionCard title={title}>
      {ordered ? (
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
        </ol>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
        </ul>
      )}
    </SectionCard>
  );
}

function CodeCard({ title, content }: { title: string; content: string }) {
  return (
    <SectionCard title={title}>
      <pre className="overflow-x-auto rounded-md bg-bg-deep/80 p-3 font-mono text-xs text-text-secondary">
        {content}
      </pre>
    </SectionCard>
  );
}

function buildMarkdown(data: FullOverview) {
  return `# Full Overview

## Narrative
### Concept
${data.concept}

### Problem
${data.problem}

### Target user
${data.target_user}

### Must-have features
${data.features_must.map((item) => `- ${item}`).join("\n")}

### Should-have features
${data.features_should.map((item) => `- ${item}`).join("\n")}

### Later features
${data.features_later.map((item) => `- ${item}`).join("\n")}

### User flow
${data.user_flow.map((item, index) => `${index + 1}. ${item}`).join("\n")}

### Screens
${data.screens.map((item) => `- ${item}`).join("\n")}

### Business model
${data.business_model}

### Business rules
${data.business_rules.map((item) => `- ${item}`).join("\n")}

### MVP scope
${data.mvp_scope}

## Tech
### Tech stack
${Object.entries(data.tech_stack).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

### Data model
\`\`\`sql
${data.data_model_sql}
\`\`\`

### API endpoints
${data.api_endpoints.map((item) => `- ${item}`).join("\n")}

### File structure
\`\`\`
${data.file_structure}
\`\`\`

### External services
${data.external_services.map((item) => `- ${item}`).join("\n")}

### Auth flow
${data.auth_flow.map((item, index) => `${index + 1}. ${item}`).join("\n")}
`;
}

function FullOverviewView({ data }: { data: FullOverview }) {
  return (
    <div className="space-y-6">
      <TextCard title="Concept" content={data.concept} />
      <TextCard title="Problem" content={data.problem} />
      <TextCard title="Target user" content={data.target_user} />
      <ListCard title="Must-have features" items={data.features_must} />
      <ListCard title="Should-have features" items={data.features_should} />
      <ListCard title="Later features" items={data.features_later} />
      <ListCard title="User flow" items={data.user_flow} ordered />
      <ListCard title="Screens" items={data.screens} />
      <TextCard title="Business model" content={data.business_model} />
      <ListCard title="Business rules" items={data.business_rules} />
      <TextCard title="MVP scope" content={data.mvp_scope} />
      <ListCard title="Tech stack" items={Object.entries(data.tech_stack).map(([key, value]) => `${key}: ${value}`)} />
      <CodeCard title="Data model" content={data.data_model_sql} />
      <ListCard title="API endpoints" items={data.api_endpoints} />
      <CodeCard title="File structure" content={data.file_structure} />
      <ListCard title="External services" items={data.external_services} />
      <ListCard title="Auth flow" items={data.auth_flow} ordered />
    </div>
  );
}

function OlderVersion({
  data,
  onDelete,
  pending,
}: {
  data: FullOverview;
  onDelete: (id: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="desktop-instrument-flat rounded-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span>{new Date(data.created_at).toLocaleDateString("en-US")}</span>
          <span className="text-xs text-text-secondary/40">{open ? "Collapse" : "Expand"}</span>
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Delete version?</span>
            <button
              type="button"
              onClick={() => onDelete(data.id)}
              disabled={pending}
              className="cursor-pointer rounded px-2 py-1 text-xs text-red-400 hover:bg-red-400/10"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="cursor-pointer rounded px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="cursor-pointer rounded p-1.5 text-text-secondary/30 hover:bg-red-400/10 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-line-steel/10 px-4 py-4">
          <FullOverviewView data={data} />
        </div>
      )}
    </div>
  );
}

export default function FullOverviewPage({
  params,
}: {
  params: Promise<{ overviewId: string }>;
}) {
  const { overviewId } = use(params);
  const queryClient = useQueryClient();

  const fullOverviewsQuery = useQuery({
    queryKey: ["fullOverviews", overviewId],
    queryFn: () => labApi.getFullOverviewsByOverview(overviewId),
    enabled: !!overviewId,
  });

  const createMutation = useMutation({
    mutationFn: () => labApi.createFullOverview(overviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fullOverviews", overviewId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fullOverviewId: string) => labApi.deleteFullOverview(fullOverviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fullOverviews", overviewId] });
    },
  });

  const versions = fullOverviewsQuery.data ?? [];
  const latest = versions[0] ?? null;
  const previous = versions.slice(1);

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <Breadcrumb items={[{ label: "Lab", href: "/lab" }, { label: "Full overview" }]} />

          {fullOverviewsQuery.isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-2/3 rounded bg-surface-2/60" />
              <div className="h-4 w-full rounded bg-surface-2/40" />
              <div className="h-32 rounded bg-surface-2/30" />
            </div>
          ) : createMutation.isPending ? (
            <LoadingState />
          ) : createMutation.isError ? (
            <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-center">
              <p className="text-sm text-red-400">Failed to generate the full overview.</p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {createMutation.error instanceof Error ? createMutation.error.message : "Unknown error"}
              </p>
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                className="mt-3 cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan hover:bg-cold-cyan/20"
              >
                Retry
              </button>
            </div>
          ) : latest ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <CopyButton text={buildMarkdown(latest)} />
                <ConfirmCostDialog
                  action="overview"
                  onConfirm={() => createMutation.mutate()}
                  isLoading={createMutation.isPending}
                  label="Regenerate"
                  message="Generate a fresh full overview document?"
                />
              </div>
              <FullOverviewView data={latest} />

              {previous.length > 0 && (
                <div className="space-y-3 border-t border-line-steel/15 pt-6">
                  <p className="text-sm font-medium text-text-secondary/60">
                    Previous versions ({previous.length})
                  </p>
                  {previous.map((item) => (
                    <OlderVersion
                      key={item.id}
                      data={item}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      pending={deleteMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center backdrop-blur-sm">
              <p className="mb-4 text-sm text-text-secondary">
                Generate the full overview to combine the narrative and technical plan.
              </p>
              <ConfirmCostDialog
                action="overview"
                onConfirm={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                label="Generate full overview"
                message="Generate a full overview for this overview document?"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
