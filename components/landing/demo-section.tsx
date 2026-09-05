import { storeMetrics } from "@/lib/mock-data"
import { formatNumber, formatPercent } from "@/lib/format"

const stats = [
  { label: "Visitas na vitrine", value: formatNumber(storeMetrics.totalViews) },
  { label: "Pedidos enviados", value: formatNumber(storeMetrics.ordersSent) },
  { label: "Taxa de conversão", value: formatPercent(storeMetrics.conversionRate) },
]

export function DemoSection() {
  return (
    <section id="demonstracao" className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        Exemplo real
      </span>
      <h2 className="mt-4 font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
        Veja uma vitrine digital rodando na Hotview
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
        A vitrine da Ki Batatas foi criada na Hotview e transforma o catálogo do negócio em uma
        experiência simples de compra pelo WhatsApp.
      </p>

      <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-pretty text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
