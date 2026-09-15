'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/nav/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ListSkeleton } from '@/components/ui/loading-skeleton';
import { ProductThumbnail } from '@/components/products/product-thumbnail';
import { StockBadge } from '@/components/products/stock-badge';
import { useProducts, useDeleteProduct } from '@/lib/queries/use-products';
import { useShopContext } from '@/lib/shop-context';
import { formatPrice, getStockStatus } from '@/lib/products';
import { toast } from 'sonner';

type ProductRequestError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: products, isLoading, error } = useProducts(search);
  const { activeShop } = useShopContext();
  const del = useDeleteProduct();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer « ${name} » ? Cette action est définitive.`)) {
      return;
    }
    try {
      await del.mutateAsync(id);
      toast.success('Produit supprimé');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as ProductRequestError).response?.data?.message || 'Erreur'
          : 'Erreur';

      toast.error(message);
    }
  }

  return (
    <>
      <PageHeader />

      <main className="w-full flex-1 space-y-6 px-6 py-8 lg:px-8">
        {/* Titre + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Produits
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gérez votre catalogue de produits.
            </p>
          </div>
          <Link href="/products/new" className="shrink-0">
            <Button className="tap">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </Link>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-9"
          />
        </div>

        {isLoading && <ListSkeleton rows={6} />}

        {error && (
          <EmptyState
            icon={Package}
            title="Impossible de charger les produits"
            description="Vérifiez votre connexion et réessayez."
          />
        )}

        {products && products.length === 0 && !search && (
          <EmptyState
            icon={Package}
            title="Aucun produit pour le moment"
            description="Commencez par ajouter votre premier produit pour suivre votre stock."
            actionLabel="Ajouter mon premier produit"
            actionHref="/products/new"
          />
        )}

        {products && products.length === 0 && search && (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description={`Aucun produit ne correspond à « ${search} ».`}
          />
        )}

        {products && products.length > 0 && (
          <>
            {/* === DESKTOP : TABLEAU === */}
            <div className="hidden rounded-xl border bg-card md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="w-10 px-3 py-3.5 text-left"></th>
                    <th className="px-3 py-3.5 text-left">Référence</th>
                    <th className="px-3 py-3.5 text-left">Article</th>
                    <th className="px-3 py-3.5 text-left">Catégorie</th>
                    <th className="px-3 py-3.5 text-right">Stock</th>
                    <th className="hidden px-3 py-3.5 text-left lg:table-cell">
                      Boutique
                    </th>
                    <th className="px-3 py-3.5 text-left">Prix</th>
                    <th className="hidden px-3 py-3.5 text-left xl:table-cell">
                      Mis à jour
                    </th>
                    <th className="px-3 py-3.5 text-left">Statut</th>
                    <th className="w-12 px-2 py-3.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => {
                    const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
                    const categoryName = p.category?.name ?? '—';
                    const reference = p.sku || p.barcode || '—';
                    const updated = new Date(p.updatedAt).toLocaleDateString(
                      'fr-FR',
                      { day: '2-digit', month: '2-digit', year: 'numeric' },
                    );

                    const status = getStockStatus(p);
                    const stockColor =
                      status === 'out'
                        ? 'text-destructive'
                        : status === 'low'
                        ? 'text-amber-600 dark:text-amber-500'
                        : 'text-emerald-600 dark:text-emerald-500';

                    return (
                      <tr
                        key={p.id}
                        className={`animate-fade-in ${staggerClass} border-b last:border-b-0 transition-colors hover:bg-muted/40`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-input"
                            aria-label={`Sélectionner ${p.name}`}
                          />
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {reference}
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/products/${p.id}`}
                            className="flex items-center gap-3"
                          >
                            <ProductThumbnail
                              name={p.name}
                              imageUrl={p.imageUrl}
                              size="lg"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {p.name}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {categoryName}
                        </td>
                        <td
                          className={`px-3 py-3 text-right text-sm font-bold ${stockColor}`}
                        >
                          {p.quantity}
                        </td>
                        <td className="hidden px-3 py-3 text-sm text-muted-foreground lg:table-cell">
                          {activeShop?.name ?? '—'}
                        </td>
                        <td className="px-3 py-3 text-left text-sm font-semibold">
                          {formatPrice(p.sellingPrice)}
                        </td>
                        <td className="hidden px-3 py-3 text-sm text-muted-foreground xl:table-cell">
                          {updated}
                        </td>
                        <td className="px-3 py-3">
                          <StockBadge product={p} />
                        </td>
                        <td className="px-2 py-3">
                          <ProductActions
                            onEdit={() => router.push(`/products/${p.id}`)}
                            onMovement={() => router.push(`/products/${p.id}`)}
                            onDelete={() => handleDelete(p.id, p.name)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* === MOBILE : CARTES === */}
            <ul className="space-y-2 md:hidden">
              {products.map((p, index) => {
                const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
                const status = getStockStatus(p);
                const stockColor =
                  status === 'out'
                    ? 'text-destructive'
                    : status === 'low'
                    ? 'text-amber-600 dark:text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-500';

                return (
                  <li key={p.id} className={`animate-slide-up ${staggerClass}`}>
                    <Link href={`/products/${p.id}`}>
                      <Card className="card-interactive tap hover:border-primary/50">
                        <CardContent className="flex items-center gap-3 p-4">
                          <ProductThumbnail
                            name={p.name}
                            imageUrl={p.imageUrl}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {p.sku && `${p.sku} · `}
                              {formatPrice(p.sellingPrice)}
                            </p>
                            <div className="mt-1.5">
                              <StockBadge product={p} />
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-base font-bold ${stockColor}`}
                            >
                              {p.quantity}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </>
  );
}

function ProductActions({
  onEdit,
  onMovement,
  onDelete,
}: {
  onEdit: () => void;
  onMovement: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 208;
    const menuHeight = 148;

    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow < menuHeight + 8
        ? rect.top - menuHeight - 4
        : rect.bottom + 4;

    const left = Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    );

    setPosition({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }
    const id = setTimeout(
      () => document.addEventListener('mousedown', handleClick),
      0,
    );
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="tap flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Actions"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        position &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
            }}
            className="animate-fade-in z-[60] w-52 overflow-hidden rounded-lg border bg-card shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
              <span>Modifier</span>
            </button>
            <button
              onClick={onMovement}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Mouvement de stock</span>
            </button>
            <div className="border-t" />
            <button
              onClick={onDelete}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer</span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}