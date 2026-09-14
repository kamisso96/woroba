'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Plus, Settings, Store } from 'lucide-react';
import { useShopContext } from '@/lib/shop-context';

export function ShopSelector() {
  const { shops, activeShop, setActiveShop } = useShopContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (shops.length === 0) {
    return (
      <Link
        href="/shops/new"
        className="tap flex items-center gap-2 rounded-lg border border-dashed border-input px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        <span>Ajouter une boutique</span>
      </Link>
    );
  }

  const initials = activeShop?.name
    ? activeShop.name
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap flex w-full items-center gap-2 rounded-lg border bg-background/60 px-2.5 py-2 text-left transition-colors hover:border-primary/50"
        aria-expanded={open}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[10px] font-semibold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">
            {activeShop?.name ?? 'Boutique'}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {activeShop?.currency ?? ''}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="animate-fade-in absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-card shadow-lg">
          <p className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mes boutiques
          </p>

          <ul className="max-h-56 overflow-y-auto py-1">
            {shops.map((s) => {
              const active = s.id === activeShop?.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      setActiveShop(s.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted ${
                      active ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{s.name}</span>
                    {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-t">
            <Link
              href="/shops"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Gérer mes boutiques</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
