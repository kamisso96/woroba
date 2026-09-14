'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RefreshCw,
  Tag,
  Truck,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
};

const mainItems: NavItem[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/products', label: 'Produits', icon: Package },
  { href: '/sales', label: 'Ventes', icon: ShoppingCart },
  { href: '/movements', label: 'Mouvements', icon: RefreshCw },
];

const manageItems: NavItem[] = [
  { href: '/categories', label: 'Catégories', icon: Tag, soon: true },
  { href: '/suppliers', label: 'Fournisseurs', icon: Truck, soon: true },
  { href: '/reports', label: 'Rapports', icon: BarChart3, soon: true },
];

const bottomItems: NavItem[] = [
  { href: '/settings', label: 'Paramètres', icon: Settings, soon: true },
  { href: '/help', label: 'Aide', icon: HelpCircle, soon: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    toast.success('À bientôt !');
    router.replace('/login');
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      {/* Logo */}
      <div className="shrink-0 p-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-xl font-bold tracking-tight text-primary">
            Wôrôba
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Gestion de stock
          </p>
        </Link>
      </div>

      {/* Navigation scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <Section items={mainItems} pathname={pathname} />

        <div className="my-4 border-t" />

        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Gestion
        </p>
        <Section items={manageItems} pathname={pathname} />

        <div className="my-4 border-t" />

        <Section items={bottomItems} pathname={pathname} />
      </nav>

      {/* Utilisateur + Logout (toujours visible en bas) */}
      <div className="shrink-0 border-t p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="tap flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

function Section({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            {item.soon ? (
              <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                  Bientôt
                </span>
              </div>
            ) : (
              <Link
                href={item.href}
                className={`tap flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/15 text-primary'
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
            )}
          </li>
        );
      })}
    </ul>
  );
}
