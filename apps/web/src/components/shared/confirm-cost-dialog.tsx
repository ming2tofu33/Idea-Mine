"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { labApi } from "@/lib/api";

interface ConfirmCostDialogProps {
  action: "overview" | "generation";
  onConfirm: () => void;
  isLoading?: boolean;
  label?: string;
  message?: string;
  className?: string;
}

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  lite: "Lite",
  pro: "Pro",
};

export function ConfirmCostDialog({
  action,
  onConfirm,
  isLoading = false,
  label = "Regenerate",
  message,
  className = "",
}: ConfirmCostDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const usageQuery = useQuery({
    queryKey: ["labUsage"],
    queryFn: () => labApi.getUsage(),
    enabled: showConfirm,
    staleTime: 10_000,
  });

  const usage = usageQuery.data;
  const info = usage ? usage[action === "overview" ? "overviews" : "generations"] : null;
  const tierLabel = usage ? (TIER_LABELS[usage.tier] ?? usage.tier) : "";
  const isUnlimited = info && info.limit >= 50;
  const remaining = info ? info.limit - info.used : null;

  const defaultMessage =
    action === "overview"
      ? "This action uses AI document credits."
      : "This action uses generation credits.";

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className={[
          "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cold-cyan/30 bg-cold-cyan/10 px-4 py-2 text-sm font-medium text-cold-cyan transition-all duration-200 hover:bg-cold-cyan/20 hover:shadow-[0_0_20px_rgba(92,205,229,0.1)]",
          isLoading && "cursor-not-allowed opacity-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={[
        "rounded-lg border border-cold-cyan/20 bg-surface-1/80 p-4 backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      <p className="text-sm text-text-primary">{message ?? defaultMessage}</p>

      {usageQuery.isLoading ? (
        <p className="mt-2 text-xs text-text-secondary/50">Checking usage...</p>
      ) : info ? (
        <p className="mt-2 text-xs text-text-secondary">
          {tierLabel} &middot;{" "}
          {isUnlimited ? (
            <span className="text-cold-cyan">Unlimited</span>
          ) : (
            <>
              Remaining today:{" "}
              <span
                className={
                  remaining !== null && remaining <= 1 ? "text-red-400" : "text-cold-cyan"
                }
              >
                {remaining}/{info.limit}
              </span>
            </>
          )}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="cursor-pointer rounded-md px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            setShowConfirm(false);
          }}
          disabled={isLoading || (remaining !== null && remaining <= 0)}
          className="cursor-pointer rounded-md border border-cold-cyan/30 bg-cold-cyan/10 px-4 py-1.5 text-xs font-medium text-cold-cyan transition-all hover:bg-cold-cyan/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
