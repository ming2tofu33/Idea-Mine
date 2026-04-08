"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type SignalButtonVariant = "primary" | "default" | "secondary" | "ghost";

export type SignalButtonProps = {
  children: ReactNode;
  variant?: SignalButtonVariant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES: Record<SignalButtonVariant, string> = {
  primary: [
    "border-signal-pink/50 bg-[rgba(255,59,147,0.1)] text-text-primary",
    "hover:border-signal-pink/70 hover:bg-[rgba(255,59,147,0.16)] signal-glow-pink",
    "focus-visible:border-signal-pink focus-visible:ring-signal-pink/30",
  ].join(" "),
  default: [
    "border-line-steel/60 bg-surface-2/60 text-text-primary",
    "hover:border-signal-pink/50 hover:bg-surface-2/80 signal-glow-pink",
    "focus-visible:border-signal-pink/70 focus-visible:ring-signal-pink/20",
  ].join(" "),
  secondary: [
    "border-line-steel/60 bg-surface-1/65 text-text-secondary",
    "hover:border-cold-cyan/60 hover:text-cold-cyan signal-glow-cyan",
    "focus-visible:border-cold-cyan/70 focus-visible:ring-cold-cyan/20",
  ].join(" "),
  ghost: [
    "border-transparent bg-transparent text-text-secondary",
    "hover:text-text-primary hover:bg-surface-1/40",
    "focus-visible:border-line-steel/50 focus-visible:ring-line-steel/20",
  ].join(" "),
};

export function SignalButton({
  children,
  variant = "default",
  className = "",
  type = "button",
  ...props
}: SignalButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium",
        "transition-all duration-200 backdrop-blur-md",
        "focus-visible:outline-none focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none",
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
