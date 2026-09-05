const dialogues = [
  '“Me manda o cardápio?”',
  '“Esse preço ainda é esse?”',
  '“Tem esse produto?”',
]

export function PainPointsSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
        Seu cliente ainda precisa pedir o cardápio pelo WhatsApp?
      </h2>

      <div className="mt-8 flex flex-col items-center gap-3">
        {dialogues.map((d) => (
          <div
            key={d}
            className="inline-flex rounded-2xl rounded-bl-none border border-border/60 bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm"
          >
            {d}
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-xl mx-auto text-pretty text-muted-foreground">
        Se seu cliente precisa te chamar no WhatsApp antes de pedir, você está perdendo vendas.
        Cada pergunta é uma oportunidade de desistência.
      </p>
    </section>
  )
}
