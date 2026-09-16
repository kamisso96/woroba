import { api } from './api';

export type Shop = {
  id: string;
  ownerId: string;
  name: string;
  currency: string;
  address: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShopInput = {
  name: string;
  currency?: string;
  address?: string;
  logoUrl?: string;
};

export type ShopUpdateInput = Partial<ShopInput>;

export async function fetchShops(): Promise<Shop[]> {
  const { data } = await api.get('/shops');
  return data;
}

export async function fetchShop(id: string): Promise<Shop> {
  const { data } = await api.get(`/shops/${id}`);
  return data;
}

export async function createShop(input: ShopInput): Promise<Shop> {
  const { data } = await api.post('/shops', input);
  return data;
}

export async function updateShop(
  id: string,
  input: ShopUpdateInput,
): Promise<Shop> {
  const { data } = await api.patch(`/shops/${id}`, input);
  return data;
}

export async function deleteShop(id: string): Promise<{ success: boolean }> {
  const { data } = await api.delete(`/shops/${id}`);
  return data;
}

export const currencies = [
  { code: 'XOF', label: 'F CFA (XOF)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'Dollar US (USD)' },
  { code: 'MAD', label: 'Dirham marocain (MAD)' },
  { code: 'GNF', label: 'Franc guinéen (GNF)' },
  { code: 'CDF', label: 'Franc congolais (CDF)' },
];
