'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ShopProvider } from '@/lib/shop-context';
import { SettingsProvider } from '@/lib/settings-context';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          <SettingsProvider>
            {children}
            <Toaster richColors position="top-right" />
          </SettingsProvider>
        </ShopProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
