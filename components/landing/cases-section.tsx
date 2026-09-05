import { storeMetrics } from "@/lib/mock-data"

export function CasesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Resultado real de quem já usa
        </h2>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="flex flex-col gap-0 sm:flex-row">
          {/* Info */}
          <div className="flex flex-col justify-center gap-6 p-8 sm:w-1/2">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Case</p>
              <h3 className="font-display text-2xl font-bold text-foreground">Ki Batatas</h3>
              <p className="text-sm text-muted-foreground">Batatas recheadas — São Paulo, SP</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-2xl font-bold text-foreground">
                  {storeMetrics.totalViews.toLocaleString("pt-BR")}
                </span>
                <span className="text-xs text-muted-foreground">visitas</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-2xl font-bold text-foreground">
                  {storeMetrics.ordersSent}
                </span>
                <span className="text-xs text-muted-foreground">pedidos enviados</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-2xl font-bold text-foreground">
                  {Math.round(storeMetrics.conversionRate * 100)}%
                </span>
                <span className="text-xs text-muted-foreground">conversão</span>
              </div>
            </div>

            <blockquote className="border-l-2 border-primary/40 pl-4 text-sm italic text-muted-foreground">
              "Antes meu cliente me mandava mensagem perguntando o cardápio. Agora ele abre o link e já manda o pedido pronto."
            </blockquote>
          </div>

          {/* Visual accent */}
          <div className="flex items-center justify-center bg-primary/5 p-8 sm:w-1/2">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-6xl">🥔</span>
              <p className="font-display text-lg font-bold text-foreground">Ki Batatas</p>
              <p className="text-sm text-muted-foreground">hotview.com.br/loja/ki-batatas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
