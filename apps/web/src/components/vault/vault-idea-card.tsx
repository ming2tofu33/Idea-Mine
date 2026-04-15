"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { VAULT_LABELS, type VaultLanguage } from "./vault-labels";
import { WorkflowDots } from "./workflow-dots";
import type { Idea } from "@/types/api";

type VaultIdeaCardProps = {
  idea: Idea;
  hasOverview: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  lang: VaultLanguage;
  /** Disables navigation while keeping the card visible in demo mode. */
  linkDisabled?: boolean;
};

export function VaultIdeaCard({
  idea,
  hasOverview,
  onDelete,
  isDeleting,
  lang,
  linkDisabled = false,
}: VaultIdeaCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const title = idea.title;
  const summary = idea.summary;

  const handleLinkClick = (e: React.MouseEvent) => {
    if (linkDisabled) {
      e.preventDefault();
    }
  };

  return (
    <Link
      href={`/vault/${idea.id}`}
      onClick={handleLinkClick}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-line-steel/30 bg-surface-1/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-cold-cyan/20 hover:bg-surface-1/70 motion-safe:hover:-translate-y-0.5"
    >
      <div
        className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        onClick={(e) => e.preventDefault()}
      >
        {confirmDelete ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(idea.id);
            }}
            disabled={isDeleting}
            className="cursor-pointer rounded px-2 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting
              ? VAULT_LABELS.deleting[lang]
              : VAULT_LABELS.deleteConfirm[lang]}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 3000);
            }}
            className="cursor-pointer rounded p-1 text-text-secondary/40 transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <h3 className="mb-1 pr-8 text-base font-semibold text-text-primary transition-colors group-hover:text-cold-cyan">
        {title}
      </h3>

      <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-text-secondary">
        {summary}
      </p>

      <WorkflowDots hasOverview={hasOverview} lang={lang} />
    </Link>
  );
}
