"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export interface AdminStore {
  storeId: string
  storeName: string
  slug: string
  ownerEmail: string
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
}

const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial",
  active: "Ativo",
  past_due: "Inadimplente",
  canceled: "Cancelado",
}

const STATUS_COLOR: Record<string, string> = {
  trialing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  past_due: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  canceled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

function fmt(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function AdminTable({ stores: initial }: { stores: AdminStore[] }) {
  const [stores, setStores] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function callAction(storeId: string, action: string, extraDays?: number) {
    setLoading(`${storeId}-${action}`)
    try {
      const res = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, action, extraDays }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro desconhecido")
      toast.success("Atualizado com sucesso")
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar")
    } finally {
      setLoading(null)
    }
  }

  const busy = (id: string) => loading === id

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Loja</th>
            <th className="px-4 py-3">Dono</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Trial até</th>
            <th className="px-4 py-3">Plano até</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stores.map((s) => (
            <tr key={s.storeId} className="hover:bg-muted/20">
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">{s.storeName}</p>
                <p className="text-xs text-muted-foreground">/loja/{s.slug}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{s.ownerEmail}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[s.status] ?? STATUS_COLOR.canceled}`}>
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{fmt(s.trialEndsAt)}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmt(s.currentPeriodEnd)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!loading}
                    onClick={() => callAction(s.storeId, "activate")}
                    className="h-7 rounded-full text-xs"
                  >
                    {busy(`${s.storeId}-activate`) ? "..." : "Ativar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!loading}
                    onClick={() => callAction(s.storeId, "extend_trial", 15)}
                    className="h-7 rounded-full text-xs"
                  >
                    {busy(`${s.storeId}-extend_trial`) ? "..." : "+15 dias trial"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!loading}
                    onClick={() => callAction(s.storeId, "reset_trial")}
                    className="h-7 rounded-full text-xs"
                  >
                    {busy(`${s.storeId}-reset_trial`) ? "..." : "Novo trial"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!loading}
                    onClick={() => callAction(s.storeId, "cancel")}
                    className="h-7 rounded-full text-xs text-destructive hover:text-destructive"
                  >
                    {busy(`${s.storeId}-cancel`) ? "..." : "Cancelar"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {stores.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                Nenhum lojista cadastrado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
