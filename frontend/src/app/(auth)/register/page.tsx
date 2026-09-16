import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

// Meme image que le login
const BACKGROUND_URL =
  'https://plus.unsplash.com/premium_photo-1699555730185-06ae7d1e0b4f?q=80&w=1600&auto=format&fit=crop';

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.35 11.1H12v3.2h5.35c-.23 1.42-1.66 4.16-5.35 4.16-3.22 0-5.85-2.66-5.85-5.94s2.63-5.94 5.85-5.94c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.7 4.13 14.55 3.2 12 3.2 6.87 3.2 2.7 7.35 2.7 12.5s4.17 9.3 9.3 9.3c5.37 0 8.93-3.77 8.93-9.08 0-.62-.07-1.1-.15-1.62z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.92 3.78-3.92 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.9 3.5h3.3l-7.2 8.3 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.3l7.7-8.8L1 3.5h6.8L12.7 10 18.9 3.5zm-1.2 17.6h1.8L6.5 5.3H4.5l13.2 15.8z" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-950">
      {/* === Fond : photo floutee + overlay emeraude === */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: `url(${BACKGROUND_URL})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-800/85 via-emerald-900/80 to-emerald-950/90"
        aria-hidden="true"
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden="true"
      />

      {/* === Contenu === */}
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6)] md:min-h-[600px] md:grid-cols-2">
          {/* --- Panneau gauche : photo + vague --- */}
          <div className="relative hidden overflow-hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BACKGROUND_URL}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 bg-emerald-600/65 mix-blend-multiply"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-emerald-700/25 to-emerald-900/45"
              aria-hidden="true"
            />

            {/* Vague blanche verticale */}
            <svg
              className="absolute right-0 top-0 h-full w-32 translate-x-[1px] md:w-40"
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 100 0
                   C 30 80, 15 180, 45 280
                   C 75 380, 95 480, 65 580
                   C 35 680, 5 780, 40 880
                   C 55 930, 80 970, 100 1000
                   L 100 1000 L 100 0 Z"
                fill="white"
              />
            </svg>

            {/* Tagline sur la photo */}
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <p className="text-sm font-medium text-white/95">
                Rejoignez Wôrôba aujourd&apos;hui.
              </p>
              <p className="mt-1 text-xs text-white/70">
                Gratuit · Sans engagement · Données sécurisées
              </p>
            </div>
          </div>

          {/* --- Panneau droit : formulaire --- */}
          <div className="flex items-center justify-center bg-white p-8 sm:p-10 lg:p-14">
            <div className="w-full max-w-sm">
              {/* Logo mobile */}
              <div className="mb-6 text-center md:hidden">
                <span className="text-2xl font-bold tracking-tight text-primary">
                  Wôrôba
                </span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl font-normal tracking-tight text-slate-800 sm:text-5xl">
                S&apos;inscrire
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Créez votre compte pour commencer
              </p>

              {/* Formulaire */}
              <RegisterForm />

              {/* Lien connexion */}
              <p className="mt-6 text-center text-sm text-slate-500">
                Vous avez déjà un compte ?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Se connecter!
                </Link>
              </p>

              {/* Icones reseaux sociaux */}
              <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
                <button
                  type="button"
                  aria-label="Continuer avec Google"
                  className="transition-colors hover:text-primary"
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  aria-label="Continuer avec Facebook"
                  className="transition-colors hover:text-primary"
                >
                  <FacebookIcon />
                </button>
                <button
                  type="button"
                  aria-label="Continuer avec Twitter"
                  className="transition-colors hover:text-primary"
                >
                  <TwitterIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
