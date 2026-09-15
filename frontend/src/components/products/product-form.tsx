'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, getImageUrl } from '@/lib/api';
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
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(data.url);
      toast.success('Image ajoutée');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : 'Échec de l\'upload de l\'image';

      toast.error(message);
    } finally {
      setUploading(false);
      // Reset l'input pour pouvoir reuploader le meme fichier
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage() {
    setImageUrl('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      categoryId: categoryId || undefined,
      imageUrl: imageUrl || undefined,
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      quantity: parseInt(quantity) || 0,
      alertThreshold: parseInt(alertThreshold) || 0,
      unit,
      sku: sku || undefined,
    });
  }

  const fullPreviewUrl = getImageUrl(imageUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image */}
      <div className="space-y-2">
        <Label>Photo du produit</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border bg-muted/40">
            {fullPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullPreviewUrl}
                alt="Aperçu"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImagePlus className="h-10 w-10" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              id="product-image"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="tap w-fit"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {uploading
                ? 'Envoi...'
                : imageUrl
                ? 'Changer l\'image'
                : 'Choisir une image'}
            </Button>
            {imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="tap w-fit text-destructive hover:text-destructive"
                onClick={removeImage}
              >
                <X className="mr-2 h-4 w-4" />
                Retirer l&apos;image
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP ou GIF · 5 Mo max
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Coca-Cola 33cl"
          required
          className="h-11"
        />
      </div>

      {/* Catégorie */}
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
            className="h-11"
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
            className="h-11"
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
            className="h-11"
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
            className="h-11"
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
            className="h-11"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="tap h-11 w-full"
        disabled={loading || uploading}
      >
        {loading ? 'Enregistrement...' : submitLabel}
      </Button>
    </form>
  );
}
