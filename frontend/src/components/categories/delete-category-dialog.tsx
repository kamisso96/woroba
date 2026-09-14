'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useDeleteCategory } from '@/lib/queries/use-categories';
import { Category } from '@/lib/products';

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  onSuccess?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteCategory();

  const productCount = category._count?.products ?? 0;
  const hasProducts = productCount > 0;

  async function handleDelete() {
    try {
      await del.mutateAsync(category.id);
      toast.success('Catégorie supprimée');
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message =
        typeof error?.response?.data?.message === 'string'
          ? error.response.data.message
          : err instanceof Error
            ? err.message
            : 'Erreur';

      toast.error(message);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setConfirming(false);
        onOpenChange(o);
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Supprimer « {category.name} »
          </SheetTitle>
          <SheetDescription>
            {hasProducts ? (
              <>
                Cette catégorie contient <strong>{productCount} produit{productCount > 1 ? 's' : ''}</strong>.
                Les produits ne seront pas supprimés, mais ils n&apos;auront plus
                de catégorie.
              </>
            ) : (
              'Cette action est définitive.'
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!confirming ? (
            <Button
              variant="destructive"
              className="tap w-full"
              onClick={() => setConfirming(true)}
            >
              Confirmer la suppression
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">
                Êtes-vous vraiment sûr ? Cette action est irréversible.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="tap flex-1"
                  onClick={() => {
                    setConfirming(false);
                    onOpenChange(false);
                  }}
                  disabled={del.isPending}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="tap flex-1"
                  onClick={handleDelete}
                  disabled={del.isPending}
                >
                  {del.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    'Supprimer'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
