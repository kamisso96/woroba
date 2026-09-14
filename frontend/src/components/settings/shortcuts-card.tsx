'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  ShoppingBag,
  Users,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const shortcuts = [
  {
    href: '/account',
    icon: User,
    label: 'Mon compte',
    description: 'Profil, email, mot de passe',
  },
  {
    href: '/shops',
    icon: Building2,
    label: 'Mes boutiques',
    description: 'Gérer vos points de vente',
  },
  {
    href: '/products',
    icon: ShoppingBag,
    label: 'Produits',
    description: 'Gérer votre catalogue',
  },
  {
    href: '/help',
    icon: Users,
    label: 'Aide & support',
    description: 'Guide, FAQ, contact',
  },
];

export function ShortcutsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Raccourcis</CardTitle>
        <CardDescription>
          Accédez rapidement aux pages essentielles.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {shortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="tap flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
