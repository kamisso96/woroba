'use client';

import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { useSales } from '@/lib/queries/use-sales';
import { formatPrice } from '@/lib/products';
import { paymentMethodLabels } from '@/lib/sales';

export default function SalesPage() {
  const { data: sales, isLoading } = useSales();

  return (
    <>
      <PageHeader
        title="Ventes"
        subtitle="Historique de vos ventes"
        action={
          <Link href="/sales/new">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Vendre
            </Button>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        {isLoading && <ListSkeleton rows={4} />}

        {sales && sales.length === 0 && (
          <EmptyState
            icon={Receipt}
            title="Aucune vente pour le moment"
            description="Enregistrez votre première vente pour la voir apparaître ici."
            actionLabel="Enregistrer une vente"
            actionHref="/sales/new"
          />
        )}

        {sales && sales.length > 0 && (
          <ul className="space-y-2">
            {sales.map((s) => (
              <li key={s.id}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {new Date(s.createdAt).toLocaleString('fr-FR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.saleItems.length} article
                          {s.saleItems.length > 1 ? 's' : ''} ·{' '}
                          {paymentMethodLabels[s.paymentMethod]}
                        </p>
                        <ul className="mt-2 space-y-0.5">
                          {s.saleItems.slice(0, 3).map((item) => (
                            <li
                              key={item.id}
                              className="truncate text-xs text-muted-foreground"
                            >
                              {item.quantity} × {item.product.name}
                            </li>
                          ))}
                          {s.saleItems.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              … et {s.saleItems.length - 3} autres
                            </li>
                          )}
                        </ul>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base font-semibold">
                          {formatPrice(s.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
