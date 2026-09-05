import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  "Loja online com produtos, fotos e preços",
  "Pedidos direto no WhatsApp",
  "Painel de métricas (visitas, conversão)",
  "Personalização de marca (logo, cores, capa)",
  "Sem comissão por pedido",
]

export function PricingSection() {
  return (
    <section id="planos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Seu próprio canal de vendas por menos de R$&nbsp;1,33 por dia.
        </h2>
        <p className="max-w-xl text-pretty text-muted-foreground">
          15 dias grátis. Depois, apenas R$&nbsp;39,70/mês. Sem comissão por pedido.
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-sm rounded-2xl border border-primary/30 bg-card p-8 ring-1 ring-primary/20 shadow-lg">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Plano único</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-5xl font-bold text-foreground">R$&nbsp;39,70</span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          <p className="text-sm text-muted-foreground">ou R$&nbsp;1,33/dia — menos do que um café</p>
        </div>

        <ul className="mt-6 flex flex-col gap-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" className="w-full rounded-full gap-2" render={<Link href="/cadastro" />} nativeButton={false}>
            Criar minha loja grátis
            <ArrowRight className="size-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            15 dias grátis, sem cartão de crédito.
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Marketplaces cobram entre 12% e 30% de comissão por pedido.{" "}
        Com a Hotview, você paga mensalidade fixa — independentemente de quanto vende.
      </p>
    </section>
  )
}
