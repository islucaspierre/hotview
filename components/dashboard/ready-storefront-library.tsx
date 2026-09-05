"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, LayoutTemplate, Palette } from "lucide-react"
import type { ThemeId } from "@/lib/types"
import { PRESET_CATALOGS, PRESET_CATALOG_ORDER, type PresetCatalog } from "@/lib/preset-catalogs"
import { THEME_PRESETS } from "@/lib/theme-presets"
import { useStoreSettings } from "@/lib/store-settings-context"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Biblioteca de vitrines prontas: cada card representa um negócio inteiro
// pronto para usar (tema visual + cardápio de exemplo com fotos reais).
// Ideal para quem está começando agora e não quer montar tudo do zero —
// é como "duplicar" uma vitrine e só ajustar depois.
export function ReadyStorefrontLibrary() {
  const { store, applyPresetCatalog, productList } = useStoreSettings()
  const router = useRouter()
  const [previewCatalog, setPreviewCatalog] = useState<PresetCatalog | null>(null)
  const [applying, setApplying] = useState(false)

  function hasAllProducts(catalogId: ThemeId) {
    const catalog = PRESET_CATALOGS[catalogId]
    return catalog.products.every((product) => productList.some((existing) => existing.name === product.name))
  }

  async function handleUse(catalog: PresetCatalog) {
    setApplying(true)
    const added = await applyPresetCatalog(catalog.id)
    setApplying(false)
    if (added === null) return
    if (added > 0) {
      toast.success(`Vitrine de ${catalog.label} pronta para usar!`, {
        description: `Tema aplicado e ${added} produto${added > 1 ? "s" : ""} adicionado${added > 1 ? "s" : ""} ao seu cardápio.`,
      })
    } else {
      toast.success(`Tema de ${catalog.label} aplicado à sua vitrine.`)
    }
    setPreviewCatalog(null)
    // Leva o lojista direto pra tela onde ele vê e ajusta o resultado —
    // sem isso, ele fica na mesma página sem nenhuma confirmação visual
    // clara de que a vitrine pronta foi realmente aplicada.
    router.push("/dashboard/personalizacao")
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRESET_CATALOG_ORDER.map((id) => {
          const catalog = PRESET_CATALOGS[id]
          const theme = THEME_PRESETS[id]
          const isActiveTheme = store.theme === id
          const productsReady = hasAllProducts(id)
          return (
            <div
              key={id}
              className={`group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors ${
                isActiveTheme ? "border-primary" : "border-border"
              }`}
            >
              <div className="relative h-28 w-full overflow-hidden">
                <Image
                  src={catalog.cover || "/placeholder.svg"}
                  alt={catalog.label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                  {[theme.background, theme.primary, theme.accent].map((color, i) => (
                    <span
                      key={i}
                      className="size-3 rounded-full border border-white/40"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {isActiveTheme && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                    <Check className="size-3" />
                    Em uso
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground">{catalog.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{catalog.description}</p>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <LayoutTemplate className="size-3.5" />
                  Tema + {catalog.products.length} pratos prontos
                  {productsReady && <Check className="size-3.5 text-primary" />}
                </p>
                <Button
                  type="button"
                  variant={isActiveTheme ? "secondary" : "default"}
                  size="sm"
                  className="mt-auto gap-2"
                  onClick={() => setPreviewCatalog(catalog)}
                >
                  <Palette className="size-4" />
                  {isActiveTheme ? "Ver detalhes" : "Usar esta vitrine"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={Boolean(previewCatalog)} onOpenChange={(open) => !open && setPreviewCatalog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {previewCatalog && (
            <>
              <DialogHeader>
                <DialogTitle>Vitrine de {previewCatalog.label}</DialogTitle>
                <DialogDescription>
                  Aplica o tema visual de {previewCatalog.label} e adiciona estes produtos ao seu
                  cardápio (sem remover o que você já tem). Depois você pode editar nome, preço, foto
                  e cores como quiser em{" "}
                  <Link href="/dashboard/personalizacao" className="underline underline-offset-4">
                    Personalização
                  </Link>
                  .
                </DialogDescription>
              </DialogHeader>

              <ul className="flex flex-col gap-3">
                {previewCatalog.products.map((product) => (
                  <li key={product.slug} className="flex items-center gap-3 rounded-lg border border-border p-2">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{formatCurrency(product.price)}</p>
                  </li>
                ))}
              </ul>

              <DialogFooter className="mt-2">
                <Button type="button" variant="secondary" onClick={() => setPreviewCatalog(null)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={() => handleUse(previewCatalog)} disabled={applying} className="gap-2">
                  <Palette className="size-4" />
                  {applying ? "Aplicando..." : "Usar esta vitrine"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
