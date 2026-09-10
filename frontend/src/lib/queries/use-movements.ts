'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMovement,
  fetchMovements,
  MovementInput,
  MovementType,
} from '../movements';

export function useMovements(params?: { productId?: string; type?: MovementType }) {
  return useQuery({
    queryKey: ['movements', params?.productId ?? '', params?.type ?? ''],
    queryFn: () => fetchMovements(params),
  });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementInput) => createMovement(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}
