'use client';

import { BarChart3 } from 'lucide-react';
import { Sale } from '@/lib/sales';
import { formatPrice } from '@/lib/products';

type TopProduct = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

function computeTopProducts(sales: Sale[], limit = 5): TopProduct[] {
  const map = new Map<string, TopProduct>();
  for (const sale of sales) {
    for (const item of sale.saleItems) {
      const existing = map.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += parseFloat(item.totalPrice);
      } else {
        map.set(item.productId, {
          productId: item.productId,
          name: item.product.name,
          quantity: item.quantity,
          revenue: parseFloat(item.totalPrice),
        });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function TopProducts({ sales }: { sales: Sale[] }) {
  const top = computeTopProducts(sales);
  const max = top[0]?.quantity ?? 0;

  if (top.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Aucune vente enregistrée pour l&apos;instant
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {top.map((p, index) => {
        const percent = max > 0 ? (p.quantity / max) * 100 : 0;
        return (
          <li key={p.productId} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="truncate font-medium">{p.name}</span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-sm font-semibold">{p.quantity}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatPrice(p.revenue)}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
