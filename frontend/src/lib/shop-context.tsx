'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import { SHOP_COOKIE } from './api';
import { fetchShops, Shop } from './shops';
import { useAuth } from './auth-context';

type ShopContextType = {
  shops: Shop[];
  activeShop: Shop | null;
  loading: boolean;
  setActiveShop: (shopId: string) => void;
  refreshShops: () => Promise<void>;
};

const ShopContext = createContext<ShopContextType | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Charge les boutiques quand l'utilisateur est connecte
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Deconnecte : on nettoie
      queueMicrotask(() => {
        setShops([]);
        setActiveShopId(null);
        setLoading(false);
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const list: Shop[] = await fetchShops();
        if (cancelled) return;

        queueMicrotask(() => {
          if (cancelled) return;
          setShops(list);

          if (list.length === 0) {
            setActiveShopId(null);
            Cookies.remove(SHOP_COOKIE);
            setLoading(false);
            return;
          }

          const cookieShopId = Cookies.get(SHOP_COOKIE);
          const validShopId =
            cookieShopId && list.some((s: Shop) => s.id === cookieShopId)
              ? cookieShopId
              : list[0].id;

          Cookies.set(SHOP_COOKIE, validShopId);
          setActiveShopId(validShopId);
          setLoading(false);
        });
      } catch {
        if (cancelled) return;
        queueMicrotask(() => {
          if (cancelled) return;
          setLoading(false);
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const setActiveShop = useCallback(
    (shopId: string) => {
      if (shopId === activeShopId) return;
      Cookies.set(SHOP_COOKIE, shopId);
      setActiveShopId(shopId);
      // Invalider toutes les queries liees a la boutique
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale'] });
    },
    [activeShopId, queryClient],
  );

  const refreshShops = useCallback(async () => {
    const list = await fetchShops();
    setShops(list);
    if (list.length > 0 && !list.some((s) => s.id === activeShopId)) {
      // La boutique active n'existe plus
      const firstId = list[0].id;
      Cookies.set(SHOP_COOKIE, firstId);
      setActiveShopId(firstId);
    }
  }, [activeShopId]);

  const activeShop = shops.find((s) => s.id === activeShopId) ?? null;

  return (
    <ShopContext.Provider
      value={{ shops, activeShop, loading, setActiveShop, refreshShops }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShopContext() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShopContext must be used within ShopProvider');
  return ctx;
}
