import { api } from './api';

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
};

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

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await api.get('/users/me');
  return data;
}

export async function updateMe(input: {
  email?: string;
  fullName?: string;
}): Promise<UserProfile> {
  const { data } = await api.patch('/users/me', input);
  return data;
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean }> {
  const { data } = await api.patch('/users/me/password', input);
  return data;
}

export async function deleteAccount(): Promise<{ success: boolean }> {
  const { data } = await api.delete('/users/me');
  return data;
}

export async function fetchMyShop(): Promise<Shop> {
  const { data } = await api.get('/shop');
  return data;
}

export async function updateMyShop(input: {
  name?: string;
  currency?: string;
  address?: string;
  logoUrl?: string;
}): Promise<Shop> {
  const { data } = await api.patch('/shop', input);
  return data;
}

export const currencies = [
  { code: 'XOF', label: 'F CFA (XOF)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'Dollar US (USD)' },
  { code: 'MAD', label: 'Dirham marocain (MAD)' },
  { code: 'GNF', label: 'Franc guineen (GNF)' },
  { code: 'CDF', label: 'Franc congolais (CDF)' },
];
