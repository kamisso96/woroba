'use client';

import { toast } from 'sonner';
import { Bell, Mail, Newspaper, Volume2 } from 'lucide-react';
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

export function NotificationsCard() {
  const { preferences, setPreference } = useSettings();

  function update(key: keyof typeof preferences, value: boolean, label: string) {
    setPreference(key, value);
    toast.success(`${label} ${value ? 'activé' : 'désactivé'}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
        <CardDescription>
          Choisissez comment vous souhaitez être averti.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <NotificationRow
          icon={<Mail className="h-3.5 w-3.5" />}
          label="Alertes stock par email"
          description="Recevez un email quand un produit atteint son seuil critique."
          checked={preferences.emailAlerts}
          onChange={(v) => update('emailAlerts', v, 'Alertes email')}
        />

        <NotificationRow
          icon={<Newspaper className="h-3.5 w-3.5" />}
          label="Résumé hebdomadaire"
          description="Un récapitulatif de votre activité tous les lundis matin."
          checked={preferences.weeklyDigest}
          onChange={(v) => update('weeklyDigest', v, 'Résumé hebdomadaire')}
        />

        <NotificationRow
          icon={<Volume2 className="h-3.5 w-3.5" />}
          label="Sons d'interface"
          description="Retour sonore lors des actions importantes."
          checked={preferences.soundEnabled}
          onChange={(v) => update('soundEnabled', v, 'Sons')}
        />
      </CardContent>
    </Card>
  );
}

function NotificationRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
