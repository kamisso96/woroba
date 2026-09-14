'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useChangePassword } from '@/lib/queries/use-account';
import { useAuth } from '@/lib/auth-context';

export function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const change = useChangePassword();
  const { logout } = useAuth();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await change.mutateAsync({ currentPassword, newPassword });
      toast.success('Mot de passe change. Reconnectez-vous.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Deconnecter (les refresh tokens ont ete invalides cote backend)
      setTimeout(async () => {
        await logout();
        router.replace('/login');
      }, 1200);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : 'Erreur';

      toast.error(message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
        <CardDescription>
          Apres le changement, vous serez deconnecte pour des raisons de securite.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Mot de passe actuel</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="current"
                type={show ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 pl-9 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="tap absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                aria-label={show ? 'Masquer' : 'Afficher'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new">Nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new"
                type={show ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 pl-9"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum 6 caracteres.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer le nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm"
                type={show ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pl-9"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="tap h-11 w-full"
            disabled={change.isPending}
          >
            {change.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changement...
              </>
            ) : (
              'Changer le mot de passe'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
