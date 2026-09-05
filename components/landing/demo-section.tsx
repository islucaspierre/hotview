import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StaticStorePreview } from "@/components/landing/static-store-preview"

export function DemoSection() {
  return (
    <section id="demonstracao" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Veja como sua loja pode ficar
        </h2>
        <p className="max-w-xl text-pretty text-muted-foreground">
          Uma loja profissional para seu negócio, acessível por qualquer celular, sem baixar nenhum app.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center gap-8">
        {/* TODO: substituir pelo fluxo real de teste via WhatsApp quando disponível */}
        <StaticStorePreview />

        <Button size="lg" className="rounded-full gap-2 px-8 text-base" render={<Link href="/cadastro" />} nativeButton={false}>
          Quero criar uma igual
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  )
}
