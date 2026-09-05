"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

interface ColorFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

// Campo de cor com dois controles sincronizados: o seletor nativo (swatch)
// e um input de texto para o hex, para quem preferir digitar/colar o código.
export function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  const isValidHex = HEX_PATTERN.test(value)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={isValidHex ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
          aria-label={`Selecionar ${label.toLowerCase()}`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-xs uppercase sm:text-sm"
          maxLength={7}
        />
      </div>
    </div>
  )
}
