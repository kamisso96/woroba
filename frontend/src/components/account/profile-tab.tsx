'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, User } from 'lucide-react';
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
import { useMe, useUpdateMe } from '@/lib/queries/use-account';
import { useAuth } from '@/lib/auth-context';

export function ProfileTab() {
  const { data: me, isLoading } = useMe();
  const update = useUpdateMe();
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

    useEffect(() => {
    if (!me) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setFullName(me.fullName);
      setEmail(me.email);
    });
    return () => {
      cancelled = true;
    };
  }, [me]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await update.mutateAsync({ fullName, email });
      // Mettre a jour le localStorage pour reflet immediat dans le header
      localStorage.setItem('woroba_user', JSON.stringify(updated));
      toast.success('Profil mis a jour');
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      toast.error(error.response?.data?.message || 'Erreur');
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Chargement...
        </CardContent>
      </Card>
    );
  }

  const dirty = me && (me.fullName !== fullName || me.email !== email);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Ces informations apparaissent dans votre profil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="tap h-11 w-full"
            disabled={update.isPending || !dirty}
          >
            {update.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
