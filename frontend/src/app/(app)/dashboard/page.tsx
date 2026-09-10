'use client';

import Link from 'next/link';
import { Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { StatsSkeleton } from '@/components/ui/loading-skeleton';
import { useAuth } from '@/lib/auth-context';
import { useProducts } from '@/lib/queries/use-products';
import { useSales } from '@/lib/queries/use-sales';
import { formatPrice, getStockStatus } from '@/lib/products';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: sales, isLoading: loadingSales } = useSales();

  const totalValue =
    products?.reduce(
      (sum, p) => sum + parseFloat(p.purchasePrice) * p.quantity,
      0,
    ) ?? 0;
  const alerts = products?.filter((p) => getStockStatus(p) !== 'ok').length ?? 0;

  const today = new Date().toDateString();
  const todaySales =
    sales?.filter((s) => new Date(s.createdAt).toDateString() === today) ?? [];
  const todayRevenue = todaySales.reduce(
    (sum, s) => sum + parseFloat(s.totalAmount),
    0,
  );

  const loading = loadingProducts || loadingSales;

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Bonjour ${user?.fullName?.split(' ')[0] ?? ''} 👋`}
        action={
          <Link href="/sales/new">
            <Button size="sm">
              <ShoppingCart className="mr-1 h-4 w-4" />
              Vendre
            </Button>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardDescription>Valeur du stock</CardDescription>
                <CardTitle className="text-2xl">
                  {formatPrice(totalValue)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Produits</CardDescription>
                <CardTitle className="text-2xl">
                  {products?.length ?? 0}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Alertes stock</CardDescription>
                <CardTitle
                  className={`text-2xl ${
                    alerts > 0 ? 'text-amber-600 dark:text-amber-500' : ''
                  }`}
                >
                  {alerts}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Ventes du jour</CardDescription>
                <CardTitle className="text-2xl">
                  {formatPrice(todayRevenue)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {todaySales.length} vente{todaySales.length > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Produits récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products && products.length > 0 ? (
                <ul className="divide-y">
                  {products.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.id}`}
                        className="flex items-center justify-between py-2 text-sm transition-colors hover:text-primary"
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                          {p.quantity} {p.unit}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun produit.{' '}
                  <Link
                    href="/products/new"
                    className="font-medium text-primary hover:underline"
                  >
                    En ajouter
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Dernières ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sales && sales.length > 0 ? (
                <ul className="divide-y">
                  {sales.slice(0, 5).map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="font-medium">
                        {formatPrice(s.totalAmount)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune vente.{' '}
                  <Link
                    href="/sales/new"
                    className="font-medium text-primary hover:underline"
                  >
                    Enregistrer
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
