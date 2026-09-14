'use client';

export type Locale = 'fr' | 'en';
export type DateFormat = 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
export type NumberFormat = 'fr-FR' | 'en-US';

export type UserPreferences = {
  locale: Locale;
  dateFormat: DateFormat;
  numberFormat: NumberFormat;
  emailAlerts: boolean;
  weeklyDigest: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
};

export const defaultPreferences: UserPreferences = {
  locale: 'fr',
  dateFormat: 'dd/MM/yyyy',
  numberFormat: 'fr-FR',
  emailAlerts: true,
  weeklyDigest: false,
  soundEnabled: true,
  compactMode: false,
};

const STORAGE_KEY = 'woroba_preferences';

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaultPreferences;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw);
    return { ...defaultPreferences, ...parsed };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
