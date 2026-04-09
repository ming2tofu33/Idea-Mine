"use client";

import { useMemo } from "react";
import Link from "next/link";
import { VaultBackground } from "@/components/backgrounds/vault-background";
import { PageHeader } from "@/components/shared/page-header";
import { VaultIdeaCard } from "@/components/vault/vault-idea-card";
import { VAULT_LABELS } from "@/components/vault/vault-labels";
import { useLanguage } from "@/hooks/use-language";
import {
  getDemoOverviewMap,
  getDemoVaultedIdeas,
} from "@/lib/experience-data";

/**
 * DemoVault — 게스트가 /vault를 방문했을 때 보여주는 데모 모드.
 *
 * 실제 Vault의 VaultIdeaCard를 그대로 재사용하되,
 * 9개 정적 데모 idea를 주입. 삭제 액션은 sign-in으로 유도.
 */
export function DemoVault() {
  const { lang } = useLanguage();
  const ideas = useMemo(() => getDemoVaultedIdeas(), []);
  const overviewMap = useMemo(() => getDemoOverviewMap(), []);

  const handleDeleteGate = () => {
    window.location.href = "/auth/sign-in?next=/vault";
  };

  return (
    <div className="relative flex min-h-0 flex-1">
      <VaultBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Header — 실제 Vault와 동일한 PageHeader */}
        <div className="mx-auto mb-6 w-full max-w-5xl">
          <PageHeader
            eyebrow={VAULT_LABELS.eyebrow[lang]}
            title={VAULT_LABELS.title[lang]}
            subtitle={VAULT_LABELS.subtitle[lang]}
            meta={
              <span className="rounded-md border border-line-steel/40 bg-surface-1/50 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-text-secondary">
                {VAULT_LABELS.ideasCount[lang](ideas.length)}
              </span>
            }
          />
        </div>

        {/* 데모 아이디어 grid — 실제 Vault와 100% 동일 */}
        <div className="mx-auto w-full max-w-5xl flex-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <VaultIdeaCard
                key={idea.id}
                idea={idea}
                hasOverview={!!overviewMap[idea.id]}
                onDelete={handleDeleteGate}
                isDeleting={false}
                lang={lang}
                linkDisabled
              />
            ))}
          </div>
        </div>

        {/* 데모 컨텍스트 안내 */}
        <div className="mx-auto mt-6 w-full max-w-5xl">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-cold-cyan/15 bg-[rgba(92,205,229,0.04)] px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs leading-5 text-text-secondary sm:text-sm">
              <span className="font-semibold text-cold-cyan">
                {VAULT_LABELS.demoSampleNotice[lang]}
              </span>
              <span className="mx-2 text-text-secondary/40">·</span>
              {VAULT_LABELS.demoFreshNotice[lang]}
            </p>
            <Link
              href="/auth/sign-in?next=/vault"
              className="shrink-0 rounded-lg border border-cold-cyan/40 bg-cold-cyan/15 px-4 py-2 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/25"
            >
              {VAULT_LABELS.demoMyVaultCta[lang]}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
