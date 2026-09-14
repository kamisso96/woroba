'use client';

import { toast } from 'sonner';
import { Globe, Calendar, Hash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/lib/settings-context';
import { DateFormat, Locale, NumberFormat } from '@/lib/settings';

export function PreferencesCard() {
  const { preferences, setPreference } = useSettings();

  function update<K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K],
    label: string,
  ) {
    setPreference(key, value);
    toast.success(`${label} mis à jour`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4" />
          Préférences générales
        </CardTitle>
        <CardDescription>
          Personnalisez l&apos;affichage de l&apos;application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Langue */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Label htmlFor="locale" className="text-sm font-medium">
              Langue
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Langue de l&apos;interface.
            </p>
          </div>
          <select
            id="locale"
            value={preferences.locale}
            onChange={(e) => update('locale', e.target.value as Locale, 'Langue')}
            className="h-9 w-40 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          >
            <option value="fr">Français</option>
            <option value="en">English (bientôt)</option>
          </select>
        </div>

        {/* Format de date */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Label
              htmlFor="dateFormat"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <Calendar className="h-3.5 w-3.5" />
              Format de date
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Comment les dates sont affichées.
            </p>
          </div>
          <select
            id="dateFormat"
            value={preferences.dateFormat}
            onChange={(e) =>
              update(
                'dateFormat',
                e.target.value as DateFormat,
                'Format de date',
              )
            }
            className="h-9 w-40 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          >
            <option value="dd/MM/yyyy">JJ/MM/AAAA</option>
            <option value="MM/dd/yyyy">MM/JJ/AAAA</option>
            <option value="yyyy-MM-dd">AAAA-MM-JJ</option>
          </select>
        </div>

        {/* Format des nombres */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Label
              htmlFor="numberFormat"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <Hash className="h-3.5 w-3.5" />
              Format des nombres
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Séparateurs de milliers et décimales.
            </p>
          </div>
          <select
            id="numberFormat"
            value={preferences.numberFormat}
            onChange={(e) =>
              update(
                'numberFormat',
                e.target.value as NumberFormat,
                'Format des nombres',
              )
            }
            className="h-9 w-40 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
          >
            <option value="fr-FR">1 234,56 (FR)</option>
            <option value="en-US">1,234.56 (US)</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
