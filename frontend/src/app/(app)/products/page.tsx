'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { useProducts } from '@/lib/queries/use-products';
import { formatPrice, getStockStatus } from '@/lib/products';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const { data: products, isLoading, error } = useProducts(search);

  return (
    <>
      <PageHeader
        title="Produits"
        subtitle="Gérer votre catalogue"
        action={
          <Link href="/products/new">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Ajouter
            </Button>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading && <ListSkeleton rows={5} />}

        {error && (
          <EmptyState
            icon={Package}
            title="Impossible de charger les produits"
            description="Vérifiez votre connexion et réessayez."
          />
        )}

        {products && products.length === 0 && !search && (
          <EmptyState
            icon={Package}
            title="Aucun produit pour le moment"
            description="Commencez par ajouter votre premier produit pour suivre votre stock."
            actionLabel="Ajouter mon premier produit"
            actionHref="/products/new"
          />
        )}

        {products && products.length === 0 && search && (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description={`Aucun produit ne correspond à « ${search} ».`}
          />
        )}

                {products && products.length > 0 && (
          <ul className="space-y-2">
            {products.map((p, index) => {
              const status = getStockStatus(p);
              const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
              return (
                <li key={p.id} className={`animate-slide-up ${staggerClass}`}>
                  <Link href={`/products/${p.id}`}>
                    <Card className="card-interactive tap hover:border-primary/50 hover:shadow-sm">
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatPrice(p.sellingPrice)}
                            {p.category && ` · ${p.category.name}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {p.quantity} {p.unit}
                          </p>
                          <p
                            className={`text-xs ${
                              status === 'out'
                                ? 'animate-pulse-alert text-destructive'
                                : status === 'low'
                                ? 'text-amber-600 dark:text-amber-500'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {status === 'out'
                              ? 'Rupture'
                              : status === 'low'
                              ? 'Stock faible'
                              : 'En stock'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
