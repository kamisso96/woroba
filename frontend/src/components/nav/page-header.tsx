'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    toast.success('A bientot !');
    router.replace('/login');
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.fullName}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Se deconnecter
          </Button>
        </div>
      </div>
    </header>
  );
}
