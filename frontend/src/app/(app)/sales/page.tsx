'use client';

import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { ExportButton } from '@/components/ui/export-button';
import { ReceiptActions } from '@/components/sales/receipt-actions';
import { useSales } from '@/lib/queries/use-sales';
import { formatPrice } from '@/lib/products';
import { paymentMethodLabels } from '@/lib/sales';

export default function SalesPage() {
  const { data: sales, isLoading } = useSales();

  return (
    <>
      <PageHeader />

      <main className="w-full flex-1 space-y-6 px-6 py-8 lg:px-8">
        {/* Titre + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Ventes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Historique de vos ventes.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ExportButton type="sales" />
            <Link href="/sales/new">
              <Button className="tap">
                <Plus className="mr-2 h-4 w-4" />
                Vendre
              </Button>
            </Link>
          </div>
        </div>

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
            {sales.map((s, index) => {
              const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
              return (
                <li key={s.id} className={`animate-slide-up ${staggerClass}`}>
                  <Card className="card-interactive">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
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

                        <div className="flex shrink-0 items-center gap-1">
                          <div className="mr-1 text-right">
                            <p className="text-base font-semibold">
                              {formatPrice(s.totalAmount)}
                            </p>
                          </div>
                          <ReceiptActions sale={s} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
