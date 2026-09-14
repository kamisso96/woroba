'use client';

import { toast } from 'sonner';
import { Layout, Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/lib/settings-context';

export function DisplayCard() {
  const { preferences, setPreference } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4" />
          Apparence
        </CardTitle>
        <CardDescription>
          Choisissez le thème et le confort visuel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Theme */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Label className="text-sm font-medium">Thème</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Clair, sombre ou automatique selon votre système.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-1">
            <ThemeBtn
              icon={<Sun className="h-4 w-4" />}
              active={theme === 'light'}
              onClick={() => setTheme('light')}
              label="Clair"
            />
            <ThemeBtn
              icon={<Moon className="h-4 w-4" />}
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
              label="Sombre"
            />
            <ThemeBtn
              icon={<Monitor className="h-4 w-4" />}
              active={theme === 'system'}
              onClick={() => setTheme('system')}
              label="Auto"
            />
          </div>
        </div>

        {/* Mode compact */}
        <div className="flex items-start justify-between gap-4 border-t pt-5">
          <div className="min-w-0 flex-1">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Layout className="h-3.5 w-3.5" />
              Mode compact
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Affiche plus de contenu à l&apos;écran (listes plus denses).
            </p>
          </div>
          <Switch
            checked={preferences.compactMode}
            onCheckedChange={(v) => {
              setPreference('compactMode', v);
              toast.success(`Mode compact ${v ? 'activé' : 'désactivé'}`);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`tap flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
