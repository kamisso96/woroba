'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/products';
import { Sale } from '@/lib/sales';

export function KpiCards({
  sales,
  previousSales,
}: {
  sales: Sale[];
  previousSales: Sale[];
}) {
  const revenue = sales.reduce(
    (sum, s) => sum + parseFloat(s.totalAmount),
    0,
  );
  const previousRevenue = previousSales.reduce(
    (sum, s) => sum + parseFloat(s.totalAmount),
    0,
  );

  const count = sales.length;
  const previousCount = previousSales.length;

  const average = count > 0 ? revenue / count : 0;
  const previousAverage = previousCount > 0 ? previousRevenue / previousCount : 0;

  // Marge estimee (CA - cout des produits vendus)
  const itemsSold = sales.reduce(
    (sum, s) => sum + s.saleItems.reduce((acc, i) => acc + i.quantity, 0),
    0,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        label="Chiffre d'affaires"
        value={formatPrice(revenue)}
        variation={computeVariation(revenue, previousRevenue)}
        icon={<Wallet className="h-4 w-4" />}
      />
      <Kpi
        label="Ventes"
        value={String(count)}
        variation={computeVariation(count, previousCount)}
        icon={<ShoppingCart className="h-4 w-4" />}
      />
      <Kpi
        label="Panier moyen"
        value={formatPrice(average)}
        variation={computeVariation(average, previousAverage)}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <Kpi
        label="Articles vendus"
        value={String(itemsSold)}
        icon={<ShoppingCart className="h-4 w-4" />}
      />
    </div>
  );
}

function computeVariation(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function Kpi({
  label,
  value,
  variation,
  icon,
}: {
  label: string;
  value: string;
  variation?: number | null;
  icon: React.ReactNode;
}) {
  const showVariation =
    variation !== undefined && variation !== null && !isNaN(variation);
  const positive = (variation ?? 0) >= 0;

  return (
    <Card className="card-interactive">
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <p className="text-xs font-medium">{label}</p>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {showVariation && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              positive
                ? 'bg-green-500/10 text-green-600 dark:text-green-500'
                : 'bg-red-500/10 text-red-600 dark:text-red-500'
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {positive ? '+' : ''}
            {variation.toFixed(0)}%
          </span>
        )}
      </CardContent>
    </Card>
  );
}
