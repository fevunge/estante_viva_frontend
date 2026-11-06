import { Navigate } from "react-router-dom";
import { Show, SignIn, SignUp } from "@clerk/react";
import { BookMarked, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { ClerkOnly } from "@/components/auth/clerkReady";

function AuthShell({
  children,
  title,
  text,
  admin = false,
}: {
  children: React.ReactNode;
  title: string;
  text: string;
  admin?: boolean;
}) {
  const Icon = admin ? ShieldCheck : BookMarked;
  return (
    <div className="min-h-screen bg-mocha-base">
      <SiteHeader />
      <div className="mx-auto grid max-w-[1100px] gap-10 px-5 py-12 lg:grid-cols-2 lg:py-20">
        <div className="hidden flex-col justify-center lg:flex">
          <span
            className={`grid h-12 w-12 place-items-center rounded-xl ${admin ? "bg-mocha-magenta/15 text-mocha-magenta" : "bg-mocha-blue/15 text-mocha-blue"}`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-mocha-text">
            {title}
          </h1>
          <p className="mt-3 max-w-sm text-mocha-white">{text}</p>
        </div>
        <div className="flex items-center justify-center" data-testid="auth-card">
          <ClerkOnly
            fallback={
              <p className="text-sm text-mocha-white" data-testid="auth-loading">
                Carregando…
              </p>
            }
          >
            {children}
          </ClerkOnly>
        </div>
      </div>
    </div>
  );
}

export function ReaderSignIn() {
  return (
    <AuthShell
      title="Bem-vindo de volta"
      text="Entre para continuar de onde parou, com suas anotações e marcadores em cada livro."
    >
      <Show when="signed-in">
        <Navigate to="/" replace />
      </Show>
      <Show when="signed-out">
        <SignIn
          routing="path"
          path="/entrar"
          signUpUrl="/sign-up"
          withSignUp
          fallbackRedirectUrl="/"
        />
      </Show>
    </AuthShell>
  );
}

export function AdminLogin() {
  return (
    <AuthShell
      admin
      title="Entrar na administração"
      text="Área restrita ao administrador da Estante Viva. Aqui você publica, edita e remove os livros da galeria."
    >
      <Show when="signed-in">
        <Navigate to="/admin" replace />
      </Show>
      <Show when="signed-out">
        <SignIn
          routing="path"
          path="/admin/login"
          signUpUrl="/sign-up"
          withSignUp
          forceRedirectUrl="/admin"
        />
      </Show>
    </AuthShell>
  );
}

export function ReaderSignUp() {
  return (
    <AuthShell
      title="Crie sua conta grátis"
      text="Com uma conta você anota cada página, marca as partes importantes e vê seus livros em andamento na estante “Continue lendo”."
    >
      <SignUp routing="path" path="/sign-up" signInUrl="/entrar" fallbackRedirectUrl="/" />
    </AuthShell>
  );
}
