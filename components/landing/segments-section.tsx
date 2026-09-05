import { THEME_ORDER, THEME_PRESETS } from "@/lib/theme-presets"

export function SegmentsSection() {
  return (
    <section id="segmentos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold text-balance text-foreground sm:text-4xl">
          Um tema pronto para o seu tipo de negócio
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Cada segmento tem uma paleta própria, pensada para combinar com o que você vende. Troque
          quando quiser, direto no painel.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {THEME_ORDER.map((themeId) => {
          const theme = THEME_PRESETS[themeId]
          return (
            <div
              key={themeId}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <div
                className="h-16 w-full rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                }}
                aria-hidden
              />
              <span className="text-sm font-semibold text-foreground">{theme.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
