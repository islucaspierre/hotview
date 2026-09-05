import type { StoreHours } from "@/lib/types"

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export function isStoreOpenNow(hours: StoreHours[]): boolean {
  const now = new Date()
  const todayName = WEEKDAYS[now.getDay()]
  const today = hours.find((h) => h.day === todayName)
  if (!today || today.closed) return false

  const [openH, openM] = today.open.split(":").map(Number)
  const [closeH, closeM] = today.close.split(":").map(Number)
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const minutesOpen = openH * 60 + openM
  const minutesClose = closeH * 60 + closeM

  if (minutesClose < minutesOpen) {
    // fecha depois da meia-noite
    return minutesNow >= minutesOpen || minutesNow <= minutesClose
  }
  return minutesNow >= minutesOpen && minutesNow <= minutesClose
}
