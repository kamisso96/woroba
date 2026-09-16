import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { SHOP_COOKIE } from './api';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type ExportType = 'products' | 'sales' | 'movements';

const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV',
  xlsx: 'Excel',
  pdf: 'PDF',
};

/**
 * Telecharge un export depuis l'API et declenche le telechargement cote navigateur.
 */
export async function downloadExport(
  type: ExportType,
  format: ExportFormat,
): Promise<void> {
  const token = Cookies.get('accessToken');
  const shopId = Cookies.get(SHOP_COOKIE);

  if (!token) {
    toast.error('Session expiree. Reconnectez-vous.');
    window.location.href = '/login';
    return;
  }

  const url = `${API_URL}/export/${type}?format=${format}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(shopId ? { 'X-Shop-Id': shopId } : {}),
    },
  });

  if (!res.ok) {
    let message = `Echec de l'export (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  // Recupere le nom depuis Content-Disposition si present
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename =
    match?.[1] ??
    `woroba-${type}-${new Date().toISOString().slice(0, 10)}.${format}`;

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Libere la memoire
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

  toast.success(`Export ${formatLabels[format]} telecharge`);
}
