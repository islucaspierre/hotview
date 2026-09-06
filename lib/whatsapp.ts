import type { CartItem, Store } from "@/lib/types"
import { formatCurrency } from "@/lib/format"

export function buildWhatsAppOrderMessage(
  store: Store,
  items: CartItem[],
  subtotal: number,
  deliveryMethod?: "delivery" | "pickup",
  deliveryAddress?: string,
  deliveryFee?: number,
): string {
  const lines: string[] = []

  lines.push(`Olá, ${store.name}! Quero fazer um pedido:`)
  lines.push("")

  for (const item of items) {
    const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0)
    const lineTotal = (item.unitPrice + addonsTotal) * item.quantity
    lines.push(`• ${item.quantity}x ${item.name} — ${formatCurrency(lineTotal)}`)
    for (const addon of item.addons) {
      if (addon.price > 0) {
        lines.push(`   + ${addon.name} (${formatCurrency(addon.price)})`)
      } else {
        lines.push(`   + ${addon.name}`)
      }
    }
    if (item.note) {
      lines.push(`   Obs: ${item.note}`)
    }
  }

  lines.push("")

  const fee = deliveryFee ?? 0
  const total = subtotal + fee

  if (deliveryMethod === "delivery") {
    lines.push(`Subtotal: ${formatCurrency(subtotal)}`)
    lines.push(`Taxa de entrega: ${fee === 0 ? "Grátis" : formatCurrency(fee)}`)
    lines.push(`*Total: ${formatCurrency(total)}*`)
    if (deliveryAddress) {
      lines.push("")
      lines.push(`📍 Endereço de entrega: ${deliveryAddress}`)
    }
  } else if (deliveryMethod === "pickup") {
    lines.push(`*Total: ${formatCurrency(subtotal)}*`)
    lines.push("")
    lines.push("🏪 Vou retirar no local.")
  } else {
    lines.push(`Total: ${formatCurrency(subtotal)}`)
  }

  lines.push("")
  lines.push("Aguardo confirmação, obrigado!")

  return lines.join("\n")
}

// Corrige números salvos sem o 55 (DDI do Brasil) — sem isso o wa.me abre
// errado ou não abre. Aplica na hora de montar o link, então cobre até
// números que já estavam salvos incorretamente antes dessa correção.
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return digits
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) return digits
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  return digits
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${normalizeWhatsAppNumber(phone)}?text=${encoded}`
}
