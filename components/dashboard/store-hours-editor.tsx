"use client"

import type { StoreHours } from "@/lib/types"
import { useStoreSettings } from "@/lib/store-settings-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

function withDefaults(hours: StoreHours[]): StoreHours[] {
  return WEEKDAYS.map((day) => {
    const existing = hours.find((h) => h.day === day)
    return existing ?? { day, open: "08:00", close: "18:00", closed: false }
  })
}

export function StoreHoursEditor() {
  const { store, updateStore } = useStoreSettings()
  const hours = withDefaults(store.hours)

  function updateDay(day: string, patch: Partial<StoreHours>) {
    const next = hours.map((h) => (h.day === day ? { ...h, ...patch } : h))
    updateStore({ hours: next })
  }

  return (
    <div className="flex flex-col gap-2">
      {hours.map((hour) => (
        <div key={hour.day} className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 sm:grid-cols-[6rem_auto_auto_auto]">
          <span className="text-sm font-medium text-foreground">{hour.day}</span>

          {hour.closed ? (
            <span className="col-span-2 text-sm text-muted-foreground sm:col-span-2">Fechado</span>
          ) : (
            <div className="col-span-2 flex items-center gap-2 sm:col-span-2">
              <Input
                type="time"
                value={hour.open}
                onChange={(e) => updateDay(hour.day, { open: e.target.value })}
                className="w-28"
                aria-label={`Horário de abertura de ${hour.day}`}
              />
              <span className="text-xs text-muted-foreground">até</span>
              <Input
                type="time"
                value={hour.close}
                onChange={(e) => updateDay(hour.day, { close: e.target.value })}
                className="w-28"
                aria-label={`Horário de fechamento de ${hour.day}`}
              />
            </div>
          )}

          <div className="flex items-center gap-2 justify-self-end">
            <Label htmlFor={`closed-${hour.day}`} className="text-xs text-muted-foreground">
              Fechado
            </Label>
            <Switch
              id={`closed-${hour.day}`}
              checked={Boolean(hour.closed)}
              onCheckedChange={(checked) => updateDay(hour.day, { closed: Boolean(checked) })}
              aria-label={`Marcar ${hour.day} como fechado`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
