"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { labApi } from "@/lib/api";
import type { FullOverview } from "@/types/api";

// --- Loading phases ---

const LOADING_PHASES = [
  { text: "제품 구조를 분석하는 중...", delay: 0 },
  { text: "기술 스택을 설계하는 중...", delay: 5000 },
  { text: "문서를 작성하는 중...", delay: 10000 },
];

function LoadingState() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timers = LOADING_PHASES.slice(1).map((phase, i) =>
      setTimeout(() => setPhaseIndex(i + 1), phase.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-6 h-3 w-3 animate-pulse rounded-full bg-cold-cyan/60" />
      <p className="text-sm text-text-secondary transition-opacity duration-500">
        {LOADING_PHASES[phaseIndex].text}
      </p>
    </div>
  );
}

// --- Section components ---

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line-steel/20 bg-surface-1/40 p-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-cold-cyan/80">
        {title}
      </h4>
      {children}
    </div>
  );
}

function TextSection({ title, content }: { title: string; content: string }) {
  return (
    <SectionCard title={title}>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
        {content}
      </p>
    </SectionCard>
  );
}

function BulletListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <SectionCard title={title}>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-text-secondary"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cold-cyan/50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function NumberedListSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <SectionCard title={title}>
      <ol className="space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-text-secondary"
          >
            <span className="shrink-0 text-xs font-medium text-cold-cyan/60">
              {i + 1}.
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

function CodeBlockSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <SectionCard title={title}>
      <pre className="overflow-x-auto rounded-md bg-bg-deep/80 p-3 text-xs font-mono text-text-secondary">
        {content}
      </pre>
    </SectionCard>
  );
}

function TechStackSection({
  title,
  stack,
}: {
  title: string;
  stack: Record<string, string>;
}) {
  const entries = Object.entries(stack);
  return (
    <SectionCard title={title}>
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {entries.map(([key, value]) => (
          <div key={key} className="contents text-sm">
            <span className="font-medium text-text-primary">{key}</span>
            <span className="text-text-secondary">{value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// --- Format as markdown ---

function formatAsMarkdown(fo: FullOverview): string {
  const lines: string[] = [];
  const nl = () => lines.push("");

  lines.push("# 풀 개요");
  nl();

  lines.push("## 내러티브");
  nl();

  lines.push("### 컨셉");
  lines.push(fo.concept);
  nl();

  lines.push("### 문제 정의");
  lines.push(fo.problem);
  nl();

  lines.push("### 타깃 사용자");
  lines.push(fo.target_user);
  nl();

  lines.push("### 필수 기능");
  fo.features_must.forEach((f) => lines.push(`- ${f}`));
  nl();

  lines.push("### 권장 기능");
  fo.features_should.forEach((f) => lines.push(`- ${f}`));
  nl();

  lines.push("### 향후 기능");
  fo.features_later.forEach((f) => lines.push(`- ${f}`));
  nl();

  lines.push("### 사용자 흐름");
  fo.user_flow.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  nl();

  lines.push("### 화면 목록");
  fo.screens.forEach((s) => lines.push(`- ${s}`));
  nl();

  lines.push("### 비즈니스 모델");
  lines.push(fo.business_model);
  nl();

  lines.push("### 비즈니스 규칙");
  fo.business_rules.forEach((r) => lines.push(`- ${r}`));
  nl();

  lines.push("### MVP 범위");
  lines.push(fo.mvp_scope);
  nl();

  lines.push("## 기술");
  nl();

  lines.push("### 기술 스택");
  Object.entries(fo.tech_stack).forEach(([k, v]) =>
    lines.push(`- **${k}:** ${v}`),
  );
  nl();

  lines.push("### 데이터 모델");
  lines.push("```sql");
  lines.push(fo.data_model_sql);
  lines.push("```");
  nl();

  lines.push("### API 엔드포인트");
  fo.api_endpoints.forEach((e) => lines.push(`- ${e}`));
  nl();

  lines.push("### 파일 구조");
  lines.push("```");
  lines.push(fo.file_structure);
  lines.push("```");
  nl();

  lines.push("### 외부 서비스");
  fo.external_services.forEach((s) => lines.push(`- ${s}`));
  nl();

  lines.push("### 인증 흐름");
  fo.auth_flow.forEach((step, i) => lines.push(`${i + 1}. ${step}`));

  return lines.join("\n");
}

// --- Full overview display ---

function FullOverviewDisplay({ data }: { data: FullOverview }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const md = formatAsMarkdown(data);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Copy button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-line-steel/30 bg-surface-2/50 px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:border-cold-cyan/20 hover:text-text-primary"
        >
          {copied ? "복사됨!" : "복사하기"}
        </button>
      </div>

      {/* Narrative Block */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-text-primary">내러티브</h3>
          <div className="h-px flex-1 bg-line-steel/20" />
        </div>

        {/* Vision */}
        <div className="space-y-3">
          <TextSection title="컨셉" content={data.concept} />
          <TextSection title="문제 정의" content={data.problem} />
          <TextSection title="타깃 사용자" content={data.target_user} />
        </div>

        {/* Product */}
        <div className="space-y-3">
          <BulletListSection title="필수 기능" items={data.features_must} />
          <BulletListSection title="권장 기능" items={data.features_should} />
          <BulletListSection title="향후 기능" items={data.features_later} />
          <NumberedListSection title="사용자 흐름" items={data.user_flow} />
          <BulletListSection title="화면 목록" items={data.screens} />
        </div>

        {/* Business */}
        <div className="space-y-3">
          <TextSection title="비즈니스 모델" content={data.business_model} />
          <BulletListSection title="비즈니스 규칙" items={data.business_rules} />
          <TextSection title="MVP 범위" content={data.mvp_scope} />
        </div>
      </div>

      {/* Technical Block */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-text-primary">기술</h3>
          <div className="h-px flex-1 bg-line-steel/20" />
        </div>

        <div className="space-y-3">
          <TechStackSection title="기술 스택" stack={data.tech_stack} />
          <CodeBlockSection title="데이터 모델" content={data.data_model_sql} />
          <BulletListSection title="API 엔드포인트" items={data.api_endpoints} />
          <CodeBlockSection title="파일 구조" content={data.file_structure} />
          <BulletListSection
            title="외부 서비스"
            items={data.external_services}
          />
          <NumberedListSection title="인증 흐름" items={data.auth_flow} />
        </div>
      </div>
    </div>
  );
}

// --- Page ---

export default function FullOverviewPage({
  params,
}: {
  params: Promise<{ overviewId: string }>;
}) {
  const { overviewId } = use(params);
  const queryClient = useQueryClient();

  // Load existing full overview
  const fullOverviewQuery = useQuery({
    queryKey: ["fullOverview", overviewId],
    queryFn: () => labApi.getFullOverview(overviewId),
    enabled: !!overviewId,
  });

  // Create full overview mutation
  const createMutation = useMutation({
    mutationFn: () => labApi.createFullOverview(overviewId),
    onSuccess: (data) => {
      queryClient.setQueryData(["fullOverview", overviewId], data);
    },
  });

  const fullOverview = fullOverviewQuery.data ?? createMutation.data ?? null;
  const isLoading = fullOverviewQuery.isLoading;

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mx-auto mb-6 w-full max-w-2xl">
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-current"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            실험실로 돌아가기
          </Link>
        </div>

        {/* Content */}
        <div className="mx-auto w-full max-w-2xl flex-1 pb-8">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-2/3 rounded bg-surface-2/60" />
              <div className="h-4 w-full rounded bg-surface-2/40" />
              <div className="mt-6 grid gap-4">
                <div className="h-24 rounded-lg bg-surface-2/30" />
                <div className="h-24 rounded-lg bg-surface-2/30" />
              </div>
            </div>
          ) : createMutation.isPending ? (
            <LoadingState />
          ) : createMutation.isError ? (
            <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-center">
              <p className="text-sm text-red-400">
                풀 개요 생성에 실패했습니다
              </p>
              <p className="mt-1 text-xs text-text-secondary/60">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "알 수 없는 오류"}
              </p>
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                className="mt-3 rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20"
              >
                다시 시도
              </button>
            </div>
          ) : fullOverview ? (
            <FullOverviewDisplay data={fullOverview} />
          ) : (
            <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center">
              <p className="mb-4 text-sm text-text-secondary">
                이 개요의 풀 개요를 AI가 분석하여 생성합니다
              </p>
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                className="rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-6 py-3 text-sm font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.15)]"
              >
                풀 개요 생성
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
