const badges = [
  { emoji: "💰", text: "Sem comissão por venda" },
  { emoji: "💳", text: "Sem cartão no cadastro" },
  { emoji: "🎁", text: "15 dias grátis" },
  { emoji: "⚡", text: "Pronta em minutos" },
]

export function QuickProofSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30 py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {badges.map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="text-base">{emoji}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
