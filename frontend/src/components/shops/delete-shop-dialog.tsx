'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useDeleteShop } from '@/lib/queries/use-shops';

export function DeleteShopDialog({
  open,
  onOpenChange,
  shopId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  onSuccess?: () => void;
}) {
  const [confirmation, setConfirmation] = useState('');
  const del = useDeleteShop();

  async function handleDelete() {
    if (confirmation !== 'SUPPRIMER') {
      toast.error('Tapez SUPPRIMER pour confirmer.');
      return;
    }
    try {
      await del.mutateAsync(shopId);
      toast.success('Boutique supprimée');
      onSuccess?.();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Erreur';

      toast.error(message);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Supprimer la boutique
          </SheetTitle>
          <SheetDescription>
            Cette action est <strong>définitive</strong>. Tous les produits,
            ventes et mouvements de cette boutique seront effacés.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <p className="text-sm">
            Tapez <span className="font-mono font-bold">SUPPRIMER</span> pour
            confirmer :
          </p>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="SUPPRIMER"
            className="h-11"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="tap flex-1"
              onClick={() => {
                setConfirmation('');
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
              disabled={del.isPending || confirmation !== 'SUPPRIMER'}
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
      </SheetContent>
    </Sheet>
  );
}
