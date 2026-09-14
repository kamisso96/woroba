import { Product } from '@/lib/products';

export function StockBadge({
  product,
  className = '',
}: {
  product: Pick<Product, 'quantity' | 'alertThreshold'>;
  className?: string;
}) {
  const out = product.quantity <= 0;
  const low = !out && product.quantity <= product.alertThreshold;

  const styles = out
    ? 'bg-destructive/15 text-destructive border-destructive/20'
    : low
    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-500 border-amber-500/20'
    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 border-emerald-500/20';

  const label = out ? 'Rupture' : low ? 'Stock faible' : 'En stock';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          out ? 'bg-destructive' : low ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />
      {label}
    </span>
  );
}
