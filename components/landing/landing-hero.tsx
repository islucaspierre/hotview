import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StaticStorePreview } from "@/components/landing/static-store-preview"

export function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        {/* Text column */}
        <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <h1 className="font-display text-4xl font-bold text-balance text-foreground sm:text-5xl lg:text-6xl">
            Transforme seu WhatsApp em uma{" "}
            <span className="text-primary">loja online.</span>
          </h1>

          <p className="max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl">
            Crie sua loja online, receba pedidos pelo WhatsApp e venda sem pagar comissão por pedido.
          </p>

          <p className="text-sm font-medium text-muted-foreground">
            Sua loja profissional pronta em poucos minutos.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start">
            <Button size="lg" className="rounded-full gap-2 px-8 text-base" render={<Link href="/cadastro" />} nativeButton={false}>
              Criar minha loja grátis
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full gap-2" render={<a href="#demonstracao" />} nativeButton={false}>
              Ver como funciona
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 lg:justify-start">
            {["Sem comissão por venda", "Sem aplicativo para o cliente", "Pedidos direto no WhatsApp"].map((badge) => (
              <span key={badge} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="text-primary font-bold">✓</span>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Mockup column — oculto no mobile (já aparece na seção "Veja como fica") */}
        <div className="hidden w-full justify-center lg:flex lg:w-auto lg:flex-none">
          <StaticStorePreview />
        </div>
      </div>
    </section>
  )
}
