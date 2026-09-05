import { MessageCircle, BarChart3, Paintbrush, Smartphone, Ban, Timer } from "lucide-react"

const features = [
  {
    icon: MessageCircle,
    title: "Pedido direto no WhatsApp",
    description: "O cliente monta o carrinho na vitrine e finaliza com uma mensagem pronta.",
  },
  {
    icon: BarChart3,
    title: "Métricas de verdade",
    description: "Acompanhe visitas, pedidos iniciados, conversão e o produto mais pedido.",
  },
  {
    icon: Paintbrush,
    title: "Personalização completa",
    description: "Troque cores, tema e capa da loja sem depender de ninguém.",
  },
  {
    icon: Smartphone,
    title: "Feita para celular",
    description: "Seu cliente pede do jeito que já usa: no navegador do celular, sem baixar app.",
  },
  {
    icon: Ban,
    title: "Sem comissão por pedido",
    description: "Diferente de marketplace, você não perde margem em cada venda.",
  },
  {
    icon: Timer,
    title: "Pronta em minutos",
    description: "Cadastre produtos e publique sua vitrine no mesmo dia.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Tudo que seu negócio precisa para vender online
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
