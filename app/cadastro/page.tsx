import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Criar conta | Hotview",
  description: "Crie sua vitrine digital gratuita e comece a receber pedidos pelo WhatsApp.",
}

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Comece agora"
      title="Crie sua vitrine gratuita"
      description="Em poucos minutos seu cardápio estará pronto para receber pedidos."
    >
      <SignupForm />
    </AuthShell>
  )
}
