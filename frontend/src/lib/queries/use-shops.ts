'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createShop,
  deleteShop,
  fetchShop,
  fetchShops,
  ShopInput,
  ShopUpdateInput,
  updateShop,
} from '../shops';

export function useShops() {
  return useQuery({
    queryKey: ['shops'],
    queryFn: fetchShops,
  });
}

export function useShop(id: string) {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => fetchShop(id),
    enabled: !!id,
  });
}

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ShopInput) => createShop(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}

export function useUpdateShop(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ShopUpdateInput) => updateShop(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shops'] });
      qc.invalidateQueries({ queryKey: ['shop', id] });
    },
  });
}

export function useDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShop(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}
