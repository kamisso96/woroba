'use client';

import { ExternalLink, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function GithubIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.71 1.26 3.37.96.11-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12 24 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function AboutCard() {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
            W
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">Wôrôba</p>
            <p className="text-xs text-muted-foreground">
              Version 1.0 · Vague 1
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Wôrôba est un outil de gestion de stock simple et rapide, pensé pour
          les entrepreneurs indépendants, petits commerçants et vendeurs en
          ligne. Objectif : vous faire gagner du temps au quotidien et éviter
          les ruptures de stock.
        </p>

        <div className="space-y-2 border-t pt-4 text-xs">
          <a
            href="https://github.com/kamisso96/woroba"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>Code source sur GitHub</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-destructive" />
            <span>Fait avec soin pour les entrepreneurs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
