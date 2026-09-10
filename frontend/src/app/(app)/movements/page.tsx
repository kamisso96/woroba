'use client';

import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { useMovements } from '@/lib/queries/use-movements';
import { MovementType } from '@/lib/movements';

const filters: { value: MovementType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'IN', label: 'Entrees' },
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
      <PageHeader title="Mouvements" subtitle="Historique des entrees et sorties" />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                filter === f.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:border-primary/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chargement...
          </p>
        )}

        {movements && movements.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun mouvement pour le moment.
              </p>
            </CardContent>
          </Card>
        )}

        {movements && movements.length > 0 && (
          <ul className="space-y-2">
            {movements.map((m) => {
              const isIn = m.type === 'IN';
              const isAdj = m.type === 'ADJUSTMENT';
              const Icon = isAdj ? RefreshCw : isIn ? ArrowDownCircle : ArrowUpCircle;
              return (
                <li key={m.id}>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Icon
                        className={`h-8 w-8 shrink-0 ${
                          isAdj
                            ? 'text-blue-500'
                            : isIn
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {m.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.reason || (isIn ? 'Entree' : isAdj ? 'Ajustement' : 'Sortie')}{' '}
                          - {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            m.quantityChange > 0 ? 'text-green-600' : 'text-red-500'
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
