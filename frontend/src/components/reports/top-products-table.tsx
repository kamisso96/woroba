'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Sale } from '@/lib/sales';
import { formatPrice } from '@/lib/products';

type Row = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

type SortKey = 'quantity' | 'revenue';

function aggregate(sales: Sale[]): Row[] {
  const map = new Map<string, Row>();
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
  return Array.from(map.values());
}

export function TopProductsTable({ sales }: { sales: Sale[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('quantity');
  const rows = aggregate(sales).sort((a, b) =>
    sortKey === 'quantity'
      ? b.quantity - a.quantity
      : b.revenue - a.revenue,
  );

  if (rows.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Aucune vente sur la période
        </p>
      </div>
    );
  }

  const max =
    sortKey === 'quantity'
      ? rows[0].quantity
      : rows[0].revenue;

  return (
    <div className="space-y-4">
      {/* Toggle de tri */}
      <div className="flex gap-1.5">
        <SortButton
          active={sortKey === 'quantity'}
          onClick={() => setSortKey('quantity')}
        >
          Par quantité
        </SortButton>
        <SortButton
          active={sortKey === 'revenue'}
          onClick={() => setSortKey('revenue')}
        >
          Par chiffre d&apos;affaires
        </SortButton>
      </div>

      <ul className="space-y-3">
        {rows.slice(0, 10).map((row, index) => {
          const value = sortKey === 'quantity' ? row.quantity : row.revenue;
          const percent = max > 0 ? (value / max) * 100 : 0;

          return (
            <li key={row.productId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium">{row.name}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-semibold">
                    {sortKey === 'quantity'
                      ? `${row.quantity} vendus`
                      : formatPrice(row.revenue)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {sortKey === 'quantity'
                  ? formatPrice(row.revenue)
                  : `${row.quantity} vendus`}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`tap rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
