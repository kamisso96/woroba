import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Woroba</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerez votre stock, simplement.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold">Connexion</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Accedez a votre boutique
          </p>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Creer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}