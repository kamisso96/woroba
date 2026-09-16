'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductThumbnail } from '@/components/products/product-thumbnail';
import { useProducts, useCategories } from '@/lib/queries/use-products';
import { useCreateSale } from '@/lib/queries/use-sales';
import { formatPrice } from '@/lib/products';
import { PaymentMethod, paymentMethodLabels } from '@/lib/sales';

type CartLine = { productId: string; quantity: number };

export function SaleCart() {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: categories } = useCategories();
  const create = useCreateSale();
  const router = useRouter();

  // Etat
  const [cart, setCart] = useState<CartLine[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  // Filtrage produits
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    });
  }, [products, search, categoryFilter]);

  // Raccourcis clavier
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT';

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (cart.length > 0) {
          if (confirm('Vider le panier ?')) {
            setCart([]);
          }
        }
        return;
      }

      if (
        e.key === 'Enter' &&
        !isInput &&
        cart.length > 0 &&
        !create.isPending
      ) {
        e.preventDefault();
        void validate();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, create.isPending, paymentMethod, customerName, customerPhone]);

  // ============ Actions panier ============
  function addProduct(productId: string, quantity = 1) {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      const newQty = existing ? existing.quantity + quantity : quantity;
      if (newQty > product.quantity) {
        toast.error(`Stock insuffisant. Disponible : ${product.quantity}`);
        return prev;
      }
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: newQty } : l,
        );
      }
      return [...prev, { productId, quantity }];
    });

    setJustAdded(productId);
    setTimeout(() => setJustAdded(null), 350);
  }

  function setQuantity(productId: string, qty: number) {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    const clamped = Math.max(0, Math.min(qty, product.quantity));
    if (clamped === 0) {
      removeLine(productId);
      return;
    }
    setCart((prev) =>
      prev.map((l) =>
        l.productId === productId ? { ...l, quantity: clamped } : l,
      ),
    );
  }

  function decrement(productId: string) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity - 1 } : l,
        )
        .filter((l) => l.quantity > 0),
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Vider le panier ?')) {
      setCart([]);
    }
  }

  // Total
  const total = cart.reduce((sum, line) => {
    const product = products?.find((p) => p.id === line.productId);
    if (!product) return sum;
    return sum + parseFloat(product.sellingPrice) * line.quantity;
  }, 0);

  const totalItems = cart.reduce((sum, l) => sum + l.quantity, 0);

  async function validate() {
    if (cart.length === 0) return;
    try {
      await create.mutateAsync({
        items: cart,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      toast.success('Vente enregistrée');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      router.push('/sales');
    } catch (err: unknown) {
      const responseMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response!
              .data!.message
          : undefined;

      toast.error(responseMessage || 'Erreur lors de la vente');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* ============================================
          COLONNE GAUCHE : PRODUITS
          ============================================ */}
      <div className="space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit...  (appuyez sur /)"
            className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="tap absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Effacer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtres categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={categoryFilter === null}
              onClick={() => setCategoryFilter(null)}
            >
              Tous
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={categoryFilter === c.id}
                color={c.color}
                onClick={() =>
                  setCategoryFilter(categoryFilter === c.id ? null : c.id)
                }
              >
                {c.name}
              </FilterChip>
            ))}
          </div>
        )}

        {/* Grille produits */}
        {loadingProducts && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        )}

        {!loadingProducts && filteredProducts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <Package className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {search || categoryFilter
                  ? 'Aucun produit ne correspond'
                  : 'Aucun produit disponible'}
              </p>
            </CardContent>
          </Card>
        )}

        {!loadingProducts && filteredProducts.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((p, index) => {
              const disabled = p.quantity <= 0;
              const staggerClass = `stagger-${Math.min((index % 10) + 1, 10)}`;
              const isAdded = justAdded === p.id;
              const inCart = cart.find((l) => l.productId === p.id);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => !disabled && addProduct(p.id)}
                  disabled={disabled}
                  className={`tap animate-slide-up ${staggerClass} group relative flex flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left transition-all ${
                    disabled
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:border-primary hover:shadow-md'
                  } ${isAdded ? 'ring-2 ring-primary' : ''}`}
                >
                  {inCart && (
                    <span className="absolute right-2 top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-md">
                      {inCart.quantity}
                    </span>
                  )}

                  {isAdded && (
                    <span className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-primary/90 text-primary-foreground animate-pop">
                      <Check className="h-8 w-8" />
                    </span>
                  )}

                  <ProductThumbnail
                    name={p.name}
                    imageUrl={p.imageUrl}
                    size="lg"
                  />

                  <div className="w-full min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(p.sellingPrice)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Stock : {p.quantity}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================
          COLONNE DROITE : PANIER
          ============================================ */}
      <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start">
        <Card className="flex flex-col lg:max-h-[calc(100vh-7rem)]">
          {/* En-tete */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">
                Panier
                {totalItems > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({totalItems})
                  </span>
                )}
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="tap text-xs text-muted-foreground hover:text-destructive"
              >
                Vider
              </button>
            )}
          </div>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4">
            {/* Client */}
            <div className="space-y-2 rounded-lg bg-muted/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Client (optionnel)
              </p>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nom du client"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/60"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Téléphone"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/60"
              />
            </div>

            {/* Lignes du panier */}
            {cart.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-10">
                <p className="text-center text-sm text-muted-foreground">
                  Cliquez sur un produit
                  <br />
                  pour l&apos;ajouter au panier.
                </p>
              </div>
            ) : (
              <ul className="scrollbar-on-hover min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {cart.map((line) => {
                  const product = products?.find(
                    (p) => p.id === line.productId,
                  );
                  if (!product) return null;
                  const lineTotal =
                    parseFloat(product.sellingPrice) * line.quantity;

                  return (
                    <li
                      key={line.productId}
                      className="animate-pop flex items-center gap-2 rounded-lg border bg-card p-2"
                    >
                      <ProductThumbnail
                        name={product.name}
                        imageUrl={product.imageUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(lineTotal)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          onClick={() => decrement(line.productId)}
                          className="tap flex h-7 w-7 items-center justify-center rounded-md border border-input text-muted-foreground hover:border-primary hover:text-primary"
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) =>
                            setQuantity(
                              line.productId,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          min={1}
                          max={product.quantity}
                          className="h-7 w-12 rounded-md border border-input bg-background text-center text-sm outline-none focus:border-primary/60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => addProduct(line.productId)}
                          disabled={line.quantity >= product.quantity}
                          className="tap flex h-7 w-7 items-center justify-center rounded-md border border-input text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeLine(line.productId)}
                          className="tap ml-0.5 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Retirer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Total + paiement + valider */}
            {cart.length > 0 && (
              <div className="shrink-0 space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total
                  </span>
                  <span className="text-xl font-bold tracking-tight">
                    {formatPrice(total)}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Mode de paiement
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus:border-primary/60"
                  >
                    {Object.entries(paymentMethodLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  className="tap h-12 w-full text-base font-semibold"
                  onClick={validate}
                  disabled={create.isPending}
                >
                  {create.isPending ? (
                    'Enregistrement...'
                  ) : (
                    <>
                      Valider la vente
                      <kbd className="ml-2 hidden rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium sm:inline">
                        Entrée
                      </kbd>
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={`tap flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
      }`}
    >
      {color && !active && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  );
}
