import { SubscriptionPanel } from "@/components/dashboard/subscription-panel"

export default function AssinaturaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Assinatura</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o plano da sua vitrine.
        </p>
      </div>
      <SubscriptionPanel />
    </div>
  )
}
