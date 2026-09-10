import { api } from './api';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export type Movement = {
  id: string;
  productId: string;
  shopId: string;
  type: MovementType;
  quantityChange: number;
  reason: string | null;
  reference: string | null;
  createdById: string;
  createdAt: string;
  product: { id: string; name: string; unit: string };
  createdBy: { fullName: string };
};

export type MovementInput = {
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
};

export async function fetchMovements(params?: {
  productId?: string;
  type?: MovementType;
}): Promise<Movement[]> {
  const { data } = await api.get('/stock-movements', { params });
  return data;
}

export async function createMovement(input: MovementInput): Promise<Movement> {
  const { data } = await api.post('/stock-movements', input);
  return data;
}
