import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const SHOP_COOKIE = 'woroba_shop_id';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const shopId = Cookies.get(SHOP_COOKIE);
  if (shopId && config.headers) {
    config.headers['X-Shop-Id'] = shopId;
  }
  return config;
});

// Evite les appels multiples a /auth/refresh en parallele
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) return null;
    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });
      Cookies.set('accessToken', data.accessToken);
      Cookies.set('refreshToken', data.refreshToken);
      return data.accessToken as string;
    } catch {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove(SHOP_COOKIE);
      localStorage.removeItem('woroba_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type RetriedAxiosRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriedAxiosRequestConfig | undefined;

    const url = originalRequest?.url ?? '';
    if (url.startsWith('/auth/')) {
      return Promise.reject(error);
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (!newToken) {
        return Promise.reject(error);
      }
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

/**
 * Convertit un chemin relatif (/uploads/xxx.jpg) en URL absolue
 * utilisable par <img src="..." />.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_URL.replace('/api/v1', '');
  return `${base}${path}`;
}