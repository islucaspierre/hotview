"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { THEME_ORDER, THEME_PRESETS } from "@/lib/theme-presets"
import type { ThemeId } from "@/lib/types"

export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeId
  onChange: (theme: ThemeId) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {THEME_ORDER.map((id) => {
        const theme = THEME_PRESETS[id]
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={selected}
            className={cn(
              "group flex flex-col gap-2 rounded-xl border p-2 text-left transition-colors",
              selected ? "border-primary" : "border-border hover:border-primary/40",
            )}
          >
            <div
              className="relative flex h-16 flex-col justify-between overflow-hidden rounded-lg p-2"
              style={{ backgroundColor: theme.background }}
            >
              <span className="h-2 w-10 rounded-full" style={{ backgroundColor: theme.primary }} />
              <span className="size-3 self-end rounded-full" style={{ backgroundColor: theme.accent }} />
              {selected && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-2.5" />
                </span>
              )}
            </div>
            <span className="px-1 text-sm font-medium text-foreground">{theme.label}</span>
          </button>
        )
      })}
    </div>
  )
}
