'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { ProductForm } from '@/components/products/product-form';
import { useCreateProduct } from '@/lib/queries/use-products';

export default function NewProductPage() {
  const router = useRouter();
  const create = useCreateProduct();
  type CreateProductInput = Parameters<typeof create.mutateAsync>[0];
  type ApiError = {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  async function handleSubmit(input: CreateProductInput) {
    try {
      const product = await create.mutateAsync(input);
      toast.success('Produit ajoute');
      router.push(`/products/${product.id}`);
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  }

  return (
    <>
      <PageHeader title="Nouveau produit" subtitle="Ajouter au catalogue" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du produit</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              onSubmit={handleSubmit}
              submitLabel="Ajouter le produit"
              loading={create.isPending}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}