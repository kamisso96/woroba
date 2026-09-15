'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  useCreateCategory,
  useUpdateCategory,
} from '@/lib/queries/use-categories';
import { Category } from '@/lib/products';

const colorPalette = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#14b8a6',
  '#64748b',
];

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess?: () => void;
}) {
  const isEdit = !!category;
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const router = useRouter();
  const pathname = usePathname();

  const [name, setName] = useState('');
  const [color, setColor] = useState(colorPalette[0]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (category) {
        setName(category.name);
        setColor(category.color ?? colorPalette[0]);
      } else {
        setName('');
        setColor(colorPalette[0]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && category) {
        await update.mutateAsync({
          id: category.id,
          input: { name, color },
        });
        toast.success('Catégorie mise à jour');
      } else {
        await create.mutateAsync({ name, color });
        toast.success('Catégorie créée');
      }
      onSuccess?.();
      onOpenChange(false);
      // Si on n'est pas sur /categories, y rediriger
      if (pathname !== '/categories') {
        router.push('/categories');
      }
    } catch (err: unknown) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(apiError.response?.data?.message || 'Erreur');
    }
  }

  const pending = create.isPending || update.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Mettez à jour le nom ou la couleur.'
              : 'Organisez vos produits par catégorie.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la catégorie *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              placeholder="Ex : Boissons"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`tap h-9 w-9 rounded-full transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-background'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: c,
                    // @ts-expect-error CSS var via inline style
                    '--tw-ring-color': c,
                  }}
                  aria-label={`Couleur ${c}`}
                />
              ))}
            </div>
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
