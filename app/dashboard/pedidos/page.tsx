"use client"

import { useEffect, useState } from "react"
import { Package, Clock, MapPin, Store as StoreIcon, ChevronDown, ChevronUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/format"
import { useStoreSettings } from "@/lib/store-settings-context"

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  note: string | null
}

interface Order {
  id: string
  created_at: string
  status: string
  subtotal: number
  items: OrderItem[]
}

export default function PedidosPage() {
  const { store } = useStoreSettings()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!store.id) return
    const supabase = createClient()
    supabase
      .from("orders")
      .select("id, created_at, status, subtotal")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(async ({ data: orderRows }) => {
        if (!orderRows || orderRows.length === 0) { setLoading(false); return }
        const ids = orderRows.map((o) => o.id)
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("id, order_id, product_name, quantity, unit_price, note")
          .in("order_id", ids)
        const itemsByOrder: Record<string, OrderItem[]> = {}
        for (const item of itemRows ?? []) {
          if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = []
          itemsByOrder[item.order_id].push(item)
        }
        setOrders(orderRows.map((o) => ({ ...o, items: itemsByOrder[o.id] ?? [] })))
        setLoading(false)
      })
  }, [store.id])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function formatDate(iso: string) {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Carregando..." : `${orders.length} pedido${orders.length !== 1 ? "s" : ""} recebido${orders.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Package className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum pedido ainda. Compartilhe sua vitrine para começar a receber!</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const isOpen = expanded.has(order.id)
          return (
            <div key={order.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleExpanded(order.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-card-foreground">
                      {order.items.length > 0
                        ? order.items.map((i) => `${i.quantity}× ${i.product_name}`).join(", ").slice(0, 60) + (order.items.length > 2 ? "…" : "")
                        : "Pedido"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-primary">{formatCurrency(order.subtotal)}</span>
                  {isOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-3 flex flex-col gap-2 bg-secondary/20">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{item.quantity}× {item.product_name}</span>
                        {item.note && <span className="text-xs italic text-muted-foreground">Obs: {item.note}</span>}
                      </div>
                      <span className="text-muted-foreground shrink-0">{formatCurrency(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(order.subtotal)}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
