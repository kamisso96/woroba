'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/lib/queries/use-products';
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
  const { data: categories } = useCategories();

  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
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
      categoryId: categoryId || undefined,
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

      {/* Categorie */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="categoryId" className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Catégorie
          </Label>
          <Link
            href="/categories"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Gérer les catégories
          </Link>
        </div>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus:border-primary/60"
        >
          <option value="">Sans catégorie</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {categories && categories.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucune catégorie pour l&apos;instant.{' '}
            <Link
              href="/categories"
              className="font-medium text-primary hover:underline"
            >
              Créez-en une
            </Link>
            .
          </p>
        )}
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
          <Label htmlFor="quantity">Quantité en stock</Label>
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
          <Label htmlFor="unit">Unité</Label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus:border-primary/60"
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
