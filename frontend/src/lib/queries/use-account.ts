'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  deleteAccount,
  fetchMe,
  fetchMyShop,
  updateMe,
  updateMyShop,
} from '../account';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
  });
}

export function useMyShop() {
  return useQuery({
    queryKey: ['my-shop'],
    queryFn: fetchMyShop,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUpdateMyShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyShop,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-shop'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}
