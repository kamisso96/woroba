import { api } from './api';

export type PaymentMethod = 'CASH' | 'MOBILE_MONEY' | 'CARD' | 'OTHER';

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: { id: string; name: string; unit: string };
};

export type Sale = {
  id: string;
  shopId: string;
  sellerId: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  saleItems: SaleItem[];
  seller?: { fullName: string };
};

export type SaleInput = {
  items: { productId: string; quantity: number }[];
  paymentMethod?: PaymentMethod;
};

export async function fetchSales(): Promise<Sale[]> {
  const { data } = await api.get('/sales');
  return data;
}

export async function fetchSale(id: string): Promise<Sale> {
  const { data } = await api.get(`/sales/${id}`);
  return data;
}

export async function createSale(input: SaleInput): Promise<Sale> {
  const { data } = await api.post('/sales', input);
  return data;
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Especes',
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte',
  OTHER: 'Autre',
};
