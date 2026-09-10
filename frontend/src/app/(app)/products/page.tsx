'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { useProducts } from '@/lib/queries/use-products';
import { formatPrice, getStockStatus } from '@/lib/products';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const { data: products, isLoading, error } = useProducts(search);

  return (
    <>
      <PageHeader
        title="Produits"
        subtitle="Gerer votre catalogue"
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

        {isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
        )}

        {error && (
          <p className="py-8 text-center text-sm text-destructive">
            Impossible de charger les produits.
          </p>
        )}

        {products && products.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun produit pour le moment.
              </p>
              <Link href="/products/new">
                <Button size="sm">Ajouter mon premier produit</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {products && products.length > 0 && (
          <ul className="space-y-2">
            {products.map((p) => {
              const status = getStockStatus(p);
              return (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`}>
                    <Card className="transition hover:border-primary/50">
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatPrice(p.sellingPrice)}
                            {p.category && ` - ${p.category.name}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {p.quantity} {p.unit}
                          </p>
                          <p
                            className={`text-xs ${
                              status === 'out'
                                ? 'text-destructive'
                                : status === 'low'
                                ? 'text-amber-600'
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
