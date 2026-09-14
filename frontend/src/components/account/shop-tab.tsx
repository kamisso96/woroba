'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, MapPin, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMyShop, useUpdateMyShop } from '@/lib/queries/use-account';
import { currencies } from '@/lib/account';

export function ShopTab() {
  const { data: shop, isLoading } = useMyShop();
  const update = useUpdateMyShop();

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({ name, currency, address });
      toast.success('Boutique mise a jour');
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Chargement...
        </CardContent>
      </Card>
    );
  }

  const dirty =
    shop &&
    (shop.name !== name ||
      shop.currency !== currency ||
      (shop.address ?? '') !== address);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ma boutique</CardTitle>
        <CardDescription>
          Informations generales sur votre activite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la boutique</Label>
            <div className="relative">
              <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 pl-9"
                required
              />
            </div>
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
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 pl-9"
                placeholder="Ex : Marche de Cocody, Abidjan"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="tap h-11 w-full"
            disabled={update.isPending || !dirty}
          >
            {update.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
