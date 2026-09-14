import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthBranding } from "@/components/auth/auth-branding";

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBranding />

      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Wôrôba
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Créez votre boutique en 30 secondes.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Créer un compte
              </h2>
              <p className="text-sm text-muted-foreground">
                Gratuit, aucune carte bancaire requise.
              </p>
            </div>

            <RegisterForm />

            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
