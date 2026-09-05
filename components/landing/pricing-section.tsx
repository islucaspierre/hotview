import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const included = [
  "Vitrine digital com produtos e categorias ilimitados",
  "Pedidos direto no WhatsApp, sem comissão por venda",
  "Métricas reais de visitas, pedidos e produto mais pedido",
  "Temas prontos por segmento, com cores personalizáveis",
  "Catálogos de exemplo prontos para duplicar e usar",
]

export function PricingSection() {
  return (
    <section id="planos" className="border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Um plano simples, sem letra miúda
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Teste tudo de graça por 15 dias. Se gostar, continue por um valor fixo — sem comissão
            por pedido.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-primary/30 bg-background p-8 shadow-sm">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            15 dias grátis, sem cartão
          </span>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold text-foreground">R$ 39,70</span>
            <span className="text-sm text-muted-foreground">/mês depois do teste</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Pix ou cartão de crédito. Cancele quando quiser.</p>

          <ul className="mt-6 flex flex-col gap-3">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            className="mt-8 w-full gap-2 rounded-full"
            render={<Link href="/cadastro" />}
            nativeButton={false}
          >
            Começar teste grátis
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
