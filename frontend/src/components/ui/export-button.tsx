'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileType, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadExport, ExportFormat, ExportType } from '@/lib/export';
import { toast } from 'sonner';

const options: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { format: 'csv', label: 'CSV', icon: <FileText className="h-4 w-4" /> },
  { format: 'xlsx', label: 'Excel', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { format: 'pdf', label: 'PDF', icon: <FileType className="h-4 w-4" /> },
];

export function ExportButton({ type }: { type: ExportType }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Ferme au clic exterieur
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Ferme au scroll / resize
  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  async function handleDownload(format: ExportFormat) {
    setOpen(false);
    setLoading(format);
    try {
      await downloadExport(type, format);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur export');
    } finally {
      setLoading(null);
    }
  }

  const isBusy = loading !== null;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        className="tap"
        onClick={() => setOpen((v) => !v)}
        disabled={isBusy}
        aria-expanded={open}
      >
        {isBusy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Exporter
      </Button>

      {open && !isBusy && (
        <div className="animate-fade-in absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border bg-card shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.format}
              onClick={() => handleDownload(opt.format)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
