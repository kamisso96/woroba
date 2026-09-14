'use client';

import { useState } from 'react';
import { Package, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/nav/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { CategoryFormDialog } from '@/components/categories/category-form-dialog';
import { DeleteCategoryDialog } from '@/components/categories/delete-category-dialog';
import { useCategories } from '@/lib/queries/use-categories';
import { Category } from '@/lib/products';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  return (
    <>
      <PageHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Catégories
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organisez vos produits par catégorie.
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

        {isLoading && <ListSkeleton rows={4} />}

        {categories && categories.length === 0 && (
          <EmptyState
            icon={Tag}
            title="Aucune catégorie"
            description="Créez des catégories pour classer vos produits (Boissons, Alimentation, etc.)."
            actionLabel="Créer une catégorie"
            actionHref="#"
          />
        )}

        {categories && categories.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => {
              const color = cat.color ?? '#64748b';
              const productCount = cat._count?.products ?? 0;
              const stagger = `stagger-${Math.min(index + 1, 10)}`;

              return (
                <Card
                  key={cat.id}
                  className={`card-interactive animate-slide-up ${stagger}`}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${color}25` }}
                    >
                      <Tag className="h-5 w-5" style={{ color }} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{cat.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3 w-3" />
                        {productCount} produit{productCount > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="tap h-8 w-8 p-0"
                        onClick={() => setEditTarget(cat)}
                        aria-label="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="tap h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(cat)}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <CategoryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {editTarget && (
        <CategoryFormDialog
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          category={editTarget}
        />
      )}

      {deleteTarget && (
        <DeleteCategoryDialog
          open={!!deleteTarget}
          onOpenChange={(o: boolean) => !o && setDeleteTarget(null)}
          category={deleteTarget}
        />
      )}
    </>
  );
}
