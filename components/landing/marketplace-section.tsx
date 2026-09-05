import { X, Check } from "lucide-react"

const marketplaceItems = [
  "Concorre com outros vendedores",
  "Paga comissão por pedido",
  "O cliente é do app, não da sua marca",
  "Dependente das regras da plataforma",
]

const hotviewItems = [
  "Seu link, sua marca",
  "Mensalidade fixa, sem comissão",
  "Seu cliente te segue no WhatsApp",
  "Você controla seu negócio",
]

export function MarketplaceSection() {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Venda pelo seu próprio canal.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {/* Marketplace */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Marketplace (iFood, Rappi...)
            </p>
            <ul className="flex flex-col gap-3">
              {marketplaceItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Hotview */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 ring-1 ring-primary/20">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
              Hotview
            </p>
            <ul className="flex flex-col gap-3">
              {hotviewItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Você não precisa abandonar os marketplaces. Tenha também seu próprio canal de vendas.
        </p>
      </div>
    </section>
  )
}
