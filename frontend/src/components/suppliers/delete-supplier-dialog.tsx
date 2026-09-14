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
import { useDeleteSupplier } from '@/lib/queries/use-suppliers';
import { Supplier } from '@/lib/suppliers';

export function DeleteSupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier;
  onSuccess?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteSupplier();

  async function handleDelete() {
    try {
      await del.mutateAsync(supplier.id);
      toast.success('Fournisseur supprimé');
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
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
            Supprimer « {supplier.name} »
          </SheetTitle>
          <SheetDescription>
            Cette action est définitive. Le fournisseur sera retiré de votre
            carnet d&apos;adresses.
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
