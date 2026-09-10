'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Settings } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/products', label: 'Produits', icon: Package },
  { href: '/sales', label: 'Ventes', icon: ShoppingCart },
  { href: '/settings', label: 'Reglages', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 text-xs ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
