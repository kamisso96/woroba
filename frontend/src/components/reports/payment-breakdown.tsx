'use client';

import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/products';
import { paymentMethodLabels, Sale } from '@/lib/sales';

export function PaymentBreakdown({ sales }: { sales: Sale[] }) {
  const totals = new Map<string, { count: number; total: number }>();

  for (const sale of sales) {
    const key = sale.paymentMethod;
    const existing = totals.get(key);
    const amount = parseFloat(sale.totalAmount);
    if (existing) {
      existing.count += 1;
      existing.total += amount;
    } else {
      totals.set(key, { count: 1, total: amount });
    }
  }

  const grandTotal = Array.from(totals.values()).reduce(
    (sum, v) => sum + v.total,
    0,
  );

  if (totals.size === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <CreditCard className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Aucune vente sur la période
        </p>
      </div>
    );
  }

  const rows = Array.from(totals.entries())
    .map(([method, v]) => ({
      method: method as keyof typeof paymentMethodLabels,
      ...v,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const percent = grandTotal > 0 ? (row.total / grandTotal) * 100 : 0;
        return (
          <li key={row.method} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {paymentMethodLabels[row.method] ?? row.method}
              </span>
              <span className="text-right">
                <span className="font-semibold">
                  {formatPrice(row.total)}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {percent.toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {row.count} vente{row.count > 1 ? 's' : ''}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
