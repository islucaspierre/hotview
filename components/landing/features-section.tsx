const benefits = [
  {
    emoji: "🛍️",
    title: "Sua loja online",
    description: "Produtos, categorias, fotos, preços e adicionais em uma página profissional.",
  },
  {
    emoji: "💬",
    title: "Pedido pelo WhatsApp",
    description: "Seu cliente monta o carrinho e envia o pedido pronto para você.",
  },
  {
    emoji: "📊",
    title: "Saiba o que está acontecendo",
    description: "Veja visitas, pedidos iniciados, conversão e produtos mais acessados.",
  },
  {
    emoji: "🎨",
    title: "Sua marca",
    description: "Logo, cores, capa e identidade da sua empresa.",
  },
  {
    emoji: "📱",
    title: "Perfeita no celular",
    description: "Seu cliente compra pelo navegador, sem baixar aplicativo.",
  },
  {
    emoji: "💰",
    title: "Sem comissão",
    description: "Você paga uma mensalidade fixa, independentemente de quanto vende.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Tudo que você precisa para vender online
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6">
              <span className="text-3xl">{benefit.emoji}</span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
