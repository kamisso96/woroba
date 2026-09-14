'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
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
import { SalesChart } from '@/components/dashboard/sales-chart';
import { TopProducts } from '@/components/dashboard/top-products';
import { Sparkline } from '@/components/dashboard/sparkline';
import { useAuth } from '@/lib/auth-context';
import { useProducts } from '@/lib/queries/use-products';
import { useSales } from '@/lib/queries/use-sales';
import { formatPrice, getStockStatus } from '@/lib/products';

function makeSpark(seed: number, points = 7): number[] {
  if (seed <= 0) return Array(points).fill(0);
  const arr: number[] = [];
  let v = seed * 0.75;
  for (let i = 0; i < points; i++) {
    v += (Math.sin(i * 1.6 + seed * 0.13) + 1) * seed * 0.08;
    arr.push(Math.max(0, v));
  }
  return arr;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: sales, isLoading: loadingSales } = useSales();

  const totalValue =
    products?.reduce(
      (sum, p) => sum + parseFloat(p.purchasePrice) * p.quantity,
      0,
    ) ?? 0;

  const lowStockProducts =
    products?.filter((p) => getStockStatus(p) === 'low').length ?? 0;
  const outOfStockProducts =
    products?.filter((p) => getStockStatus(p) === 'out').length ?? 0;
  const totalAlerts = lowStockProducts + outOfStockProducts;

  const today = new Date().toDateString();
  const todaySales =
    sales?.filter((s) => new Date(s.createdAt).toDateString() === today) ?? [];
  const todayRevenue = todaySales.reduce(
    (sum, s) => sum + parseFloat(s.totalAmount),
    0,
  );

  const salesSpark = useMemo(() => {
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const total =
        sales
          ?.filter((s) => new Date(s.createdAt).toDateString() === key)
          .reduce((sum, s) => sum + parseFloat(s.totalAmount), 0) ?? 0;
      days.push(total);
    }
    return days;
  }, [sales]);

  const productsSpark = useMemo(() => {
    const days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const count =
        products?.filter(
          (p) => new Date(p.createdAt).toDateString() === key,
        ).length ?? 0;
      days.push(count);
    }
    return days;
  }, [products]);

  const yesterdayRevenue = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const key = y.toDateString();
    return (
      sales
        ?.filter((s) => new Date(s.createdAt).toDateString() === key)
        .reduce((sum, s) => sum + parseFloat(s.totalAmount), 0) ?? 0
    );
  }, [sales]);

  const salesVariation = useMemo(() => {
    if (yesterdayRevenue === 0) return todayRevenue > 0 ? 100 : 0;
    return ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  }, [todayRevenue, yesterdayRevenue]);

  const loading = loadingProducts || loadingSales;
  const firstName = user?.fullName?.split(' ')[0] ?? '';

  return (
    <>
      <PageHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-6">
        {/* Titre + bouton Vendre */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Tableau de bord
            </h1>
          </div>
          <Link href="/sales/new" className="shrink-0">
            <Button size="sm" className="tap">
              <ShoppingCart className="mr-1 h-4 w-4" />
              Vendre
            </Button>
          </Link>
        </div>

        {/* Cartes stats avec sparklines */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Valeur du stock"
              value={formatPrice(totalValue)}
              spark={makeSpark(totalValue)}
              color="oklch(0.72 0.19 155)"
              hint={`${products?.length ?? 0} produit${(products?.length ?? 0) > 1 ? 's' : ''}`}
              className="animate-slide-up stagger-1"
            />

            <StatCard
              label="Ventes du jour"
              value={formatPrice(todayRevenue)}
              spark={salesSpark}
              color="oklch(0.72 0.19 155)"
              variation={salesVariation}
              hint={`${todaySales.length} vente${todaySales.length > 1 ? 's' : ''}`}
              className="animate-slide-up stagger-2"
            />

            <StatCard
              label="Produits"
              value={String(products?.length ?? 0)}
              spark={
                productsSpark.length > 1
                  ? productsSpark
                  : makeSpark(products?.length ?? 0)
              }
              color="oklch(0.65 0.18 250)"
              hint="Dans le catalogue"
              className="animate-slide-up stagger-3"
            />

            <StatCard
              label="Alertes stock"
              value={String(totalAlerts)}
              spark={makeSpark(totalAlerts || 1)}
              color={
                totalAlerts > 0 ? 'oklch(0.7 0.19 60)' : 'oklch(0.72 0.19 155)'
              }
              hint={
                totalAlerts === 0
                  ? 'Tout va bien'
                  : `${outOfStockProducts} rupture · ${lowStockProducts} faible${lowStockProducts > 1 ? 's' : ''}`
              }
              className="animate-slide-up stagger-4"
              href={totalAlerts > 0 ? '/products' : undefined}
            />
          </div>
        )}

        {/* Graphique ventes */}
        <Card className="animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">
                Ventes des 7 derniers jours
              </CardTitle>
              <CardDescription>
                Montant total encaissé chaque jour
              </CardDescription>
            </div>
            <Link
              href="/sales"
              className="hidden text-xs font-medium text-primary hover:underline sm:inline-flex sm:items-center sm:gap-1"
            >
              Tout voir
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
            ) : (
              <SalesChart sales={sales ?? []} />
            )}
          </CardContent>
        </Card>

        {/* Deux colonnes */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Top produits
              </CardTitle>
              <CardDescription>
                Les plus vendus (toutes périodes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : (
                <TopProducts sales={sales ?? []} />
              )}
            </CardContent>
          </Card>

          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Produits à surveiller
              </CardTitle>
              <CardDescription>Stocks faibles ou en rupture</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : (
                <LowStockList products={products ?? []} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dernières ventes */}
        <Card className="animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Dernières ventes
            </CardTitle>
            <Link
              href="/sales"
              className="text-xs font-medium text-primary hover:underline"
            >
              Tout voir
            </Link>
          </CardHeader>
          <CardContent>
            {sales && sales.length > 0 ? (
              <ul className="divide-y">
                {sales.slice(0, 5).map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {s.saleItems.length} article
                        {s.saleItems.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold">
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
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  spark,
  color = 'var(--color-primary)',
  variation,
  hint,
  className = '',
  href,
}: {
  label: string;
  value: string;
  spark: number[];
  color?: string;
  variation?: number;
  hint?: string;
  className?: string;
  href?: string;
}) {
  const variationPositive = (variation ?? 0) >= 0;

  const content = (
    <Card
      className={`card-interactive overflow-hidden ${className} ${
        href ? 'cursor-pointer hover:border-primary/50' : ''
      }`}
    >
      <CardContent className="space-y-3 p-5">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>

        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <Sparkline data={spark} color={color} />
          </div>
          {variation !== undefined && (
            <span
              className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                variationPositive
                  ? 'bg-green-500/10 text-green-600 dark:text-green-500'
                  : 'bg-red-500/10 text-red-600 dark:text-red-500'
              }`}
            >
              {variationPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {variationPositive ? '+' : ''}
              {variation.toFixed(0)}%
            </span>
          )}
        </div>

        {hint && (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function LowStockList({
  products,
}: {
  products: {
    id: string;
    name: string;
    quantity: number;
    alertThreshold: number;
    unit: string;
  }[];
}) {
  const items = products
    .filter((p) => p.quantity <= p.alertThreshold)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Aucun produit en alerte. Tout va bien ✅
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {items.map((p) => {
        const out = p.quantity <= 0;
        return (
          <li key={p.id}>
            <Link
              href={`/products/${p.id}`}
              className="flex items-center justify-between py-2.5 text-sm transition-colors hover:text-primary"
            >
              <span className="truncate">{p.name}</span>
              <span
                className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  out
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-500'
                }`}
              >
                {out ? 'Rupture' : `${p.quantity} ${p.unit}`}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
