import { PageHeader } from '@/components/nav/page-header';
import { SaleCart } from '@/components/sales/sale-cart';

export default function NewSalePage() {
  return (
    <>
      <PageHeader title="Nouvelle vente" subtitle="Ajoutez des produits au panier" />
      <main className="w-full flex-1 px-4 py-6">
        <SaleCart />
      </main>
    </>
  );
}
