"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MINE_LABELS, type MineLanguage } from "./mine-labels";

type MineSupportStatus = "loading" | "error" | "empty" | "ready";

function SupportTile({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-xl border border-line-steel/30 bg-bg-deep/55 p-3.5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-text-secondary/70">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-text-primary/90">{copy}</p>
    </div>
  );
}

type MineSupportBlockProps = {
  status: MineSupportStatus;
  lang?: MineLanguage;
};

const STATUS_KEY: Record<MineSupportStatus, "supportLoading" | "supportError" | "supportEmpty" | "supportReady"> = {
  loading: "supportLoading",
  error: "supportError",
  empty: "supportEmpty",
  ready: "supportReady",
};

export function MineSupportBlock({ status, lang = "ko" }: MineSupportBlockProps) {
  const [collapsed, setCollapsed] = useState(true);
  const copy = MINE_LABELS[STATUS_KEY[status]];

  return (
    <section
      aria-label="Mine support"
      className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8"
    >
      <div className="observatory-panel observatory-frame rounded-2xl border border-line-steel/40 px-4 py-4 sm:px-5 sm:py-5">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full cursor-pointer items-start justify-between gap-3 text-left"
          aria-expanded={!collapsed}
        >
          <div className="flex flex-wrap items-end justify-between gap-3 flex-1">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-cold-cyan/75">
                {MINE_LABELS.supportEyebrow[lang]}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-text-primary sm:text-base">
                {copy.title[lang]}
              </h3>
            </div>
            <p className="max-w-md text-xs leading-5 text-text-secondary/75 sm:text-sm">
              {copy.intro[lang]}
            </p>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-text-secondary/70 transition-transform duration-200 ${
              !collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {!collapsed && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SupportTile
              title={MINE_LABELS.supportHowItWorks[lang]}
              copy={copy.primary[lang]}
            />
            <SupportTile
              title={MINE_LABELS.supportSystemNote[lang]}
              copy={copy.secondary[lang]}
            />
          </div>
        )}
      </div>
    </section>
  );
}
