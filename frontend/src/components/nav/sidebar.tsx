'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, RefreshCw } from 'lucide-react';

const items = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/products', label: 'Produits', icon: Package },
  { href: '/sales', label: 'Ventes', icon: ShoppingCart },
  { href: '/movements', label: 'Stock', icon: RefreshCw },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-primary">
          Wôrôba
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Gestion de stock simple
        </p>
      </div>
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`tap flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform duration-200 ${
                      active ? 'scale-110' : ''
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
