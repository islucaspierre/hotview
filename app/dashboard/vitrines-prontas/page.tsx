import { ReadyStorefrontLibrary } from "@/components/dashboard/ready-storefront-library"

export default function VitrinesProntasPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Vitrines prontas</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Está começando agora? Escolha um segmento pronto — Pizzaria, Hamburgueria, Espetaria e
          outros — e comece a usar na hora, com tema visual e cardápio de exemplo já com fotos.
          É como duplicar uma vitrine pronta: depois você só ajusta nomes, preços, fotos e cores do
          jeito que quiser.
        </p>
      </div>
      <ReadyStorefrontLibrary />
    </div>
  )
}
