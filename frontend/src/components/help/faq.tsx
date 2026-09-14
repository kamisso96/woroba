'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: 'Comment ajouter un produit à mon catalogue ?',
    answer:
      'Allez dans « Produits » puis cliquez sur « Ajouter ». Remplissez le nom, les prix d\'achat et de vente, le stock initial et le seuil d\'alerte (le niveau à partir duquel vous voulez être prévenu).',
  },
  {
    question: 'Comment enregistrer une vente ?',
    answer:
      'Cliquez sur le bouton « Vendre » en haut à droite, ou allez dans « Ventes » puis « Vendre ». Ajoutez les produits au panier, ajustez les quantités, choisissez le mode de paiement et validez. Le stock se met à jour automatiquement.',
  },
  {
    question: 'Quelle est la différence entre un mouvement et une vente ?',
    answer:
      'Une vente est un type particulier de mouvement de stock (sortie). Les mouvements couvrent aussi les entrées (réapprovisionnement, retour client) et les ajustements (perte, casse, don). Utilisez les mouvements pour tout ce qui n\'est pas une vente.',
  },
  {
    question: 'Puis-je gérer plusieurs boutiques ?',
    answer:
      'Oui. Allez dans « Mes boutiques » pour en créer plusieurs. Utilisez le sélecteur en haut de la sidebar pour basculer entre elles. Chaque boutique a ses propres produits, ventes et mouvements.',
  },
  {
    question: 'Que se passe-t-il si je supprime une catégorie ?',
    answer:
      'Les produits liés ne sont pas supprimés, mais ils perdent leur catégorie. Vous pourrez toujours les retrouver dans la liste des produits.',
  },
  {
    question: 'Comment changer ma devise (F CFA, Euro...) ?',
    answer:
      'Allez dans « Mes boutiques », sélectionnez la boutique et cliquez sur l\'icône crayon. Vous pouvez y modifier le nom, la devise et l\'adresse.',
  },
  {
    question: 'Comment réinitialiser mon mot de passe ?',
    answer:
      'Allez dans « Mon compte » (via l\'icône utilisateur en haut à droite), onglet « Sécurité ». Vous pourrez changer votre mot de passe en indiquant l\'ancien.',
  },
  {
    question: 'Mes données sont-elles sauvegardées ?',
    answer:
      'Oui, toutes vos données sont enregistrées de manière sécurisée sur nos serveurs. Nous effectuons des sauvegardes régulières.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="tap flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium">{f.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="animate-fade-in px-4 pb-4 pt-0 text-sm text-muted-foreground">
                    {f.answer}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
