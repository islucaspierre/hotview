"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, ExternalLink } from "lucide-react"
import { useStoreSettings } from "@/lib/store-settings-context"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { SubscriptionForm } from "@/components/dashboard/subscription-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const STATUS_LABEL: Record<string, string> = {
  trialing: "Em teste grátis",
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("pt-BR")
}

export function SubscriptionPanel() {
  const { store, subscription } = useStoreSettings()
  const [loadingInvoice, setLoadingInvoice] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  async function handleOpenInvoice() {
    setLoadingInvoice(true)
    try {
      const res = await fetch("/api/subscriptions")
      const data = await res.json()
      if (!data.invoiceUrl) {
        toast.error("Não encontramos uma cobrança pendente.")
        return
      }
      window.open(data.invoiceUrl, "_blank", "noopener,noreferrer")
    } catch {
      toast.error("Não foi possível abrir a cobrança agora.")
    } finally {
      setLoadingInvoice(false)
    }
  }

  async function handleCancel() {
    setCanceling(true)
    try {
      const res = await fetch("/api/subscriptions", { method: "DELETE" })
      if (!res.ok) {
        toast.error("Não foi possível cancelar agora.")
        return
      }
      toast.success("Assinatura cancelada.")
    } catch {
      toast.error("Não foi possível cancelar agora.")
    } finally {
      setCanceling(false)
      setConfirmingCancel(false)
    }
  }

  if (!subscription) {
    return <p className="text-sm text-muted-foreground">Carregando informações da assinatura...</p>
  }

  if (subscription.status === "active") {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="size-5" />
          <span className="font-display text-lg font-semibold">Assinatura ativa</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Plano de {formatCurrency(39.7)}/mês. Próxima cobrança em {formatDate(subscription.currentPeriodEnd)}.
        </p>
        <Button variant="secondary" className="w-fit rounded-full" onClick={() => setConfirmingCancel(true)}>
          Cancelar assinatura
        </Button>

        <AlertDialog open={confirmingCancel} onOpenChange={setConfirmingCancel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
              <AlertDialogDescription>
                Sua vitrine deixa de aceitar edições e pode sair do ar após o período atual. Não é possível desfazer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={canceling}>
                {canceling ? "Cancelando..." : "Cancelar assinatura"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  if (subscription.asaasSubscriptionId && subscription.status !== "canceled") {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <p className="font-display text-lg font-semibold text-foreground">
          {STATUS_LABEL[subscription.status]}
        </p>
        <p className="text-sm text-muted-foreground">
          Já geramos sua cobrança de {formatCurrency(39.7)}. Abra o link para concluir o pagamento.
        </p>
        <Button className="w-fit gap-2 rounded-full" onClick={handleOpenInvoice} disabled={loadingInvoice}>
          <ExternalLink className="size-4" />
          {loadingInvoice ? "Abrindo..." : "Ver cobrança"}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div>
        <p className="font-display text-lg font-semibold text-foreground">
          Assine a vitrine {store.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(39.7)}/mês via Pix ou cartão de crédito, pela Asaas.
        </p>
      </div>
      <SubscriptionForm defaultName={store.name} />
    </div>
  )
}
