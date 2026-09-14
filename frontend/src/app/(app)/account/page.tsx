'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/nav/page-header';
import { ProfileTab } from '@/components/account/profile-tab';
import { PasswordTab } from '@/components/account/password-tab';
import { ShopTab } from '@/components/account/shop-tab';
import { DangerZone } from '@/components/account/danger-zone';

type Tab = 'profile' | 'password' | 'shop';

const tabs: { value: Tab; label: string }[] = [
  { value: 'profile', label: 'Profil' },
  { value: 'password', label: 'Securite' },
  { value: 'shop', label: 'Boutique' },
];

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <>
      <PageHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Mon compte
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez votre profil, votre securite et votre boutique.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 border-b">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`tap relative px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.value
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              {tab === t.value && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-t-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="animate-fade-in">
          {tab === 'profile' && <ProfileTab />}
          {tab === 'password' && <PasswordTab />}
          {tab === 'shop' && <ShopTab />}
        </div>

        {/* Zone dangereuse */}
        <DangerZone />
      </main>
    </>
  );
}
