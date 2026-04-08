"use client";

import { use, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Copy,
  Sparkles,
} from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionCard } from "@/components/shared/section-card";
import { LockedItem } from "@/components/lab/locked-item";
import { GenerateAllLoading } from "@/components/lab/generate-all-loading";
import { vaultApi, labApi, collectionApi, profileApi } from "@/lib/api";
import type {
  Overview,
  Appraisal,
  ProductDesign,
  Blueprint,
  Roadmap,
  UserProfile,
} from "@/types/api";

// ─── Locked item metadata ───

const LOCKED_DESCRIPTIONS: Record<string, { description: string; tier: "lite" | "pro" }> = {
  design: {
    description: "사용자 흐름, 화면 목록, 기능 우선순위, 비즈니스 규칙 — 뭘 만들지 정하는 문서",
    tier: "lite",
  },
  blueprint: {
    description: "기술 스택, DB 설계, API 엔드포인트, 파일 구조 — 어떻게 만들지 설계하는 문서",
    tier: "pro",
  },
  roadmap: {
    description: "Phase별 Sprint 계획, 검증 포인트 — 뭐부터 만들지 계획하는 문서",
    tier: "pro",
  },
};

// ─── CompletionBar ───

function CompletionBar({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-secondary/60">컬렉션 완성도:</span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={[
              "h-2.5 w-2.5 rounded-full",
              i < count ? "bg-cold-cyan shadow-[0_0_6px_rgba(92,205,229,0.4)]" : "bg-surface-2/60",
            ].join(" ")}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-text-secondary/80">{count}/5</span>
    </div>
  );
}

// ─── CollectionItem ───

function CollectionItem({
  number,
  title,
  badge,
  isComplete,
  isExpanded,
  onToggle,
  children,
}: {
  number: number;
  title: string;
  badge: string;
  isComplete: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "overflow-hidden rounded-xl border bg-surface-1/40 transition-colors duration-200",
        isComplete
          ? "border-l-2 border-l-cold-cyan/40 border-t-line-steel/20 border-r-line-steel/20 border-b-line-steel/20"
          : "border-line-steel/20",
      ].join(" ")}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-surface-1/60"
      >
        {/* Number */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2/50 text-xs font-bold text-text-secondary/70">
          {number}
        </span>

        {/* Title */}
        <span className="flex-1 text-sm font-medium text-text-primary">
          {title}
        </span>

        {/* Badge */}
        <span
          className={[
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            isComplete
              ? "border-cold-cyan/30 bg-cold-cyan/10 text-cold-cyan"
              : "border-line-steel/20 bg-surface-2/30 text-text-secondary/50",
          ].join(" ")}
        >
          {badge}
        </span>

        {/* Chevron */}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-text-secondary/40" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-text-secondary/40" />
        )}
      </button>

      {/* Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-line-steel/10 px-5 py-4 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── GenerateButton ───

function GenerateButton({
  label,
  onGenerate,
  isPending,
  disabled,
  disabledReason,
}: {
  label: string;
  onGenerate: () => void;
  isPending: boolean;
  disabled?: boolean;
  disabledReason?: string;
}) {
  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-line-steel/20 bg-surface-1/15 px-5 py-4">
        <p className="text-xs text-text-secondary/40">{disabledReason}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={isPending}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cold-cyan/30 bg-cold-cyan/5 px-5 py-3 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          생성 중...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}

// ─── Document content renderers ───

function OverviewContent({ overview }: { overview: Overview }) {
  const sections = [
    { title: "컨셉", content: overview.concept_ko },
    { title: "문제 정의", content: overview.problem_ko },
    { title: "타깃 사용자", content: overview.target_ko },
    { title: "핵심 기능", content: overview.features_ko },
    { title: "차별점", content: overview.differentiator_ko },
    { title: "수익 모델", content: overview.revenue_ko },
    { title: "MVP 범위", content: overview.mvp_scope_ko },
  ];

  return (
    <>
      {sections.map((s) => (
        <SectionCard key={s.title} title={s.title}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {s.content}
          </p>
        </SectionCard>
      ))}
    </>
  );
}

function AppraisalContent({ appraisal }: { appraisal: Appraisal }) {
  const dimensions = [
    { title: "시장 적합성", content: appraisal.market_fit_ko },
    ...(appraisal.problem_fit_ko ? [{ title: "문제 적합성", content: appraisal.problem_fit_ko }] : []),
    { title: "실현 가능성", content: appraisal.feasibility_ko },
    ...(appraisal.differentiation_ko ? [{ title: "차별화", content: appraisal.differentiation_ko }] : []),
    ...(appraisal.scalability_ko ? [{ title: "확장성", content: appraisal.scalability_ko }] : []),
    { title: "리스크", content: appraisal.risk_ko },
  ];

  return (
    <>
      {dimensions.map((d) => (
        <SectionCard key={d.title} title={d.title}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {d.content}
          </p>
        </SectionCard>
      ))}
    </>
  );
}

function DesignContent({ design }: { design: ProductDesign }) {
  return (
    <>
      <SectionCard title="사용자 흐름">
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {design.user_flow.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </SectionCard>
      <SectionCard title="화면 목록">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {design.screens.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Must 기능">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {design.features_must.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Should 기능">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {design.features_should.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Later 기능">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {design.features_later.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="비즈니스 모델">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          {design.business_model}
        </p>
      </SectionCard>
      <SectionCard title="비즈니스 규칙">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {design.business_rules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="MVP 범위">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          {design.mvp_scope}
        </p>
      </SectionCard>
    </>
  );
}

function BlueprintContent({ blueprint }: { blueprint: Blueprint }) {
  return (
    <>
      <SectionCard title="기술 스택">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {blueprint.tech_stack.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="데이터 모델">
        <pre className="overflow-x-auto rounded-lg bg-bg-deep/60 p-4 text-xs leading-relaxed text-text-secondary font-mono">
          {blueprint.data_model_sql}
        </pre>
      </SectionCard>
      <SectionCard title="API 엔드포인트">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {blueprint.api_endpoints.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="파일 구조">
        <pre className="overflow-x-auto rounded-lg bg-bg-deep/60 p-4 text-xs leading-relaxed text-text-secondary font-mono">
          {blueprint.file_structure}
        </pre>
      </SectionCard>
      <SectionCard title="외부 서비스">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {blueprint.external_services.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="인증 흐름">
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {blueprint.auth_flow.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ol>
      </SectionCard>
    </>
  );
}

function RoadmapContent({ roadmap }: { roadmap: Roadmap }) {
  return (
    <>
      <SectionCard title="Phase 0 — 기반 구축">
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {roadmap.phase_0.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </SectionCard>
      <SectionCard title="Phase 1 — 핵심 기능">
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {roadmap.phase_1.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </SectionCard>
      <SectionCard title="Phase 2 — 확장">
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {roadmap.phase_2.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </SectionCard>
      <SectionCard title="검증 포인트">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {roadmap.validation_checkpoints.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="예상 복잡도">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          {roadmap.estimated_complexity}
        </p>
      </SectionCard>
      <SectionCard title="첫 번째 스프린트 태스크">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-text-secondary">
          {roadmap.first_sprint_tasks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}

// ─── CopyAllButton ───

function CopyAllButton({
  overview,
  appraisal,
  design,
  blueprint,
  roadmap,
  ideaTitle,
}: {
  overview: Overview;
  appraisal: Appraisal;
  design: ProductDesign;
  blueprint: Blueprint;
  roadmap: Roadmap;
  ideaTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const md = formatAllAsMarkdown(ideaTitle, overview, appraisal, design, blueprint, roadmap);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [ideaTitle, overview, appraisal, design, blueprint, roadmap]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-line-steel/30 bg-surface-1/40 px-5 py-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:border-cold-cyan/20 hover:text-text-primary"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400">복사됨!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          전체 복사
        </>
      )}
    </button>
  );
}

function formatAllAsMarkdown(
  title: string,
  overview: Overview,
  appraisal: Appraisal,
  design: ProductDesign,
  blueprint: Blueprint,
  roadmap: Roadmap,
): string {
  return `# ${title} — 프로젝트 컬렉션

## 1. 개요서

### 컨셉
${overview.concept_ko}

### 문제 정의
${overview.problem_ko}

### 타깃 사용자
${overview.target_ko}

### 핵심 기능
${overview.features_ko}

### 차별점
${overview.differentiator_ko}

### 수익 모델
${overview.revenue_ko}

### MVP 범위
${overview.mvp_scope_ko}

## 2. 감정서

### 시장 적합성
${appraisal.market_fit_ko}

${appraisal.problem_fit_ko ? `### 문제 적합성\n${appraisal.problem_fit_ko}\n` : ""}### 실현 가능성
${appraisal.feasibility_ko}

${appraisal.differentiation_ko ? `### 차별화\n${appraisal.differentiation_ko}\n` : ""}${appraisal.scalability_ko ? `### 확장성\n${appraisal.scalability_ko}\n` : ""}### 리스크
${appraisal.risk_ko}

## 3. 제품 설계서

### 사용자 흐름
${design.user_flow.map((s, i) => `${i + 1}. ${s}`).join("\n")}

### 화면 목록
${design.screens.map((s) => `- ${s}`).join("\n")}

### Must 기능
${design.features_must.map((f) => `- ${f}`).join("\n")}

### Should 기능
${design.features_should.map((f) => `- ${f}`).join("\n")}

### Later 기능
${design.features_later.map((f) => `- ${f}`).join("\n")}

### 비즈니스 모델
${design.business_model}

### 비즈니스 규칙
${design.business_rules.map((r) => `- ${r}`).join("\n")}

### MVP 범위
${design.mvp_scope}

## 4. 기술 청사진

### 기술 스택
${blueprint.tech_stack.map((t) => `- ${t}`).join("\n")}

### 데이터 모델
\`\`\`sql
${blueprint.data_model_sql}
\`\`\`

### API 엔드포인트
${blueprint.api_endpoints.map((e) => `- ${e}`).join("\n")}

### 파일 구조
\`\`\`
${blueprint.file_structure}
\`\`\`

### 외부 서비스
${blueprint.external_services.map((s) => `- ${s}`).join("\n")}

### 인증 흐름
${blueprint.auth_flow.map((a, i) => `${i + 1}. ${a}`).join("\n")}

## 5. 실행 로드맵

### Phase 0 — 기반 구축
${roadmap.phase_0.map((t, i) => `${i + 1}. ${t}`).join("\n")}

### Phase 1 — 핵심 기능
${roadmap.phase_1.map((t, i) => `${i + 1}. ${t}`).join("\n")}

### Phase 2 — 확장
${roadmap.phase_2.map((t, i) => `${i + 1}. ${t}`).join("\n")}

### 검증 포인트
${roadmap.validation_checkpoints.map((c) => `- ${c}`).join("\n")}

### 예상 복잡도
${roadmap.estimated_complexity}

### 첫 번째 스프린트 태스크
${roadmap.first_sprint_tasks.map((t) => `- ${t}`).join("\n")}
`;
}

// ─── Page ───

export default function CollectionPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = use(params);
  const queryClient = useQueryClient();

  // Expanded state — track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (num: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  // ── Data loading ──

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
  });

  const ideaQuery = useQuery({
    queryKey: ["vaultedIdeas"],
    queryFn: vaultApi.getVaultedIdeas,
    select: (ideas) => ideas.find((i) => i.id === ideaId),
  });

  const overviewsQuery = useQuery({
    queryKey: ["overviews", ideaId],
    queryFn: () => vaultApi.getOverviewsByIdea(ideaId),
    enabled: !!ideaId,
  });

  const latestOverview = overviewsQuery.data?.[0];

  const appraisalsQuery = useQuery({
    queryKey: ["appraisals", latestOverview?.id],
    queryFn: () => labApi.getAppraisalsByOverview(latestOverview!.id),
    enabled: !!latestOverview,
  });

  const designsQuery = useQuery({
    queryKey: ["designs", latestOverview?.id],
    queryFn: () => collectionApi.getDesignsByOverview(latestOverview!.id),
    enabled: !!latestOverview,
  });

  const latestDesign = designsQuery.data?.[0];

  const blueprintsQuery = useQuery({
    queryKey: ["blueprints", latestDesign?.id],
    queryFn: () => collectionApi.getBlueprintsByDesign(latestDesign!.id),
    enabled: !!latestDesign,
  });

  const latestBlueprint = blueprintsQuery.data?.[0];

  const roadmapsQuery = useQuery({
    queryKey: ["roadmaps", latestBlueprint?.id],
    queryFn: () => collectionApi.getRoadmapsByBlueprint(latestBlueprint!.id),
    enabled: !!latestBlueprint,
  });

  // ── Derived data ──

  const idea = ideaQuery.data;
  const profile = profileQuery.data;
  const latestAppraisal = appraisalsQuery.data?.[0];
  const latestRoadmap = roadmapsQuery.data?.[0];

  const hasOverview = !!latestOverview;
  const hasAppraisal = !!latestAppraisal;
  const hasDesign = !!latestDesign;
  const hasBlueprint = !!latestBlueprint;
  const hasRoadmap = !!latestRoadmap;

  const completionCount =
    (hasOverview ? 1 : 0) +
    (hasAppraisal ? 1 : 0) +
    (hasDesign ? 1 : 0) +
    (hasBlueprint ? 1 : 0) +
    (hasRoadmap ? 1 : 0);

  const effectiveTier = profile?.persona_tier ?? profile?.tier ?? "free";
  const canAccessDesign = effectiveTier === "lite" || effectiveTier === "pro" || profile?.role === "admin";
  const canAccessBlueprint = effectiveTier === "pro" || profile?.role === "admin";
  const canAccessRoadmap = effectiveTier === "pro" || profile?.role === "admin";
  const isProOrAdmin = effectiveTier === "pro" || profile?.role === "admin";

  // ── Mutations ──

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["overviews", ideaId] });
    queryClient.invalidateQueries({ queryKey: ["appraisals"] });
    queryClient.invalidateQueries({ queryKey: ["designs"] });
    queryClient.invalidateQueries({ queryKey: ["blueprints"] });
    queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
  };

  const appraisalMutation = useMutation({
    mutationFn: () => labApi.createAppraisal(latestOverview!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisals", latestOverview?.id] });
    },
  });

  const designMutation = useMutation({
    mutationFn: () => collectionApi.createDesign(latestOverview!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designs", latestOverview?.id] });
    },
  });

  const blueprintMutation = useMutation({
    mutationFn: () => collectionApi.createBlueprint(latestDesign!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blueprints", latestDesign?.id] });
    },
  });

  const roadmapMutation = useMutation({
    mutationFn: () => collectionApi.createRoadmap(latestBlueprint!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps", latestBlueprint?.id] });
    },
  });

  const generateAllMutation = useMutation({
    mutationFn: () => collectionApi.generateAll(latestOverview!.id),
    onSuccess: () => invalidateAll(),
  });

  // ── Loading state ──

  const isLoading = ideaQuery.isLoading || overviewsQuery.isLoading;

  // ── Generate all loading ──

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
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Lab", href: "/lab" },
              { label: "컬렉션" },
              ...(idea ? [{ label: idea.title_ko }] : []),
            ]}
          />

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-2/3 rounded bg-surface-2/60" />
              <div className="h-4 w-full rounded bg-surface-2/40" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-surface-2/30" />
                ))}
              </div>
            </div>
          ) : !idea ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-text-secondary">
                아이디어를 찾을 수 없습니다
              </p>
              <Link
                href="/lab"
                className="mt-4 cursor-pointer rounded-lg border border-line-steel bg-surface-2 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                Lab으로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              {/* Title + completion */}
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {idea.title_ko}
                </h2>
                <div className="mt-2">
                  <CompletionBar count={completionCount} />
                </div>
              </div>

              {/* No overview — prompt to create */}
              {!hasOverview ? (
                <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center">
                  <p className="mb-4 text-sm text-text-secondary">
                    먼저 개요를 생성하세요
                  </p>
                  <Link
                    href={`/lab/overview/${ideaId}`}
                    className="cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-6 py-3 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
                  >
                    개요 생성하러 가기
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 1. Overview */}
                  <CollectionItem
                    number={1}
                    title="개요서"
                    badge={hasOverview ? "완료" : "생성 필요"}
                    isComplete={hasOverview}
                    isExpanded={expandedItems.has(1)}
                    onToggle={() => toggleItem(1)}
                  >
                    <OverviewContent overview={latestOverview!} />
                  </CollectionItem>

                  {/* 2. Appraisal */}
                  {hasAppraisal ? (
                    <CollectionItem
                      number={2}
                      title="감정서"
                      badge="완료"
                      isComplete
                      isExpanded={expandedItems.has(2)}
                      onToggle={() => toggleItem(2)}
                    >
                      <AppraisalContent appraisal={latestAppraisal!} />
                    </CollectionItem>
                  ) : (
                    <div className="rounded-xl border border-line-steel/20 bg-surface-1/40 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2/50 text-xs font-bold text-text-secondary/70">
                          2
                        </span>
                        <span className="text-sm font-medium text-text-primary">감정서</span>
                        <span className="rounded-full border border-line-steel/20 bg-surface-2/30 px-2 py-0.5 text-[10px] font-medium text-text-secondary/50">
                          생성 필요
                        </span>
                      </div>
                      <GenerateButton
                        label="감정 요청"
                        onGenerate={() => appraisalMutation.mutate()}
                        isPending={appraisalMutation.isPending}
                      />
                      {appraisalMutation.isError && (
                        <p className="mt-2 text-xs text-red-400">
                          {appraisalMutation.error instanceof Error
                            ? appraisalMutation.error.message
                            : "감정 생성에 실패했습니다"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3. Product Design */}
                  {!canAccessDesign ? (
                    <LockedItem
                      number={3}
                      title="제품 설계서"
                      description={LOCKED_DESCRIPTIONS.design.description}
                      requiredTier={LOCKED_DESCRIPTIONS.design.tier}
                    />
                  ) : hasDesign ? (
                    <CollectionItem
                      number={3}
                      title="제품 설계서"
                      badge="완료"
                      isComplete
                      isExpanded={expandedItems.has(3)}
                      onToggle={() => toggleItem(3)}
                    >
                      <DesignContent design={latestDesign!} />
                    </CollectionItem>
                  ) : (
                    <div className="rounded-xl border border-line-steel/20 bg-surface-1/40 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2/50 text-xs font-bold text-text-secondary/70">
                          3
                        </span>
                        <span className="text-sm font-medium text-text-primary">제품 설계서</span>
                        <span className="rounded-full border border-line-steel/20 bg-surface-2/30 px-2 py-0.5 text-[10px] font-medium text-text-secondary/50">
                          생성 필요
                        </span>
                      </div>
                      <GenerateButton
                        label="제품 설계서 생성"
                        onGenerate={() => designMutation.mutate()}
                        isPending={designMutation.isPending}
                        disabled={!hasOverview}
                        disabledReason="개요서가 필요합니다"
                      />
                      {designMutation.isError && (
                        <p className="mt-2 text-xs text-red-400">
                          {designMutation.error instanceof Error
                            ? designMutation.error.message
                            : "설계서 생성에 실패했습니다"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 4. Blueprint */}
                  {!canAccessBlueprint ? (
                    <LockedItem
                      number={4}
                      title="기술 청사진"
                      description={LOCKED_DESCRIPTIONS.blueprint.description}
                      requiredTier={LOCKED_DESCRIPTIONS.blueprint.tier}
                    />
                  ) : hasBlueprint ? (
                    <CollectionItem
                      number={4}
                      title="기술 청사진"
                      badge="완료"
                      isComplete
                      isExpanded={expandedItems.has(4)}
                      onToggle={() => toggleItem(4)}
                    >
                      <BlueprintContent blueprint={latestBlueprint!} />
                    </CollectionItem>
                  ) : (
                    <div className="rounded-xl border border-line-steel/20 bg-surface-1/40 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2/50 text-xs font-bold text-text-secondary/70">
                          4
                        </span>
                        <span className="text-sm font-medium text-text-primary">기술 청사진</span>
                        <span className="rounded-full border border-line-steel/20 bg-surface-2/30 px-2 py-0.5 text-[10px] font-medium text-text-secondary/50">
                          생성 필요
                        </span>
                      </div>
                      <GenerateButton
                        label="기술 청사진 생성"
                        onGenerate={() => blueprintMutation.mutate()}
                        isPending={blueprintMutation.isPending}
                        disabled={!hasDesign}
                        disabledReason="제품 설계서가 먼저 필요합니다"
                      />
                      {blueprintMutation.isError && (
                        <p className="mt-2 text-xs text-red-400">
                          {blueprintMutation.error instanceof Error
                            ? blueprintMutation.error.message
                            : "청사진 생성에 실패했습니다"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 5. Roadmap */}
                  {!canAccessRoadmap ? (
                    <LockedItem
                      number={5}
                      title="실행 로드맵"
                      description={LOCKED_DESCRIPTIONS.roadmap.description}
                      requiredTier={LOCKED_DESCRIPTIONS.roadmap.tier}
                    />
                  ) : hasRoadmap ? (
                    <CollectionItem
                      number={5}
                      title="실행 로드맵"
                      badge="완료"
                      isComplete
                      isExpanded={expandedItems.has(5)}
                      onToggle={() => toggleItem(5)}
                    >
                      <RoadmapContent roadmap={latestRoadmap!} />
                    </CollectionItem>
                  ) : (
                    <div className="rounded-xl border border-line-steel/20 bg-surface-1/40 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2/50 text-xs font-bold text-text-secondary/70">
                          5
                        </span>
                        <span className="text-sm font-medium text-text-primary">실행 로드맵</span>
                        <span className="rounded-full border border-line-steel/20 bg-surface-2/30 px-2 py-0.5 text-[10px] font-medium text-text-secondary/50">
                          생성 필요
                        </span>
                      </div>
                      <GenerateButton
                        label="실행 로드맵 생성"
                        onGenerate={() => roadmapMutation.mutate()}
                        isPending={roadmapMutation.isPending}
                        disabled={!hasBlueprint}
                        disabledReason="기술 청사진이 먼저 필요합니다"
                      />
                      {roadmapMutation.isError && (
                        <p className="mt-2 text-xs text-red-400">
                          {roadmapMutation.error instanceof Error
                            ? roadmapMutation.error.message
                            : "로드맵 생성에 실패했습니다"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom actions */}
              {hasOverview && (
                <div className="flex flex-wrap items-center gap-3 border-t border-line-steel/15 pt-6">
                  {/* Generate All */}
                  {isProOrAdmin && completionCount < 5 && hasOverview && (
                    <button
                      type="button"
                      onClick={() => generateAllMutation.mutate()}
                      disabled={generateAllMutation.isPending}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-signal-pink/30 bg-signal-pink/5 px-5 py-3 text-sm font-medium text-signal-pink transition-all duration-200 hover:bg-signal-pink/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" />
                      나머지 전부 생성
                    </button>
                  )}

                  {generateAllMutation.isError && (
                    <p className="text-xs text-red-400">
                      {generateAllMutation.error instanceof Error
                        ? generateAllMutation.error.message
                        : "일괄 생성에 실패했습니다"}
                    </p>
                  )}

                  {/* Copy All */}
                  {completionCount === 5 && (
                    <CopyAllButton
                      overview={latestOverview!}
                      appraisal={latestAppraisal!}
                      design={latestDesign!}
                      blueprint={latestBlueprint!}
                      roadmap={latestRoadmap!}
                      ideaTitle={idea.title_ko}
                    />
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
