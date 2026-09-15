'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, MapPin, Pencil, Plus, Store, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/nav/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useShopContext } from '@/lib/shop-context';
import { ShopFormDialog } from '@/components/shops/shop-from-dialog';
import { DeleteShopDialog } from '@/components/shops/delete-shop-dialog';

export default function ShopsPage() {
  const { shops, activeShop, setActiveShop, loading, refreshShops } =
    useShopContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [editShop, setEditShop] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <>
      <PageHeader />

      <main className="w-full flex-1 space-y-6 px-6 py-8 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Mes boutiques
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gérez toutes vos boutiques et points de vente.
            </p>
          </div>
          <Button
            size="sm"
            className="tap shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </div>

        {loading && (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Chargement...
            </CardContent>
          </Card>
        )}

        {!loading && shops.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Aucune boutique</p>
                <p className="text-xs text-muted-foreground">
                  Créez votre première boutique pour commencer.
                </p>
              </div>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Créer une boutique
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && shops.length > 0 && (
          <ul className="space-y-3">
            {shops.map((s) => {
              const isActive = s.id === activeShop?.id;
              const initials = s.name
                .split(' ')
                .map((w: string) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <li key={s.id}>
                  <Card
                    className={`card-interactive ${
                      isActive ? 'border-primary/50' : ''
                    }`}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{s.name}</p>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Devise : {s.currency}
                        </p>
                        {s.address && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{s.address}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1">
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="tap h-8"
                            onClick={() => setActiveShop(s.id)}
                          >
                            Activer
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="tap h-8 w-8 p-0"
                          onClick={() => setEditShop(s.id)}
                          aria-label="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {shops.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="tap h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(s.id)}
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <ShopFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refreshShops}
      />

      {editShop && (
        <ShopFormDialog
          open={!!editShop}
          onOpenChange={(o: boolean) => !o && setEditShop(null)}
          shopId={editShop}
          onSuccess={refreshShops}
        />
      )}

      {deleteTarget && (
        <DeleteShopDialog
          open={!!deleteTarget}
          onOpenChange={(o: boolean) => !o && setDeleteTarget(null)}
          shopId={deleteTarget}
          onSuccess={async () => {
            setDeleteTarget(null);
            await refreshShops();
          }}
        />
      )}
    </>
  );
}
