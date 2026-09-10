'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { MovementForm } from './movement-form';

export function MovementDialog({
  productId,
  label = 'Mouvement de stock',
  variant = 'outline',
  size = 'sm',
}: {
  productId: string;
  label?: string;
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        {label}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Nouveau mouvement</SheetTitle>
            <SheetDescription>
              Entree, sortie ou ajustement de stock
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <MovementForm productId={productId} onSuccess={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
