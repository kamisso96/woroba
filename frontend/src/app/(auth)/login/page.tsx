import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthBranding } from "@/components/auth/auth-branding";

export default function LoginPage() {
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
              Gérez votre stock, simplement.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Bon retour
              </h2>
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour accéder à votre boutique.
              </p>
            </div>

            <LoginForm />

            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
