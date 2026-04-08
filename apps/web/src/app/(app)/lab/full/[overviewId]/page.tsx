"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { LabBackground } from "@/components/backgrounds/lab-background";
import { ConfirmCostDialog } from "@/components/shared/confirm-cost-dialog";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionCard } from "@/components/shared/section-card";
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

  const progress = ((phaseIndex + 1) / LOADING_PHASES.length) * 100;

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mb-6 h-1 w-48 overflow-hidden rounded-full bg-surface-2/60">
        <div
          className="h-full rounded-full bg-cold-cyan/60 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-text-secondary transition-opacity duration-500">
        {LOADING_PHASES[phaseIndex].text}
      </p>
      <p className="mt-2 text-[11px] text-text-secondary/40">
        {phaseIndex + 1} / {LOADING_PHASES.length}
      </p>
    </div>
  );
}

// --- Copy button for code blocks ---

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute right-2 top-2 cursor-pointer rounded border border-line-steel/20 bg-surface-2/60 p-1.5 text-text-secondary/40 transition-all duration-200 hover:border-cold-cyan/20 hover:text-text-primary"
      title="복사"
    >
      {copied ? (
        <Check className="h-3 w-3 text-cold-cyan" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

// --- Section components ---

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
      <div className="relative">
        <CopyButton text={content} />
        <pre className="overflow-x-auto rounded-md bg-bg-deep/80 p-3 pr-10 font-mono text-xs text-text-secondary">
          {content}
        </pre>
      </div>
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

// --- Table of contents ---

interface TocItem {
  id: string;
  label: string;
  group: string;
}

const TOC_ITEMS: TocItem[] = [
  { id: "concept", label: "컨셉", group: "VISION" },
  { id: "problem", label: "문제 정의", group: "VISION" },
  { id: "target", label: "타깃 사용자", group: "VISION" },
  { id: "features-must", label: "필수 기능", group: "PRODUCT" },
  { id: "features-should", label: "권장 기능", group: "PRODUCT" },
  { id: "features-later", label: "향후 기능", group: "PRODUCT" },
  { id: "user-flow", label: "사용자 흐름", group: "PRODUCT" },
  { id: "screens", label: "화면 목록", group: "PRODUCT" },
  { id: "business-model", label: "비즈니스 모델", group: "BUSINESS" },
  { id: "business-rules", label: "비즈니스 규칙", group: "BUSINESS" },
  { id: "mvp-scope", label: "MVP 범위", group: "BUSINESS" },
  { id: "tech-stack", label: "기술 스택", group: "TECH" },
  { id: "data-model", label: "데이터 모델", group: "TECH" },
  { id: "api-endpoints", label: "API 엔드포인트", group: "TECH" },
  { id: "file-structure", label: "파일 구조", group: "TECH" },
  { id: "external-services", label: "외부 서비스", group: "TECH" },
  { id: "auth-flow", label: "인증 흐름", group: "TECH" },
];

function TableOfContents({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const groups = ["VISION", "PRODUCT", "BUSINESS", "TECH"];

  return (
    <nav className="space-y-1">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-line-steel/20 bg-surface-1/50 px-3 py-2 text-xs font-medium text-text-secondary lg:hidden"
      >
        목차
        {collapsed ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" />
        )}
      </button>

      <div
        className={[
          "space-y-3 overflow-hidden transition-all duration-200",
          collapsed ? "max-h-0 lg:max-h-none" : "max-h-[800px]",
        ].join(" ")}
      >
        {groups.map((group) => {
          const items = TOC_ITEMS.filter((t) => t.group === group);
          return (
            <div key={group}>
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-text-secondary/30">
                {group}
              </p>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={[
                    "block w-full cursor-pointer rounded px-2 py-1 text-left text-[12px] transition-colors duration-200",
                    activeId === item.id
                      ? "bg-cold-cyan/5 font-medium text-cold-cyan"
                      : "text-text-secondary/60 hover:text-text-primary",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// --- Section group divider ---

function GroupDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1 bg-line-steel/20" />
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary/30">
        {label}
      </span>
      <div className="h-px flex-1 bg-line-steel/20" />
    </div>
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

// --- Full overview content sections (reusable) ---

function FullOverviewContent({
  data,
  showToc,
}: {
  data: FullOverview;
  showToc?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("concept");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCopy = useCallback(async () => {
    const md = formatAsMarkdown(data);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar TOC — sticky on desktop */}
      {showToc !== false && (
        <aside className="hidden w-44 shrink-0 lg:block">
          <div className="sticky top-6">
            <TableOfContents activeId={activeSection} onSelect={scrollTo} />
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-8">
        {/* Copy all button + mobile TOC */}
        <div className="space-y-3">
          {showToc !== false && (
            <div className="lg:hidden">
              <TableOfContents activeId={activeSection} onSelect={scrollTo} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary/40">
              {TOC_ITEMS.length}개 섹션
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cold-cyan/20 bg-surface-1/50 px-4 py-2 text-xs font-medium text-cold-cyan/80 transition-all duration-200 hover:border-cold-cyan/40 hover:text-cold-cyan"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  전체 마크다운 복사
                </>
              )}
            </button>
          </div>
        </div>

        {/* VISION */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0 }}
          className="space-y-3"
        >
          <GroupDivider label="Vision" />
          <div ref={setRef("concept")} id="concept">
            <TextSection title="컨셉" content={data.concept} />
          </div>
          <div ref={setRef("problem")} id="problem">
            <TextSection title="문제 정의" content={data.problem} />
          </div>
          <div ref={setRef("target")} id="target">
            <TextSection title="타깃 사용자" content={data.target_user} />
          </div>
        </motion.div>

        {/* PRODUCT */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-3"
        >
          <GroupDivider label="Product" />
          <div ref={setRef("features-must")} id="features-must">
            <BulletListSection title="필수 기능" items={data.features_must} />
          </div>
          <div ref={setRef("features-should")} id="features-should">
            <BulletListSection title="권장 기능" items={data.features_should} />
          </div>
          <div ref={setRef("features-later")} id="features-later">
            <BulletListSection title="향후 기능" items={data.features_later} />
          </div>
          <div ref={setRef("user-flow")} id="user-flow">
            <NumberedListSection title="사용자 흐름" items={data.user_flow} />
          </div>
          <div ref={setRef("screens")} id="screens">
            <BulletListSection title="화면 목록" items={data.screens} />
          </div>
        </motion.div>

        {/* BUSINESS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="space-y-3"
        >
          <GroupDivider label="Business" />
          <div ref={setRef("business-model")} id="business-model">
            <TextSection title="비즈니스 모델" content={data.business_model} />
          </div>
          <div ref={setRef("business-rules")} id="business-rules">
            <BulletListSection
              title="비즈니스 규칙"
              items={data.business_rules}
            />
          </div>
          <div ref={setRef("mvp-scope")} id="mvp-scope">
            <TextSection title="MVP 범위" content={data.mvp_scope} />
          </div>
        </motion.div>

        {/* TECH */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="space-y-3"
        >
          <GroupDivider label="Tech" />
          <div ref={setRef("tech-stack")} id="tech-stack">
            <TechStackSection title="기술 스택" stack={data.tech_stack} />
          </div>
          <div ref={setRef("data-model")} id="data-model">
            <CodeBlockSection title="데이터 모델" content={data.data_model_sql} />
          </div>
          <div ref={setRef("api-endpoints")} id="api-endpoints">
            <BulletListSection
              title="API 엔드포인트"
              items={data.api_endpoints}
            />
          </div>
          <div ref={setRef("file-structure")} id="file-structure">
            <CodeBlockSection title="파일 구조" content={data.file_structure} />
          </div>
          <div ref={setRef("external-services")} id="external-services">
            <BulletListSection
              title="외부 서비스"
              items={data.external_services}
            />
          </div>
          <div ref={setRef("auth-flow")} id="auth-flow">
            <NumberedListSection title="인증 흐름" items={data.auth_flow} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- Older version item ---

function OlderFullOverviewItem({
  data,
  onDelete,
  isDeleting,
}: {
  data: FullOverview;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="group rounded-lg border border-line-steel/15 bg-surface-1/20 transition-opacity hover:opacity-100 opacity-60">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>
            {new Date(data.created_at).toLocaleDateString("ko-KR")}
          </span>
          <span className="text-xs text-text-secondary/40">
            {expanded ? "접기" : "펼치기"}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">삭제?</span>
              <button
                type="button"
                onClick={() => onDelete(data.id)}
                disabled={isDeleting}
                className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10"
              >
                확인
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="cursor-pointer rounded px-2 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="cursor-pointer rounded p-1.5 text-text-secondary/30 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400"
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line-steel/10 px-4 py-4">
          <FullOverviewContent data={data} showToc={false} />
        </div>
      )}
    </div>
  );
}

// --- Older versions collapsible section ---

function OlderFullOverviewsSection({
  versions,
  onDelete,
  isDeleting,
}: {
  versions: FullOverview[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-line-steel/15 mt-8 pt-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-secondary/60 transition-colors hover:text-text-primary"
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        이전 버전 ({versions.length}개)
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {versions.map((version) => (
            <OlderFullOverviewItem
              key={version.id}
              data={version}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
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

  // Load all full overviews (newest first)
  const fullOverviewsQuery = useQuery({
    queryKey: ["fullOverviews", overviewId],
    queryFn: () => labApi.getFullOverviewsByOverview(overviewId),
    enabled: !!overviewId,
  });

  const fullOverviews = fullOverviewsQuery.data ?? [];
  const latest = fullOverviews[0] ?? null;
  const olderVersions = fullOverviews.slice(1);

  // Create full overview mutation
  const createMutation = useMutation({
    mutationFn: () => labApi.createFullOverview(overviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fullOverviews", overviewId] });
    },
  });

  // Delete full overview mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => labApi.deleteFullOverview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fullOverviews", overviewId] });
    },
  });

  const isLoading = fullOverviewsQuery.isLoading;

  return (
    <div className="relative flex min-h-0 flex-1">
      <LabBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-6 pb-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[{ label: "Lab", href: "/lab" }, { label: "풀 개요" }]}
          />

          {/* Header with regenerate button */}
          {latest && !createMutation.isPending && (
            <div className="flex items-center justify-end">
              <ConfirmCostDialog
                action="overview"
                onConfirm={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                label="재생성"
                message="풀 개요서를 재생성하시겠습니까?"
              />
            </div>
          )}

          {/* Content */}
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
                className="mt-3 cursor-pointer rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-5 py-2.5 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20"
              >
                다시 시도
              </button>
            </div>
          ) : latest ? (
            <>
              <FullOverviewContent data={latest} />

              {/* Older versions */}
              {olderVersions.length > 0 && (
                <OlderFullOverviewsSection
                  versions={olderVersions}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isDeleting={deleteMutation.isPending}
                />
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line-steel/30 bg-surface-1/30 p-8 text-center">
              <p className="mb-4 text-sm text-text-secondary">
                이 개요의 풀 개요를 AI가 분석하여 생성합니다
              </p>
              <ConfirmCostDialog
                action="overview"
                onConfirm={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                label="풀 개요 생성"
                message="풀 개요서를 생성하시겠습니까?"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
