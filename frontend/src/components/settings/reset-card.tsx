'use client';

import { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSettings } from '@/lib/settings-context';

export function ResetCard() {
  const { resetPreferences } = useSettings();
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    resetPreferences();
    toast.success('Préférences réinitialisées');
    setConfirming(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </CardTitle>
        <CardDescription>
          Rétablir toutes les préférences aux valeurs par défaut.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <Button
            variant="outline"
            className="tap"
            onClick={() => setConfirming(true)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser les préférences
          </Button>
        ) : (
          <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm">
                Cela réinitialisera toutes vos préférences (langue, format,
                notifications, apparence). Votre compte et vos données ne sont
                pas affectés.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="tap flex-1"
                onClick={() => setConfirming(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="tap flex-1"
                onClick={handleReset}
              >
                Confirmer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
