import { api } from './api';

export type Category = {
  id: string;
  shopId: string;
  name: string;
  color: string | null;
  createdAt: string;
  _count?: { products: number };
};

export type Product = {
  id: string;
  shopId: string;
  categoryId: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
  purchasePrice: string;
  sellingPrice: string;
  quantity: number;
  alertThreshold: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
};

export type ProductInput = {
  name: string;
  categoryId?: string | null;
  sku?: string;
  barcode?: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  alertThreshold: number;
  unit: string;
};

export async function fetchProducts(search?: string): Promise<Product[]> {
  const { data } = await api.get('/products', { params: search ? { search } : {} });
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post('/products', input);
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const { data } = await api.patch(`/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories');
  return data;
}

export async function createCategory(name: string, color?: string): Promise<Category> {
  const { data } = await api.post('/categories', { name, color });
  return data;
}

export async function updateCategory(
  id: string,
  input: { name?: string; color?: string },
): Promise<Category> {
  const { data } = await api.patch(`/categories/${id}`, input);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export function formatPrice(value: string | number, currency = 'XOF'): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function getStockStatus(product: Product): 'out' | 'low' | 'ok' {
  if (product.quantity <= 0) return 'out';
  if (product.quantity <= product.alertThreshold) return 'low';
  return 'ok';
}
