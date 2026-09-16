'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  MessageCircle,
  MoreVertical,
  Printer,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { SHOP_COOKIE } from '@/lib/api';
import { Sale } from '@/lib/sales';
import { formatPrice } from '@/lib/products';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

async function fetchReceiptBlob(saleId: string): Promise<Blob> {
  const token = Cookies.get('accessToken');
  const shopId = Cookies.get(SHOP_COOKIE);

  if (!token) {
    toast.error('Session expirée. Reconnectez-vous.');
    window.location.href = '/login';
    throw new Error('No token');
  }

  const res = await fetch(`${API_URL}/sales/${saleId}/receipt`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(shopId ? { 'X-Shop-Id': shopId } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Échec de la génération du reçu (${res.status})`);
  }

  return res.blob();
}

export function ReceiptActions({ sale }: { sale: Sale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Détecte la disponibilité du partage natif de fichiers
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (typeof navigator !== 'undefined' && 'canShare' in navigator) {
        try {
          const testFile = new File(['test'], 'test.pdf', {
            type: 'application/pdf',
          });
          setCanShare(navigator.canShare?.({ files: [testFile] }) === true);
        } catch {
          setCanShare(false);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Ferme au clic extérieur
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const shortId = sale.id.slice(0, 8).toUpperCase();
  const filename = `woroba-recu-${shortId}.pdf`;

  // ============================================
  // 1. IMPRIMER
  // ============================================
  async function handlePrint() {
    setBusy('print');
    try {
      const blob = await fetchReceiptBlob(sale.id);
      const url = URL.createObjectURL(blob);

      // Crée un iframe caché avec le PDF
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = url;
      iframeRef.current = iframe;

      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        document.body.appendChild(iframe);
        // Sécurité si onload ne se déclenche jamais
        setTimeout(resolve, 2000);
      });

      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Fallback : ouvrir dans un nouvel onglet
        window.open(url, '_blank');
      }

      // Nettoyage différé (laisse le temps à l'utilisateur d'imprimer)
      setTimeout(() => {
        if (iframeRef.current?.parentNode) {
          iframeRef.current.parentNode.removeChild(iframeRef.current);
        }
        iframeRef.current = null;
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur impression');
    } finally {
      setBusy(null);
    }
  }

  // ============================================
  // 2. WHATSAPP
  // ============================================
  async function handleWhatsApp() {
    setBusy('whatsapp');
    try {
      const blob = await fetchReceiptBlob(sale.id);
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Si Web Share API dispo : partage direct (WhatsApp apparait dans la liste)
      if (
        typeof navigator !== 'undefined' &&
        'canShare' in navigator &&
        
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: `Reçu ${shortId}`,
            text: `Reçu de vente - ${formatPrice(sale.totalAmount)}`,
          });
          return;
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') return;
          // Sinon on passe au fallback
        }
      }

      // Fallback desktop : télécharger + ouvrir WhatsApp Web
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      const message = encodeURIComponent(
        `Bonjour, voici votre reçu de vente (${formatPrice(
          sale.totalAmount,
        )}). Je vous joins le PDF.`,
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
      toast.info('Reçu téléchargé. Joignez-le à la conversation WhatsApp.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(null);
    }
  }

  // ============================================
  // 3. PARTAGER (natif)
  // ============================================
  async function handleShare() {
    setMenuOpen(false);
    setBusy('share');
    try {
      const blob = await fetchReceiptBlob(sale.id);
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (
        typeof navigator !== 'undefined' &&
        'canShare' in navigator &&
        
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Reçu ${shortId}`,
          text: `Reçu de vente - ${formatPrice(sale.totalAmount)}`,
        });
      }
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        toast.error(err instanceof Error ? err.message : 'Erreur');
      }
    } finally {
      setBusy(null);
    }
  }

  const isBusy = busy !== null;

  return (
    <div className="flex items-center gap-0.5">
      {/* ⋯ Menu (partage natif) */}
      {canShare && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="tap flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Autres actions"
            aria-expanded={menuOpen}
            disabled={isBusy}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="animate-fade-in absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-lg border bg-card shadow-lg">
              <button
                onClick={handleShare}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <Share2 className="h-4 w-4" />
                <span>Partager</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🖨️ Imprimer */}
      <button
        onClick={handlePrint}
        disabled={isBusy}
        className="tap flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Imprimer le reçu"
        title="Imprimer"
      >
        {busy === 'print' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
      </button>

      {/* 💬 WhatsApp */}
      <button
        onClick={handleWhatsApp}
        disabled={isBusy}
        className="tap flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-emerald-600"
        aria-label="Envoyer par WhatsApp"
        title="Envoyer par WhatsApp"
      >
        {busy === 'whatsapp' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
