'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const MIN_LENGTH = 8;

type PasswordRule = {
  id: string;
  label: string;
  test: (v: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: `${MIN_LENGTH} caractères minimum`, test: (v) => v.length >= MIN_LENGTH },
  { id: 'upper', label: 'Une majuscule', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Une minuscule', test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'Un chiffre', test: (v) => /[0-9]/.test(v) },
  { id: 'special', label: 'Un caractère spécial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Regex email
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = email.trim().length === 0 || EMAIL_REGEX.test(email.trim());
  const emailError = email.trim().length > 0 && !emailValid;

  // Validation en temps reel
  const passwordChecks = PASSWORD_RULES.map((r) => ({
    ...r,
    passed: r.test(password),
  }));
  const passwordValid = passwordChecks.every((c) => c.passed);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword;

  const formValid =
    passwordValid &&
    passwordsMatch &&
    fullName.trim().length > 0 &&
    emailValid &&
    email.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordValid) {
      const missing = passwordChecks
        .filter((c) => !c.passed)
        .map((c) => c.label.toLowerCase())
        .join(', ');
      toast.error(`Mot de passe non conforme. Manque : ${missing}.`);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim());
      toast.success('Bienvenue sur Wôrôba !');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : 'Inscription impossible. Réessayez.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      {/* Champ nom complet */}
      <div className="relative">
        <input
          id="register-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder=" "
          required
          autoComplete="name"
          className="peer h-14 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 pt-5 pb-1 text-sm text-slate-700 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-primary" />
        <label
          htmlFor="register-name"
          className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-medium peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-medium"
        >
          Nom complet
        </label>
      </div>

      {/* Champ email */}
      <div className="relative">
        <input
          id="register-email"
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
          htmlFor="register-email"
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
          id="register-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          required
          minLength={MIN_LENGTH}
          autoComplete="new-password"
          className={`peer h-14 w-full rounded-full border bg-white pl-11 pr-12 pt-5 pb-1 text-sm text-slate-700 outline-none transition-all focus:ring-4 ${
            password.length > 0 && !passwordValid
              ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
              : 'border-slate-200 focus:border-primary focus:ring-primary/10'
          }`}
        />
        <Lock
          className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            password.length > 0 && !passwordValid
              ? 'text-red-400'
              : 'text-slate-400 peer-focus:text-primary'
          }`}
        />
        <label
          htmlFor="register-password"
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

      {/* Règles du mot de passe — visibles tant que toutes ne sont pas respectees */}
      {!passwordValid && (
        <ul className="animate-fade-in -mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5 pl-1">
          {passwordChecks.map((rule) => (
            <li
              key={rule.id}
              className={`inline-flex items-center gap-1.5 text-[11px] transition-colors ${
                rule.passed
                  ? 'text-emerald-600'
                  : password.length > 0
                  ? 'text-red-500'
                  : 'text-slate-400'
              }`}
            >
              {rule.passed ? (
                <Check className="h-3 w-3 shrink-0" />
              ) : (
                <X className="h-3 w-3 shrink-0" />
              )}
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Champ confirmation mot de passe */}
      <div className="relative">
        <input
          id="register-confirm"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder=" "
          required
          autoComplete="new-password"
          className={`peer h-14 w-full rounded-full border bg-white pl-11 pr-12 pt-5 pb-1 text-sm text-slate-700 outline-none transition-all focus:ring-4 ${
            confirmError
              ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
              : passwordsMatch
              ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/10'
              : 'border-slate-200 focus:border-primary focus:ring-primary/10'
          }`}
        />
        <Lock
          className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            confirmError
              ? 'text-red-400'
              : passwordsMatch
              ? 'text-emerald-500'
              : 'text-slate-400 peer-focus:text-primary'
          }`}
        />
        <label
          htmlFor="register-confirm"
          className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-slate-400 transition-all duration-200 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-medium peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-medium"
        >
          Confirmer le mot de passe
        </label>
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          aria-label={
            showConfirm
              ? 'Masquer le mot de passe'
              : 'Afficher le mot de passe'
          }
        >
          {showConfirm ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Indicateur d'erreur — visible seulement si les mots de passe different */}
      {confirmError && (
        <div className="animate-fade-in -mt-1 flex min-h-[16px] justify-end pr-1">
          <span className="inline-flex items-center gap-1 text-[11px] text-red-500">
            <X className="h-3 w-3" />
            Les mots de passe ne correspondent pas
          </span>
        </div>
      )}

      {/* Bouton principal */}
      <button
        type="submit"
        disabled={loading || !formValid}
        className="h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Création...
          </span>
        ) : (
          "S'inscrire"
        )}
      </button>
    </form>
  );
}
