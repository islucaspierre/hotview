import { Palette, ListPlus, Share2 } from "lucide-react"

const steps = [
  {
    icon: Palette,
    title: "Escolha o tema do seu negócio",
    description:
      "Selecione uma paleta pronta para o seu segmento — hamburgueria, açaí, pizzaria e mais — ou deixe no padrão premium.",
  },
  {
    icon: ListPlus,
    title: "Cadastre seus produtos",
    description:
      "Adicione fotos, preços, categorias e adicionais em poucos minutos, direto do celular ou computador.",
  },
  {
    icon: Share2,
    title: "Compartilhe o link e receba pedidos",
    description:
      "Envie o link da vitrine nas redes sociais. O cliente monta o pedido e ele chega prontinho no seu WhatsApp.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Do cadastro ao primeiro pedido em três passos
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Sem precisar contratar desenvolvedor nem entender de tecnologia.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border/60 bg-background p-6"
            >
              <span className="font-display text-sm font-bold text-primary/50">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
