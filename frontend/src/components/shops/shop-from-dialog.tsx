'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ImagePlus, Loader2, X } from 'lucide-react';
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
import { api, getImageUrl } from '@/lib/api';
import {
  useCreateShop,
  useShop,
  useUpdateShop,
} from '@/lib/queries/use-shops';
import { useShopContext } from '@/lib/shop-context';
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
  const { refreshShops, setActiveShop } = useShopContext();
  const router = useRouter();
  const pathname = usePathname();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charge les donnees de la boutique (edition)
  useEffect(() => {
    if (!shop) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setName(shop.name);
      setCurrency(shop.currency || 'XOF');
      setAddress(shop.address ?? '');
      setLogoUrl(shop.logoUrl ?? '');
    });
    return () => {
      cancelled = true;
    };
  }, [shop]);

  // Reset a l'ouverture en mode creation
  useEffect(() => {
    if (!open && !isEdit) {
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        setName('');
        setCurrency('XOF');
        setAddress('');
        setLogoUrl('');
      });
      return () => {
        cancelled = true;
      };
    }
  }, [open, isEdit]);

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
      setLogoUrl(data.url);
      toast.success('Logo ajouté');
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : "Échec de l'upload du logo";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && shopId) {
        await update.mutateAsync({ name, currency, address, logoUrl });
        toast.success('Boutique mise à jour');
        await refreshShops();
        onSuccess?.();
        onOpenChange(false);
      } else {
        const created = await create.mutateAsync({
          name,
          currency,
          address,
          logoUrl,
        });
        toast.success('Boutique créée');
        await refreshShops();
        setActiveShop(created.id);
        onSuccess?.();
        onOpenChange(false);
        if (pathname !== '/shops') {
          router.push('/shops');
        }
      }
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

  const pending = create.isPending || update.isPending;
  const logoPreview = getImageUrl(logoUrl);

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
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo de la boutique</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-muted/40">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
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
                  id="shop-logo"
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
                    : logoUrl
                    ? 'Changer le logo'
                    : 'Choisir un logo'}
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="tap w-fit text-destructive hover:text-destructive"
                    onClick={() => setLogoUrl('')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Retirer le logo
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  PNG ou JPG · ratio 2:1 recommandé
                </p>
              </div>
            </div>
          </div>

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

          <Button
            type="submit"
            className="tap h-11 w-full"
            disabled={pending || uploading}
          >
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
