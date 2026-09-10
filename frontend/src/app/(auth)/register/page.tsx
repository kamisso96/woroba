import Link from 'next/link';
import { RegisterForm } from '../../../components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Wôrôba</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez votre boutique en 30 secondes.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">Créer un compte</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Gratuit, aucune carte bancaire requise
          </p>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
