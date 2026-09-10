'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { ProductForm } from '@/components/products/product-form';
import { MovementDialog } from '@/components/movements/movement-dialog';
import {
  useDeleteProduct,
  useProduct,
  useUpdateProduct,
} from '@/lib/queries/use-products';

type ProductFormValues = {
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  alertThreshold: number;
  unit: string;
  sku?: string;
};

function getApiErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const maybeResponse = err as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    if (typeof maybeResponse.response?.data?.message === 'string') {
      return maybeResponse.response.data.message;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'Erreur';
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const update = useUpdateProduct(id);
  const remove = useDeleteProduct();
  const [confirming, setConfirming] = useState(false);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Produit" />
        <main className="mx-auto w-full max-w-2xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">Chargement...</p>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <PageHeader title="Produit introuvable" />
        <main className="mx-auto w-full max-w-2xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Ce produit n&apos;existe plus.
          </p>
        </main>
      </>
    );
  }

  async function handleUpdate(input: ProductFormValues) {
    try {
      await update.mutateAsync(input);
      toast.success('Produit mis a jour');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await remove.mutateAsync(id);
      toast.success('Produit supprime');
      router.push('/products');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader title={product.name} subtitle="Detail du produit" />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6">
        <div className="flex flex-wrap gap-2">
          <MovementDialog productId={id} label="Entree / Sortie" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modifier</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              initial={{
                name: product.name,
                purchasePrice: parseFloat(product.purchasePrice),
                sellingPrice: parseFloat(product.sellingPrice),
                quantity: product.quantity,
                alertThreshold: product.alertThreshold,
                unit: product.unit,
                sku: product.sku ?? '',
              }}
              onSubmit={handleUpdate}
              submitLabel="Enregistrer les modifications"
              loading={update.isPending}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">Supprimer ce produit</p>
              <p className="text-xs text-muted-foreground">
                Cette action est definitive.
              </p>
            </div>
            {confirming ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirming(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={remove.isPending}
                >
                  Confirmer
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
