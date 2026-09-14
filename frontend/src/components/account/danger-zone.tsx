'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDeleteAccount } from '@/lib/queries/use-account';
import { useAuth } from '@/lib/auth-context';

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const del = useDeleteAccount();
  const { logout } = useAuth();
  const router = useRouter();

  async function handleDelete() {
    if (confirmation !== 'SUPPRIMER') {
      toast.error('Tapez SUPPRIMER pour confirmer.');
      return;
    }
    try {
      await del.mutateAsync();
      toast.success('Compte supprime');
      await logout();
      router.replace('/login');
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: { message?: string };
        };
      };

      toast.error(error.response?.data?.message || 'Erreur');
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Zone dangereuse
        </CardTitle>
        <CardDescription>
          La suppression du compte est definitive. Toutes vos donnees
          (produits, ventes, mouvements) seront effacees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <Button
            variant="destructive"
            className="tap"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer mon compte
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">
              Tapez <span className="font-mono font-bold">SUPPRIMER</span> pour
              confirmer :
            </p>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="SUPPRIMER"
              className="h-11"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="tap flex-1"
                onClick={() => {
                  setConfirming(false);
                  setConfirmation('');
                }}
                disabled={del.isPending}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                className="tap flex-1"
                onClick={handleDelete}
                disabled={del.isPending || confirmation !== 'SUPPRIMER'}
              >
                {del.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Confirmer'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
