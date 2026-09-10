'use client';

import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { useMovements } from '@/lib/queries/use-movements';
import { MovementType } from '@/lib/movements';

const filters: { value: MovementType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'IN', label: 'Entrées' },
  { value: 'OUT', label: 'Sorties' },
  { value: 'ADJUSTMENT', label: 'Ajustements' },
];

export default function MovementsPage() {
  const [filter, setFilter] = useState<MovementType | 'ALL'>('ALL');
  const { data: movements, isLoading } = useMovements(
    filter === 'ALL' ? undefined : { type: filter },
  );

  return (
    <>
      <PageHeader
        title="Mouvements"
        subtitle="Historique des entrées et sorties"
      />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && <ListSkeleton rows={5} />}

        {movements && movements.length === 0 && (
          <EmptyState
            icon={RefreshCw}
            title="Aucun mouvement enregistré"
            description="Les entrées et sorties de stock apparaîtront ici."
          />
        )}

                {movements && movements.length > 0 && (
          <ul className="space-y-2">
            {movements.map((m, index) => {
              const isIn = m.type === 'IN';
              const isAdj = m.type === 'ADJUSTMENT';
              const Icon = isAdj ? RefreshCw : isIn ? ArrowDownCircle : ArrowUpCircle;
              const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
              return (
                <li key={m.id} className={`animate-slide-up ${staggerClass}`}>
                  <Card className="card-interactive">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Icon
                        className={`h-8 w-8 shrink-0 ${
                          isAdj
                            ? 'text-blue-500'
                            : isIn
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-red-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {m.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.reason ||
                            (isIn ? 'Entrée' : isAdj ? 'Ajustement' : 'Sortie')}{' '}
                          · {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            m.quantityChange > 0
                              ? 'text-green-600 dark:text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {m.quantityChange > 0 ? '+' : ''}
                          {m.quantityChange}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.product.unit}
                        </p>
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
