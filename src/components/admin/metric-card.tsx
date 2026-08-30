export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-caption text-muted">{label}</p>
      <p className="tabular mt-1 text-display-m text-foreground">{value}</p>
    </div>
  );
}
