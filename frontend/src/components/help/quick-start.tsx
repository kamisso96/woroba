'use client';

import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  RefreshCw,
  Store,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Store,
    number: 1,
    title: 'Configurez votre boutique',
    description: 'Ajoutez le nom de votre boutique, la devise et l\'adresse.',
    href: '/shops',
    cta: 'Mes boutiques',
  },
  {
    icon: Package,
    number: 2,
    title: 'Ajoutez vos produits',
    description:
      'Créez votre catalogue avec les prix d\'achat, de vente et le stock initial.',
    href: '/products/new',
    cta: 'Ajouter un produit',
  },
  {
    icon: RefreshCw,
    number: 3,
    title: 'Enregistrez vos mouvements',
    description:
      'Réapprovisionnements, pertes, ajustements : gardez un historique précis.',
    href: '/movements',
    cta: 'Voir les mouvements',
  },
  {
    icon: ShoppingCart,
    number: 4,
    title: 'Encaissez vos ventes',
    description:
      'Le stock se décrémente automatiquement à chaque vente enregistrée.',
    href: '/sales/new',
    cta: 'Nouvelle vente',
  },
];

export function QuickStart() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.number} className="card-interactive">
            <CardContent className="flex gap-3 p-4">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {s.number}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.description}
                </p>
                <Link
                  href={s.href}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {s.cta}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
