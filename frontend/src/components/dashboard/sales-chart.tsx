'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sale } from '@/lib/sales';
import { formatPrice } from '@/lib/products';

type DayData = {
  label: string;
  total: number;
  count: number;
};

function buildLast7Days(sales: Sale[]): DayData[] {
  const days: DayData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const daySales = sales.filter(
      (s) => new Date(s.createdAt).toDateString() === key,
    );
    days.push({
      label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      total: daySales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0),
      count: daySales.length,
    });
  }
  return days;
}

// Format compact pour l'axe Y : 1500 -> "1,5k", 1500000 -> "1,5M"
function formatCompact(value: number): string {
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')}M`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace('.0', '').replace('.', ',')}k`;
  }
  return String(Math.round(value));
}

export function SalesChart({ sales }: { sales: Sale[] }) {
  const data = buildLast7Days(sales);
  const hasData = data.some((d) => d.total > 0);

  return (
    <div className="h-72 w-full">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 16, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={formatCompact}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                fontSize: 13,
                padding: '10px 14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: 4,
                color: 'var(--color-foreground)',
              }}
              formatter={(value, _name, item) => {
                const v = typeof value === 'number' ? value : Number(value);
                const count = (item?.payload as DayData | undefined)?.count ?? 0;
                return [
                  formatPrice(v),
                  `${count} vente${count > 1 ? 's' : ''}`,
                ];
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Aucune vente sur les 7 derniers jours
        </div>
      )}
    </div>
  );
}
