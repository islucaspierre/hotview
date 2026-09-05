"use client"

import Link from "next/link"
import { AlertTriangle, Clock } from "lucide-react"
import { useStoreSettings } from "@/lib/store-settings-context"

function daysUntil(dateString?: string): number | null {
  if (!dateString) return null
  const diffMs = new Date(dateString).getTime() - Date.now()
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
}

export function SubscriptionStatusBanner() {
  const { subscription, access } = useStoreSettings()
  if (!subscription) return null

  if (access.editingLocked) {
    return (
      <div className="flex items-center justify-between gap-3 bg-destructive px-4 py-2.5 text-sm text-destructive-foreground">
        <span className="flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          Seu teste grátis acabou. Assine para continuar editando sua vitrine.
        </span>
        <Link href="/dashboard/assinatura" className="shrink-0 font-medium underline underline-offset-4">
          Assinar agora
        </Link>
      </div>
    )
  }

  if (subscription.status === "past_due") {
    return (
      <div className="flex items-center justify-between gap-3 bg-destructive px-4 py-2.5 text-sm text-destructive-foreground">
        <span className="flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          Pagamento pendente — regularize para não perder acesso.
        </span>
        <Link href="/dashboard/assinatura" className="shrink-0 font-medium underline underline-offset-4">
          Regularizar
        </Link>
      </div>
    )
  }

  if (subscription.status === "trialing") {
    const days = daysUntil(subscription.trialEndsAt)
    if (days === null || days > 5) return null
    return (
      <div className="flex items-center justify-between gap-3 bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
        <span className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" />
          {days <= 0 ? "Seu teste grátis termina hoje." : `Seu teste grátis termina em ${days} dia${days > 1 ? "s" : ""}.`}
        </span>
        <Link href="/dashboard/assinatura" className="shrink-0 font-medium underline underline-offset-4">
          Assinar agora
        </Link>
      </div>
    )
  }

  return null
}
