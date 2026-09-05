import { X, Check } from "lucide-react"

const withoutHotview = [
  "Cliente pede o cardápio pelo WhatsApp",
  "Você envia foto ou PDF",
  "Cliente escolhe e pede",
  "Você anota o pedido manualmente",
]

const withHotview = [
  "Cliente acessa o link da sua loja",
  "Vê produtos, fotos e preços",
  "Monta o carrinho",
  "Envia o pedido pronto pelo WhatsApp",
]

export function SolutionSection() {
  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
            Com a Hotview, seu cliente abre o link e compra.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {/* Sem Hotview */}
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sem Hotview
            </p>
            <ul className="flex flex-col gap-3">
              {withoutHotview.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Com Hotview */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 ring-1 ring-primary/20">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
              Com a Hotview
            </p>
            <ul className="flex flex-col gap-3">
              {withHotview.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
