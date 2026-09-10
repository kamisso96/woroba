'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSale, fetchSale, fetchSales, SaleInput } from '../sales';

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => fetchSale(id),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaleInput) => createSale(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['movements'] });
    },
  });
}
