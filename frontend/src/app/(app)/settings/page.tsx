'use client';

import { PageHeader } from '@/components/nav/page-header';
import { PreferencesCard } from '@/components/settings/preferences-card';
import { NotificationsCard } from '@/components/settings/notifications-card';
import { DisplayCard } from '@/components/settings/display-card';
import { ShortcutsCard } from '@/components/settings/shortcuts-card';
import { ResetCard } from '@/components/settings/reset-card';

export default function SettingsPage() {
  return (
    <>
      <PageHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Paramètres
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personnalisez votre expérience Wôrôba.
          </p>
        </div>

        <PreferencesCard />
        <NotificationsCard />
        <DisplayCard />
        <ShortcutsCard />
        <ResetCard />
      </main>
    </>
  );
}
