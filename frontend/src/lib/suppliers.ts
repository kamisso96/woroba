import { api } from './api';

export type Supplier = {
  id: string;
  shopId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
};

export type SupplierInput = {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export async function fetchSuppliers(search?: string): Promise<Supplier[]> {
  const { data } = await api.get('/suppliers', {
    params: search ? { search } : {},
  });
  return data;
}

export async function fetchSupplier(id: string): Promise<Supplier> {
  const { data } = await api.get(`/suppliers/${id}`);
  return data;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const { data } = await api.post('/suppliers', input);
  return data;
}

export async function updateSupplier(
  id: string,
  input: Partial<SupplierInput>,
): Promise<Supplier> {
  const { data } = await api.patch(`/suppliers/${id}`, input);
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}
