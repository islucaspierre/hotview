import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="bg-primary py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold text-balance text-primary-foreground sm:text-4xl">
          Seu negócio merece uma loja online.
        </h2>
        <p className="mt-4 text-pretty text-primary-foreground/80">
          Crie sua gratuitamente e comece a vender pelo WhatsApp.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full gap-2 px-8 text-base"
            render={<Link href="/cadastro" />}
            nativeButton={false}
          >
            Criar minha loja grátis
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-sm text-primary-foreground/70">
            15 dias grátis, sem cartão de crédito. Depois, R$&nbsp;39,70/mês.
          </p>
        </div>
      </div>
    </section>
  )
}
