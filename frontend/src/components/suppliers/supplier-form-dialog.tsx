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
  useCreateSupplier,
  useSupplier,
  useUpdateSupplier,
} from '@/lib/queries/use-suppliers';

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplierId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId?: string;
  onSuccess?: () => void;
}) {
  const isEdit = !!supplierId;
  const { data: supplier } = useSupplier(supplierId ?? '');
  const create = useCreateSupplier();
  const update = useUpdateSupplier(supplierId ?? '');

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!open) return;
    if (!isEdit) return;
    if (!supplier) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setName(supplier.name);
      setContactName(supplier.contactName ?? '');
      setEmail(supplier.email ?? '');
      setPhone(supplier.phone ?? '');
      setAddress(supplier.address ?? '');
    });
    return () => {
      cancelled = true;
    };
  }, [open, isEdit, supplier]);

  useEffect(() => {
    if (!open || isEdit) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setAddress('');
    });
    return () => {
      cancelled = true;
    };
  }, [open, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name,
        contactName: contactName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
      };
      if (isEdit && supplierId) {
        await update.mutateAsync(payload);
        toast.success('Fournisseur mis à jour');
      } else {
        await create.mutateAsync(payload);
        toast.success('Fournisseur créé');
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof err.response.data.message === 'string'
          ? err.response.data.message
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
            {isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Mettez à jour les coordonnées du fournisseur.'
              : 'Ajoutez un fournisseur à votre carnet d\'adresses.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du fournisseur *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              placeholder="Ex : Société ABC"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Personne de contact</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="h-11"
              placeholder="Ex : M. Diallo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              placeholder="contact@abc.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11"
              placeholder="+225 07 00 00 00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11"
              placeholder="Ex : Zone industrielle, Abidjan"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="tap flex-1"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button type="submit" className="tap flex-1" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : isEdit ? (
                'Enregistrer'
              ) : (
                'Créer'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
