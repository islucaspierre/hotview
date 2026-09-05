"use client"

import { RotateCcw } from "lucide-react"
import { useStoreSettings } from "@/lib/store-settings-context"
import { resolveStoreTheme } from "@/lib/theme-style"
import { toHex } from "@/lib/color"
import { ColorField } from "@/components/dashboard/color-field"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"

export function CustomThemeEditor() {
  const { store, setThemeOverrides, updateThemeOverride } = useStoreSettings()
  const isCustom = Boolean(store.themeOverrides)

  // Cores efetivas: as personalizadas se existirem, senão as do tema atual
  // (convertidas para hex, já que o preset vive em oklch).
  const effective = store.themeOverrides ?? {
    primary: toHex(resolveStoreTheme(store.theme).primary),
    accent: toHex(resolveStoreTheme(store.theme).accent),
    background: toHex(resolveStoreTheme(store.theme).background),
  }

  function handleToggle(checked: boolean) {
    if (checked) {
      setThemeOverrides({
        primary: toHex(resolveStoreTheme(store.theme).primary),
        accent: toHex(resolveStoreTheme(store.theme).accent),
        background: toHex(resolveStoreTheme(store.theme).background),
      })
    } else {
      setThemeOverrides(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="custom-theme-toggle" className="flex-1">
          Usar cores personalizadas
          <FieldDescription>Ajuste a paleta do template escolhido para a identidade da sua marca.</FieldDescription>
        </FieldLabel>
        <Switch id="custom-theme-toggle" checked={isCustom} onCheckedChange={handleToggle} />
      </Field>

      {isCustom && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <ColorField
              id="color-primary"
              label="Primária"
              value={effective.primary}
              onChange={(value) => updateThemeOverride("primary", value)}
            />
            <ColorField
              id="color-accent"
              label="Destaque"
              value={effective.accent}
              onChange={(value) => updateThemeOverride("accent", value)}
            />
            <ColorField
              id="color-background"
              label="Fundo"
              value={effective.background}
              onChange={(value) => updateThemeOverride("background", value)}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit gap-2 text-muted-foreground"
            onClick={() => handleToggle(false)}
          >
            <RotateCcw className="size-3.5" data-icon="inline-start" />
            Restaurar cores do template
          </Button>
        </div>
      )}
    </div>
  )
}
