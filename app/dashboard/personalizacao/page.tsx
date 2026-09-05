import { PersonalizationForm } from "@/components/dashboard/personalization-form"
import { StorePreviewFrame } from "@/components/dashboard/store-preview-frame"

export default function PersonalizacaoPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-12 lg:py-10">
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Personalize sua vitrine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edite a identidade e o tema da loja. As mudanças aparecem no preview ao lado em tempo real.
          </p>
        </div>
        <PersonalizationForm />
      </div>

      <div className="lg:sticky lg:top-8 lg:h-fit lg:w-[380px] lg:shrink-0">
        <StorePreviewFrame />
      </div>
    </div>
  )
}
