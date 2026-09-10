'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts } from '@/lib/queries/use-products';
import { useCreateSale } from '@/lib/queries/use-sales';
import { formatPrice } from '@/lib/products';
import { PaymentMethod, paymentMethodLabels } from '@/lib/sales';

type CartLine = { productId: string; quantity: number };

export function SaleCart() {
  const { data: products } = useProducts();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const create = useCreateSale();
  const router = useRouter();

  function addProduct(productId: string) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
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

  const total = cart.reduce((sum, line) => {
    const product = products?.find((p) => p.id === line.productId);
    if (!product) return sum;
    return sum + parseFloat(product.sellingPrice) * line.quantity;
  }, 0);

  async function validate() {
    if (cart.length === 0) return;
    try {
      await create.mutateAsync({ items: cart, paymentMethod });
      toast.success('Vente enregistrée');
      setCart([]);
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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Colonne gauche : produits disponibles */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Produits disponibles
        </h2>
        {products && products.length > 0 ? (
          <ul className="space-y-2">
            {products.map((p, index) => {
              const disabled = p.quantity <= 0;
              const staggerClass = `stagger-${Math.min(index + 1, 10)}`;
              return (
                <li
                  key={p.id}
                  className={`animate-slide-up ${staggerClass}`}
                >
                  <button
                    type="button"
                    onClick={() => !disabled && addProduct(p.id)}
                    disabled={disabled}
                    className={`tap flex w-full items-center justify-between rounded-lg border bg-card p-3 text-left transition-all duration-150 ${
                      disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:border-primary hover:shadow-sm'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(p.sellingPrice)} · Stock : {p.quantity}
                      </p>
                    </div>
                    <Plus className="ml-2 h-4 w-4 shrink-0 text-primary" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Aucun produit disponible. Ajoutez-en d&apos;abord.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Colonne droite : panier */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Panier
        </h2>
        <Card className="animate-fade-in">
          <CardContent className="space-y-3 p-4">
            {cart.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Cliquez sur un produit pour l&apos;ajouter.
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {cart.map((line) => {
                    const product = products?.find(
                      (p) => p.id === line.productId,
                    );
                    if (!product) return null;
                    return (
                      <li
                        key={line.productId}
                        className="animate-pop flex items-center gap-2 border-b pb-2 last:border-b-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(product.sellingPrice)} × {line.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="tap h-7 w-7 p-0"
                            onClick={() => decrement(line.productId)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {line.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="tap h-7 w-7 p-0"
                            onClick={() => addProduct(line.productId)}
                            disabled={line.quantity >= product.quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="tap h-7 w-7 p-0"
                            onClick={() => removeLine(line.productId)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="animate-pop">{formatPrice(total)}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Mode de paiement
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as PaymentMethod)
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      {Object.entries(paymentMethodLabels).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <Button
                    className="tap w-full"
                    onClick={validate}
                    disabled={create.isPending}
                  >
                    {create.isPending
                      ? 'Enregistrement...'
                      : 'Valider la vente'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}