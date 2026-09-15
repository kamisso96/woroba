'use client';

import Link from 'next/link';
import { BookOpen, LifeBuoy, Info } from 'lucide-react';
import { PageHeader } from '@/components/nav/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickStart } from '@/components/help/quick-start';
import { Faq } from '@/components/help/faq';
import { AboutCard } from '@/components/help/about-card';

export default function HelpPage() {
  return (
    <>
      <PageHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-6 py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Aide
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Guides, questions fréquentes et support.
          </p>
        </div>

        {/* Guide de démarrage rapide */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Démarrage rapide</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Les 4 étapes pour être opérationnel en moins de 5 minutes.
          </p>
          <QuickStart />
        </section>

        {/* FAQ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Questions fréquentes</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Les réponses aux questions les plus courantes.
          </p>
          <Faq />
        </section>

        {/* À propos */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">À propos</h2>
          </div>
          <AboutCard />
        </section>

        {/* Contact rapide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Besoin d&apos;aide supplémentaire ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Si vous ne trouvez pas la réponse à votre question, n&apos;hésitez
              pas à nous contacter :
            </p>
            <ul className="space-y-1">
              <li>
                📧 Email :{' '}
                <a
                  href="mailto:dramanekmaissodiakite@gmail.com"
                  className="font-medium text-primary hover:underline"
                >
                  support@woroba.app
                </a>
              </li>
              <li>💬 WhatsApp : disponible prochainement</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
