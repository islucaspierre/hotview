"use client"

import { useEffect, useState } from "react"
import { Eye, ShoppingCart, Send, Percent } from "lucide-react"
import type { StoreMetrics } from "@/lib/types"
import { getStoreMetrics } from "@/lib/supabase/metrics-data"
import { formatNumber, formatPercent } from "@/lib/format"
import { useStoreSettings } from "@/lib/store-settings-context"
import { MetricCard } from "@/components/dashboard/metric-card"
import { ViewsTrendChart } from "@/components/dashboard/views-trend-chart"
import { OrdersFunnelChart } from "@/components/dashboard/orders-funnel-chart"
import { TopProductCard } from "@/components/dashboard/top-product-card"
import { TopAddonsChart } from "@/components/dashboard/top-addons-chart"

const EMPTY_METRICS: StoreMetrics = {
  totalViews: 0,
  ordersStarted: 0,
  ordersSent: 0,
  conversionRate: 0,
  topProduct: "",
  topAddons: [],
  history: [],
}

export default function DashboardPage() {
  const { store, productList } = useStoreSettings()
  const [metrics, setMetrics] = useState<StoreMetrics>(EMPTY_METRICS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!store.id) return
    setLoading(true)
    getStoreMetrics(store.id)
      .then((data) => { if (!cancelled) setMetrics(data) })
      .catch(() => { if (!cancelled) setMetrics(EMPTY_METRICS) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [store.id])

  const topProduct = productList.find((p) => p.name === metrics.topProduct)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading ? "Carregando métricas..." : "Últimos 7 dias da sua vitrine."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Visualizações"
          value={formatNumber(metrics.totalViews)}
          hint="Acessos à vitrine"
          icon={Eye}
        />
        <MetricCard
          label="Pedidos iniciados"
          value={formatNumber(metrics.ordersStarted)}
          hint="Carrinhos montados"
          icon={ShoppingCart}
        />
        <MetricCard
          label="Pedidos enviados"
          value={formatNumber(metrics.ordersSent)}
          hint="Finalizados no WhatsApp"
          icon={Send}
        />
        <MetricCard
          label="Taxa de conversão"
          value={formatPercent(metrics.conversionRate)}
          hint="De visitas em pedidos enviados"
          icon={Percent}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ViewsTrendChart history={metrics.history} />
        <OrdersFunnelChart history={metrics.history} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopProductCard product={topProduct} topProductName={metrics.topProduct} />
        <TopAddonsChart topAddons={metrics.topAddons} />
      </div>
    </div>
  )
}
