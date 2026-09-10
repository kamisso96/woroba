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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">Woroba</h1>
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
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