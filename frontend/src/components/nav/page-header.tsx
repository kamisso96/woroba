'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Monitor,
  Moon,
  Search,
  Settings,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
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
    <header className="sticky top-0 z-30 bg-card">
      <div className="flex items-center gap-3 px-6 py-5 lg:px-8">
        {/* Recherche — limitée à gauche */}
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un produit, une vente..."
            className="h-10 w-full rounded-lg border border-input bg-background/60 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background"
          />
        </div>

        {/* Spacer — pousse les icônes à droite */}
        <div className="flex-1" />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="tap relative h-10 w-10 shrink-0 p-0"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        {/* Avatar + menu custom */}
        <UserMenu
          initials={initials}
          fullName={user?.fullName}
          email={user?.email}
        />
      </div>
    </header>
  );
}

function UserMenu({
  initials,
  fullName,
  email,
}: {
  initials: string;
  fullName?: string;
  email?: string;
}) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary outline-none transition-colors hover:bg-primary/25"
        aria-label="Menu utilisateur"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className="animate-fade-in absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-card shadow-lg">
          {/* En-tête : nom + email */}
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>

          {/* Paramètres du compte */}
          <button
            onClick={() => {
              setOpen(false);
              router.push('/account');
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            <span>Paramètres du compte</span>
          </button>

          {/* Thème — 3 boutons en ligne */}
          <div className="border-t px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Thème
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <ThemeButton
                label="Clair"
                icon={<Sun className="h-5 w-5" />}
                active={theme === 'light'}
                onClick={() => setTheme('light')}
              />
              <ThemeButton
                label="Sombre"
                icon={<Moon className="h-5 w-5" />}
                active={theme === 'dark'}
                onClick={() => setTheme('dark')}
              />
              <ThemeButton
                label="Auto"
                icon={<Monitor className="h-5 w-5" />}
                active={theme === 'system'}
                onClick={() => setTheme('system')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`tap flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors ${
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
