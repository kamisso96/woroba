'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useCreateShop,
  useShop,
  useUpdateShop,
} from '@/lib/queries/use-shops';
import { currencies } from '@/lib/shops';

export function ShopFormDialog({
  open,
  onOpenChange,
  shopId,
  onSuccess,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId?: string;
  onSuccess?: () => void;
}>) {
  const isEdit = !!shopId;
  const { data: shop } = useShop(shopId ?? '');
  const create = useCreateShop();
  const update = useUpdateShop(shopId ?? '');

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!shop) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setName(shop.name);
      setCurrency(shop.currency || 'XOF');
      setAddress(shop.address ?? '');
    });
    return () => {
      cancelled = true;
    };
  }, [shop]);

  useEffect(() => {
    if (!open && !isEdit) {
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setName('');
        setCurrency('XOF');
        setAddress('');
      });
      return () => {
        cancelled = true;
      };
    }
  }, [open, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && shopId) {
        await update.mutateAsync({ name, currency, address });
        toast.success('Boutique mise à jour');
      } else {
        await create.mutateAsync({ name, currency, address });
        toast.success('Boutique créée');
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : 'Erreur';

      toast.error(message);
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Modifier la boutique' : 'Nouvelle boutique'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Mettez à jour les informations de cette boutique.'
              : 'Ajoutez un nouveau point de vente à votre compte.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la boutique *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              placeholder="Ex : Boutique Cocody"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse (optionnel)</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11"
              placeholder="Ex : Marché de Cocody, Abidjan"
            />
          </div>

          <Button type="submit" className="tap h-11 w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : isEdit ? (
              'Enregistrer les modifications'
            ) : (
              'Créer la boutique'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
