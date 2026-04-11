export type SignalButtonVariant = "primary" | "default" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<SignalButtonVariant, string> = {
  primary: [
    "border-signal-pink/45 bg-[rgba(255,59,147,0.08)] text-text-primary",
    "hover:-translate-y-0.5 hover:border-signal-pink/60 hover:bg-[rgba(255,59,147,0.12)] signal-glow-pink",
    "focus-visible:border-signal-pink focus-visible:ring-signal-pink/30",
  ].join(" "),
  default: [
    "border-line-steel/60 bg-surface-2/60 text-text-primary",
    "hover:-translate-y-0.5 hover:border-signal-pink/40 hover:bg-surface-2/78 signal-glow-pink",
    "focus-visible:border-signal-pink/70 focus-visible:ring-signal-pink/20",
  ].join(" "),
  secondary: [
    "border-line-steel/60 bg-surface-1/72 text-text-secondary",
    "hover:-translate-y-0.5 hover:border-cold-cyan/50 hover:bg-surface-1/84 hover:text-cold-cyan signal-glow-cyan",
    "focus-visible:border-cold-cyan/70 focus-visible:ring-cold-cyan/20",
  ].join(" "),
  ghost: [
    "border-transparent bg-transparent text-text-secondary",
    "hover:text-text-primary hover:bg-surface-1/40",
    "focus-visible:border-line-steel/50 focus-visible:ring-line-steel/20",
  ].join(" "),
};

export function signalButtonClassName({
  variant = "default",
  className = "",
}: {
  variant?: SignalButtonVariant;
  className?: string;
}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium leading-none",
    "transition-[transform,border-color,background-color,color,box-shadow] duration-200 backdrop-blur-sm",
    "focus-visible:outline-none focus-visible:ring-2",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:active:translate-y-0 disabled:active:scale-100",
    VARIANT_CLASSES[variant],
    className,
  ].join(" ");
}
