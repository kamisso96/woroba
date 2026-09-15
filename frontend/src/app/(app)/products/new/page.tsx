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
      await create.mutateAsync(input);
      toast.success('Produit ajouté');
      router.push('/products');
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  }

  return (
    <>
      <PageHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Nouveau produit
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajouter un produit à votre catalogue.
          </p>
        </div>
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
