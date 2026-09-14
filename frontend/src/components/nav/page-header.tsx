'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function PageHeader(_props: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { user } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        {/* Recherche (pleine largeur) */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un produit, une vente..."
            className="h-9 w-full rounded-lg border border-input bg-background/60 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="tap relative h-9 w-9 shrink-0 p-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* Avatar utilisateur */}
        <div
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
          title={user?.fullName}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
