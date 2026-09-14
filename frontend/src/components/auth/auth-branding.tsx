import { Package, TrendingUp, Bell, CheckCircle2 } from 'lucide-react';

export function AuthBranding() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Cercles decoratifs en arriere-plan */}
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      {/* Logo */}
      <div className="relative">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Wôrôba
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Gestion de stock pour entrepreneurs
        </p>
      </div>

      {/* Contenu central */}
      <div className="relative space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Suivez votre stock,
            <br />
            développez votre activité.
          </h2>
          <p className="max-w-md text-sm text-white/80">
            L&apos;outil simple et rapide qui vous aide à éviter les ruptures
            et à mieux vendre, chaque jour.
          </p>
        </div>

        <ul className="space-y-4">
          <Feature
            icon={Package}
            title="Suivi en temps réel"
            description="Sachez exactement ce qui vous reste en stock."
          />
          <Feature
            icon={TrendingUp}
            title="Ventes enregistrées en 3 clics"
            description="Encaissez et décrémentez automatiquement."
          />
          <Feature
            icon={Bell}
            title="Alertes de rupture"
            description="Soyez prévenu avant de manquer de marchandise."
          />
        </ul>
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-2 text-xs text-white/60">
        <CheckCircle2 className="h-4 w-4" />
        <span>Gratuit · Sans engagement · Données sécurisées</span>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-white/70">{description}</p>
      </div>
    </li>
  );
}
