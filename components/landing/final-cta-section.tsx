import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Pronto para colocar seu negócio para vender online?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
          Crie sua vitrine digital, compartilhe o link e receba pedidos diretamente no WhatsApp.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="gap-2 rounded-full px-6"
            render={<Link href="/cadastro" />}
            nativeButton={false}
          >
            Criar minha vitrine grátis
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <p className="text-xs text-muted-foreground">
            15 dias grátis, sem cartão de crédito. Depois, R$ 39,70/mês.
          </p>
        </div>
      </div>
    </section>
  )
}
