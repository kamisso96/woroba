'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Regex email
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = email.trim().length === 0 || EMAIL_REGEX.test(email.trim());
  const emailError = email.trim().length > 0 && !emailValid;

  const formValid = email.trim().length > 0 && emailValid && password.length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (emailError) {
      toast.error('Format d\'email invalide.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Connexion réussie');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        typeof error.response?.data?.message === 'string' &&
        error.response.data.message
          ? error.response.data.message
          : 'Connexion impossible. Vérifiez vos identifiants.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {/* Champ email */}
      <div className="relative">
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=" "
          required
          autoComplete="email"
          className={`peer h-14 w-full rounded-full border bg-white pl-11 pr-4 pt-5 pb-1 text-sm text-slate-700 outline-none transition-all focus:ring-4 ${
            emailError
              ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
              : 'border-slate-200 focus:border-primary focus:ring-primary/10'
          }`}
        />
        <Mail
          className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            emailError
              ? 'text-red-400'
              : 'text-slate-400 peer-focus:text-primary'
          }`}
        />
        <label
          htmlFor="login-email"
          className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-medium peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-medium"
        >
          Email
        </label>
      </div>

      {/* Message d'erreur email */}
      {emailError && (
        <div className="animate-fade-in -mt-1 flex min-h-[16px] justify-end pr-1">
          <span className="inline-flex items-center gap-1 text-[11px] text-red-500">
            <X className="h-3 w-3" />
            Format d&apos;email invalide
          </span>
        </div>
      )}

      {/* Champ mot de passe */}
      <div className="relative">
        <input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          required
          autoComplete="current-password"
          className="peer h-14 w-full rounded-full border border-slate-200 bg-white pl-11 pr-12 pt-5 pb-1 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-primary" />
        <label
          htmlFor="login-password"
          className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-medium peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-medium"
        >
          Mot de passe
        </label>
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          aria-label={
            showPassword
              ? 'Masquer le mot de passe'
              : 'Afficher le mot de passe'
          }
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Lien mot de passe oublié */}
      <div className="flex justify-end pr-1">
        <Link
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-[11px] text-slate-400 transition-colors hover:text-primary"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      {/* Bouton principal */}
      <button
        type="submit"
        disabled={loading || !formValid}
        className="h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connexion...
          </span>
        ) : (
          'Log In'
        )}
      </button>
    </form>
  );
}
