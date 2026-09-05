import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Entrar | Hotview",
  description: "Acesse o painel da sua loja para gerenciar produtos, personalização e pedidos.",
}

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Área do lojista"
      title="Entrar na sua conta"
      description="Acesse o painel para gerenciar sua vitrine e seus produtos."
    >
      <LoginForm />
    </AuthShell>
  )
}
