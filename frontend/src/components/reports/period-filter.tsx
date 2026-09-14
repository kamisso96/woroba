'use client';

export type ReportPeriod = '7d' | '30d' | '90d' | 'all';

const options: { value: ReportPeriod; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: 'all', label: 'Tout' },
];

export function PeriodFilter({
  value,
  onChange,
}: {
  value: ReportPeriod;
  onChange: (v: ReportPeriod) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`tap rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === o.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function getPeriodStart(period: ReportPeriod): Date | null {
  if (period === 'all') return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const days = period === '7d' ? 6 : period === '30d' ? 29 : 89;
  d.setDate(d.getDate() - days);
  return d;
}
