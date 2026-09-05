import { X, Check } from "lucide-react"

const painPoints = [
  "Cliente baixa um PDF pesado e desatualizado",
  "Preços errados porque ninguém lembrou de editar o arquivo",
  "Zero dados sobre quem visitou ou o que mais vende",
  "Pedido some no meio de outras conversas do WhatsApp",
]

const gains = [
  "Vitrine sempre atualizada, direto do celular",
  "Preços e fotos editados em segundos, sem reenviar nada",
  "Métricas de visitas, produtos e conversão em tempo real",
  "Pedido chega formatado e pronto no WhatsApp da loja",
]

export function PainPointsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          O cardápio em PDF já cansou o seu cliente
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Se o seu negócio ainda vive de print, arquivo e mensagem perdida, é hora de dar um
          upgrade sem complicação.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-muted-foreground">Com PDF e print</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {painPoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <X className="size-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-primary">Com a Hotview</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {gains.map((gain) => (
              <li key={gain} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3" />
                </span>
                {gain}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
