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
import { ProductThumbnail } from '@/components/products/product-thumbnail';
import { StockBadge } from '@/components/products/stock-badge';
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
            <Button size="sm" className="tap">
              <Plus className="mr-1 h-4 w-4" />
              Ajouter
            </Button>
          </Link>
        }
      />

      <main className="w-full flex-1 space-y-6 px-6 py-8 lg:px-8">
        {/* Barre de recherche */}
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
          <>
            {/* === DESKTOP : TABLEAU === */}
            <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-left">Référence</th>
                    <th className="px-4 py-3 text-left">Catégorie</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-right">Prix</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => {
                    const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
                    return (
                      <tr
                        key={p.id}
                        className={`animate-fade-in ${staggerClass} border-b last:border-b-0 transition-colors hover:bg-muted/40`}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/products/${p.id}`}
                            className="flex items-center gap-3"
                          >
                            <ProductThumbnail name={p.name} imageUrl={p.imageUrl} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {p.name}
                              </p>
                              {p.description && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {p.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {p.sku || p.barcode || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {p.category?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {p.quantity}{' '}
                          <span className="text-xs text-muted-foreground">
                            {p.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold">
                          {formatPrice(p.sellingPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <StockBadge product={p} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* === MOBILE : CARTES === */}
            <ul className="space-y-2 md:hidden">
              {products.map((p, index) => {
                const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
                return (
                  <li key={p.id} className={`animate-slide-up ${staggerClass}`}>
                    <Link href={`/products/${p.id}`}>
                      <Card className="card-interactive tap hover:border-primary/50">
                        <CardContent className="flex items-center gap-3 p-4">
                          <ProductThumbnail name={p.name} imageUrl={p.imageUrl} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {p.sku && `${p.sku} · `}
                              {formatPrice(p.sellingPrice)}
                            </p>
                            <div className="mt-1.5">
                              <StockBadge product={p} />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {p.quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.unit}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
