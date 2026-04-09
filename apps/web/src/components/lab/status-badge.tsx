export function StatusBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors duration-200",
        active
          ? "border-cold-cyan/30 bg-cold-cyan/10 text-cold-cyan"
          : "border-line-steel/20 bg-surface-2/30 text-text-secondary/40",
      ].join(" ")}
    >
      {label}
    </span>
  );
}
