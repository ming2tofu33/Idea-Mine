export function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <h3 className="text-sm font-semibold text-cold-cyan/80">{title}</h3>
      <span className="text-xs text-text-secondary/50">({count})</span>
    </div>
  );
}
