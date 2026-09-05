import Link from "next/link"
import { ArrowRight, PlayCircle, Zap, TrendingUp, Timer, CalendarCheck, Star, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StaticStorePreview } from "@/components/landing/static-store-preview"

const highlights = [
  { icon: TrendingUp, label: "Mais vendas pelo WhatsApp" },
  { icon: Timer, label: "Setup rápido em minutos" },
  { icon: CalendarCheck, label: "15 dias grátis sem cartão de crédito" },
]

const trustBadges = [
  { icon: CalendarCheck, label: "15 dias grátis, sem cartão" },
  { icon: Star, label: "Sem taxa por pedido" },
  { icon: MessageCircle, label: "Integração com WhatsApp" },
]

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        className="pointer-events-none absolute inset-x-0 top-[-12rem] -z-10 h-[420px] rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <span className="mx-auto flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:mx-0">
            <Zap className="size-3.5 fill-primary" />
            Tecnologia simples para pequenos negócios
          </span>

          <h1 className="mx-auto max-w-xl font-display text-4xl font-bold text-balance text-foreground sm:text-5xl lg:mx-0 lg:text-6xl">
            Sua vitrine digital para vender direto pelo <span className="text-primary">WhatsApp</span>
          </h1>

          <p className="mx-auto max-w-lg text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">
            A Hotview ajuda pequenos negócios a criarem sua própria vitrine digital e venderem diretamente pelo WhatsApp — com autonomia, praticidade e sem depender de marketplace.
          </p>

          <div className="grid w-full grid-cols-3 gap-3 sm:max-w-lg">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-2 py-4 text-center"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-pretty text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row lg:mx-0">
            <Button
              size="lg"
              className="gap-2 rounded-full px-6"
              render={<Link href="/cadastro" />}
              nativeButton={false}
            >
              Começar grátis
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-full px-6"
              render={<Link href="#demonstracao" />}
              nativeButton={false}
            >
              <PlayCircle className="size-4" />
              Ver demonstração
            </Button>
          </div>

          <div className="mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-sm text-muted-foreground lg:mx-0 lg:justify-start">
            {trustBadges.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <item.icon className="size-4 text-primary" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div
            className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <StaticStorePreview />

          <div className="pointer-events-none absolute -bottom-4 -right-3 hidden flex-col items-center gap-1.5 sm:flex">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_32px_var(--primary)]">
              <MessageCircle className="size-7" />
            </span>
            <span className="max-w-24 text-center text-xs font-medium text-pretty text-primary">
              Venda direto pelo WhatsApp
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
