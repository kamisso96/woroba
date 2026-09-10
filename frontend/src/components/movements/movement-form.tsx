'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateMovement } from '@/lib/queries/use-movements';
import { MovementType } from '@/lib/movements';

export function MovementForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess?: () => void;
}) {
  const [type, setType] = useState<MovementType>('IN');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const create = useCreateMovement();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        productId,
        type,
        quantity: parseInt(quantity) || 0,
        reason: reason || undefined,
      });
      toast.success('Mouvement enregistre');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(error.response?.data?.message || 'Erreur');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Type de mouvement</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MovementType)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        >
          <option value="IN">Entree (reapprovisionnement, retour client)</option>
          <option value="OUT">Sortie (perte, casse, don)</option>
          <option value="ADJUSTMENT">Ajustement</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantite</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Raison (optionnel)</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex : Reapprovisionnement fournisseur"
        />
      </div>

      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? 'Enregistrement...' : 'Enregistrer le mouvement'}
      </Button>
    </form>
  );
}