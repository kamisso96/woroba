'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductInput } from '@/lib/products';

const units = ['piece', 'kg', 'g', 'litre', 'ml', 'paquet', 'carton'];

export function ProductForm({
  initial,
  onSubmit,
  submitLabel = 'Enregistrer',
  loading = false,
}: {
  initial?: Partial<ProductInput>;
  onSubmit: (input: ProductInput) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [purchasePrice, setPurchasePrice] = useState(
    initial?.purchasePrice?.toString() ?? '0',
  );
  const [sellingPrice, setSellingPrice] = useState(
    initial?.sellingPrice?.toString() ?? '0',
  );
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '0');
  const [alertThreshold, setAlertThreshold] = useState(
    initial?.alertThreshold?.toString() ?? '0',
  );
  const [unit, setUnit] = useState(initial?.unit ?? 'piece');
  const [sku, setSku] = useState(initial?.sku ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      quantity: parseInt(quantity) || 0,
      alertThreshold: parseInt(alertThreshold) || 0,
      unit,
      sku: sku || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Coca-Cola 33cl"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Prix d&apos;achat</Label>
          <Input
            id="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Prix de vente</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantite en stock</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="alertThreshold">Seuil d&apos;alerte</Label>
          <Input
            id="alertThreshold"
            type="number"
            min="0"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="unit">Unite</Label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">Code / SKU (optionnel)</Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Ex : COCA33"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Enregistrement...' : submitLabel}
      </Button>
    </form>
  );
}
