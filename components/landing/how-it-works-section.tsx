const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Menos de 2 minutos. Sem cartão de crédito.",
  },
  {
    number: "02",
    title: "Monte sua loja",
    description: "Adicione produtos, fotos, preços e categorias — tudo em um painel simples.",
  },
  {
    number: "03",
    title: "Compartilhe seu link",
    description: "Cole no Instagram, WhatsApp, Google, ou gere um QR Code para imprimir.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Como funciona
        </h2>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6">
            <span className="font-display text-4xl font-bold text-primary/30">{step.number}</span>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-pretty text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-lg font-semibold text-foreground">
        E pronto. Você está vendendo online.
      </p>
    </section>
  )
}
