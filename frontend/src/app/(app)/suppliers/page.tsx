'use client';

import { useState } from 'react';
import {
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Truck,
  User,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/nav/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { SupplierFormDialog } from '@/components/suppliers/supplier-form-dialog';
import { DeleteSupplierDialog } from '@/components/suppliers/delete-supplier-dialog';
import { useSuppliers } from '@/lib/queries/use-suppliers';
import { Supplier } from '@/lib/suppliers';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const { data: suppliers, isLoading } = useSuppliers(search);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  return (
    <>
      <PageHeader />

      <main className="w-full flex-1 space-y-6 px-6 py-8 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Fournisseurs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Votre carnet d&apos;adresses de fournisseurs.
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading && <ListSkeleton rows={4} />}

        {suppliers && suppliers.length === 0 && !search && (
          <EmptyState
            icon={Truck}
            title="Aucun fournisseur"
            description="Cliquez sur « Ajouter » en haut à droite pour créer votre premier fournisseur."
          />
        )}

        {suppliers && suppliers.length === 0 && search && (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description={`Aucun fournisseur ne correspond à « ${search} ».`}
          />
        )}

        {suppliers && suppliers.length > 0 && (
          <ul className="space-y-2">
            {suppliers.map((s, index) => {
              const initials = s.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              const stagger = `stagger-${Math.min(index + 1, 10)}`;

              return (
                <li key={s.id} className={`animate-slide-up ${stagger}`}>
                  <Card className="card-interactive">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate font-medium">{s.name}</p>
                        {s.contactName && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">{s.contactName}</span>
                          </p>
                        )}
                        {s.phone && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span className="truncate">{s.phone}</span>
                          </p>
                        )}
                        {s.email && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{s.email}</span>
                          </p>
                        )}
                        {s.address && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{s.address}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="tap h-8 w-8 p-0"
                          onClick={() => setEditTarget(s)}
                          aria-label="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="tap h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <SupplierFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <SupplierFormDialog
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          supplierId={editTarget.id}
        />
      )}

      {deleteTarget && (
        <DeleteSupplierDialog
          open={!!deleteTarget}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          supplier={deleteTarget}
        />
      )}
    </>
  );
}
