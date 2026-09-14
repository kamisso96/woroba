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
import { getPeriodStart, ReportPeriod } from './period-filter';

type Point = { label: string; total: number };

// Cle locale "YYYY-MM-DD" (sans passer par UTC)
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Recule jusqu'au lundi de la semaine
function toMonday(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function buildData(sales: Sale[], period: ReportPeriod): Point[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const start = getPeriodStart(period);

  let realStart: Date;
  if (start) {
    realStart = new Date(start);
  } else if (sales.length > 0) {
    realStart = new Date(
      Math.min(...sales.map((s) => new Date(s.createdAt).getTime())),
    );
  } else {
    realStart = new Date();
  }
  realStart.setHours(0, 0, 0, 0);

  const dayCount = Math.max(
    1,
    Math.ceil((now.getTime() - realStart.getTime()) / 86400000) + 1,
  );
  const useWeeks = dayCount > 30;

  // Creation des buckets
  const buckets = new Map<string, Point>();

  if (useWeeks) {
    const cursor = toMonday(realStart);
    while (cursor <= now) {
      const key = dateKey(cursor);
      buckets.set(key, {
        label: cursor.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        }),
        total: 0,
      });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    const cursor = new Date(realStart);
    while (cursor <= now) {
      const key = dateKey(cursor);
      buckets.set(key, {
        label: cursor.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        }),
        total: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Remplissage
  for (const sale of sales) {
    const d = new Date(sale.createdAt);
    d.setHours(0, 0, 0, 0);

    const targetDate = useWeeks ? toMonday(d) : d;
    const key = dateKey(targetDate);

    const point = buckets.get(key);
    if (point) {
      point.total += parseFloat(sale.totalAmount);
    }
  }

  return Array.from(buckets.values());
}

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

export function RevenueChart({
  sales,
  period,
}: {
  sales: Sale[];
  period: ReportPeriod;
}) {
  const data = buildData(sales, period);
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">
          Aucune vente sur la période
        </p>
        <p className="text-xs text-muted-foreground">
          ({sales.length} vente{sales.length > 1 ? 's' : ''} disponible
          {sales.length > 1 ? 's' : ''})
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 16, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
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
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
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
            formatter={(value) => {
              const v = typeof value === 'number' ? value : Number(value);
              return [formatPrice(v), 'CA'];
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
