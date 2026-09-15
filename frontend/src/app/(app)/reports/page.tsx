'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/nav/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatsSkeleton } from '@/components/ui/loading-skeleton';
import {
  PeriodFilter,
  ReportPeriod,
  getPeriodStart,
} from '@/components/reports/period-filter';
import { KpiCards } from '@/components/reports/kpi-cards';
import { RevenueChart } from '@/components/reports/revenue-chart';
import { TopProductsTable } from '@/components/reports/top-products-table';
import { DormantProducts } from '@/components/reports/dormant-products';
import { PaymentBreakdown } from '@/components/reports/payment-breakdown';
import { useProducts } from '@/lib/queries/use-products';
import { useSales } from '@/lib/queries/use-sales';

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: sales, isLoading: loadingSales } = useSales();

  const loading = loadingProducts || loadingSales;

  // Filtrer les ventes sur la periode
  const { currentSales, previousSales } = useMemo(() => {
    const start = getPeriodStart(period);
    const all = sales ?? [];

    if (!start) {
      return { currentSales: all, previousSales: [] };
    }

    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - durationMs);

    const current = all.filter(
      (s) => new Date(s.createdAt).getTime() >= start.getTime(),
    );
    const previous = all.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= previousStart.getTime() && t < start.getTime();
    });

    return { currentSales: current, previousSales: previous };
  }, [sales, period]);

  return (
    <>
      <PageHeader />

      <main className="w-full flex-1 space-y-6 px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Rapports
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Analysez votre activité sur la période choisie.
            </p>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {loading ? (
          <StatsSkeleton />
        ) : (
          <KpiCards
            sales={currentSales}
            previousSales={previousSales}
          />
        )}

        {/* Graphique d'evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Évolution du chiffre d&apos;affaires
            </CardTitle>
            <CardDescription>
              {period === 'all'
                ? 'Depuis le début'
                : `Sur les ${period === '7d' ? '7 derniers jours' : period === '30d' ? '30 derniers jours' : '90 derniers jours'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted" />
            ) : (
              <RevenueChart sales={currentSales} period={period} />
            )}
          </CardContent>
        </Card>

        {/* Top produits + Dormants */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Top produits
              </CardTitle>
              <CardDescription>
                Meilleures ventes de la période
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : (
                <TopProductsTable sales={currentSales} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4" />
                Produits dormants
              </CardTitle>
              <CardDescription>
                En stock mais sans aucune vente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts || loadingSales ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : (
                <DormantProducts
                  products={products ?? []}
                  sales={currentSales}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Repartition paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Répartition par mode de paiement
            </CardTitle>
            <CardDescription>
              Comment vos clients paient
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 animate-pulse rounded bg-muted"
                  />
                ))}
              </div>
            ) : (
              <PaymentBreakdown sales={currentSales} />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
