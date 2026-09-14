'use client';

import Link from 'next/link';
import { Package, TrendingDown } from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';
import { Sale } from '@/lib/sales';

export function DormantProducts({
  products,
  sales,
}: {
  products: Product[];
  sales: Sale[];
}) {
  const soldIds = new Set<string>();
  for (const sale of sales) {
    for (const item of sale.saleItems) {
      soldIds.add(item.productId);
    }
  }

  const dormant = products.filter(
    (p) => !soldIds.has(p.id) && p.quantity > 0,
  );

  if (dormant.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
        <Package className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Aucun produit dormant 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {dormant.length} produit{dormant.length > 1 ? 's' : ''} sans aucune
        vente sur la période.
      </p>
      <ul className="divide-y">
        {dormant.slice(0, 10).map((p) => (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="flex items-center justify-between py-2.5 text-sm transition-colors hover:text-primary"
            >
              <div className="flex min-w-0 items-center gap-2">
                <TrendingDown className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="truncate">{p.name}</span>
              </div>
              <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                {p.quantity} {p.unit} · {formatPrice(p.sellingPrice)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {dormant.length > 10 && (
        <p className="text-xs text-muted-foreground">
          … et {dormant.length - 10} autres
        </p>
      )}
    </div>
  );
}
