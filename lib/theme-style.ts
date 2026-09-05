import { THEME_PRESETS } from "@/lib/theme-presets"
import type { StoreTheme, StoreThemeOverrides, ThemeId } from "@/lib/types"
import type { CSSProperties } from "react"

// Cores de texto neutras usadas em cima de qualquer fundo/primária/destaque,
// escolhidas dinamicamente conforme a claridade percebida da cor de base.
const DARK_TEXT = "oklch(0.2 0.02 60)"
const LIGHT_TEXT = "oklch(0.97 0.01 60)"
const DARK_MUTED = "oklch(0.42 0.02 65)"
const LIGHT_MUTED = "oklch(0.68 0.02 65)"
const DARK_BORDER = "oklch(0 0 0 / 12%)"
const LIGHT_BORDER = "oklch(1 0 0 / 10%)"

// Extrai a claridade percebida (0 a 1) de uma cor em oklch(...) ou hex.
// Usado para decidir automaticamente se o texto por cima deve ser claro ou
// escuro — essencial quando a cor vem de um seletor de cores livre da lojista.
function getPerceivedLightness(color: string): number {
  const oklchMatch = color.match(/oklch\(\s*([\d.]+)/i)
  if (oklchMatch) return Number.parseFloat(oklchMatch[1])

  const hexMatch = color.match(/^#?([0-9a-f]{6})$/i)
  if (hexMatch) {
    const hex = hexMatch[1]
    const r = Number.parseInt(hex.slice(0, 2), 16) / 255
    const g = Number.parseInt(hex.slice(2, 4), 16) / 255
    const b = Number.parseInt(hex.slice(4, 6), 16) / 255
    // Luminância relativa aproximada (sRGB).
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  return 0.5
}

function foregroundFor(color: string) {
  return getPerceivedLightness(color) > 0.6 ? DARK_TEXT : LIGHT_TEXT
}

// Combina o preset da biblioteca com eventuais cores personalizadas da lojista.
export function resolveStoreTheme(themeId: ThemeId, overrides?: StoreThemeOverrides | null): StoreTheme {
  const preset = THEME_PRESETS[themeId]
  if (!overrides) return preset
  return {
    ...preset,
    primary: overrides.primary || preset.primary,
    accent: overrides.accent || preset.accent,
    background: overrides.background || preset.background,
  }
}

// Gera CSS vars inline para sobrescrever os tokens de tema apenas dentro do
// container de preview, sem afetar o restante do painel administrativo.
// O contraste do texto é calculado a partir da cor de fundo/primária/destaque
// reais, então tanto os temas prontos claros (Confeitaria, Natural) quanto
// qualquer combinação de cores personalizadas continuam legíveis.
export function getThemeStyle(themeId: ThemeId, overrides?: StoreThemeOverrides | null): CSSProperties {
  const theme = resolveStoreTheme(themeId, overrides)
  const backgroundIsLight = getPerceivedLightness(theme.background) > 0.6

  return {
    "--background": theme.background,
    "--foreground": backgroundIsLight ? DARK_TEXT : LIGHT_TEXT,
    "--card": theme.background,
    "--card-foreground": backgroundIsLight ? DARK_TEXT : LIGHT_TEXT,
    "--primary": theme.primary,
    "--primary-foreground": foregroundFor(theme.primary),
    "--secondary": theme.accent,
    "--secondary-foreground": foregroundFor(theme.accent),
    "--accent": theme.accent,
    "--accent-foreground": foregroundFor(theme.accent),
    "--muted": theme.background,
    "--muted-foreground": backgroundIsLight ? DARK_MUTED : LIGHT_MUTED,
    "--border": backgroundIsLight ? DARK_BORDER : LIGHT_BORDER,
    colorScheme: backgroundIsLight ? "light" : "dark",
  } as CSSProperties
}
