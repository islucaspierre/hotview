import type { StoreTheme, ThemeId } from "@/lib/types"

// Paletas prontas para o painel de personalização (Fase 3).
// Cada tema define primária, destaque e fundo em oklch.
export const THEME_PRESETS: Record<ThemeId, StoreTheme> = {
  hamburgueria: {
    id: "hamburgueria",
    label: "Hamburgueria",
    primary: "oklch(0.62 0.19 41)",
    accent: "oklch(0.58 0.22 25)",
    background: "oklch(0.16 0.01 41)",
  },
  espetaria: {
    id: "espetaria",
    label: "Espetaria",
    primary: "oklch(0.55 0.18 30)",
    accent: "oklch(0.7 0.16 70)",
    background: "oklch(0.15 0.01 30)",
  },
  pizzaria: {
    id: "pizzaria",
    label: "Pizzaria",
    primary: "oklch(0.56 0.2 22)",
    accent: "oklch(0.75 0.15 100)",
    background: "oklch(0.17 0.015 40)",
  },
  acai: {
    id: "acai",
    label: "Açaí",
    primary: "oklch(0.5 0.22 320)",
    accent: "oklch(0.75 0.18 95)",
    background: "oklch(0.16 0.02 320)",
  },
  confeitaria: {
    id: "confeitaria",
    label: "Confeitaria",
    primary: "oklch(0.68 0.15 350)",
    accent: "oklch(0.8 0.1 90)",
    background: "oklch(0.97 0.005 90)",
  },
  natural: {
    id: "natural",
    label: "Natural",
    primary: "oklch(0.55 0.13 145)",
    accent: "oklch(0.78 0.14 95)",
    background: "oklch(0.97 0.01 120)",
  },
  premium: {
    id: "premium",
    label: "Premium",
    primary: "oklch(0.75 0.16 78)",
    accent: "oklch(0.58 0.2 35)",
    background: "oklch(0.15 0.01 60)",
  },
}

export const THEME_ORDER: ThemeId[] = [
  "premium",
  "hamburgueria",
  "espetaria",
  "pizzaria",
  "acai",
  "confeitaria",
  "natural",
]
