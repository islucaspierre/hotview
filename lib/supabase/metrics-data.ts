import { createClient } from "@/lib/supabase/client"
import type { StoreMetrics } from "@/lib/types"

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export async function getStoreMetrics(storeId: string): Promise<StoreMetrics> {
  const supabase = createClient()
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const { data: dailyRows } = await supabase
    .from("store_metrics_daily")
    .select("metric_date, views, orders_started, orders_sent")
    .eq("store_id", storeId)
    .gte("metric_date", isoDate(sevenDaysAgo))
    .order("metric_date")

  const history = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = isoDate(d)
    const row = dailyRows?.find((r) => r.metric_date === iso)
    history.push({
      date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      views: row?.views ?? 0,
      ordersStarted: row?.orders_started ?? 0,
      ordersSent: row?.orders_sent ?? 0,
    })
  }

  const totalViews = history.reduce((sum, h) => sum + h.views, 0)
  const ordersStarted = history.reduce((sum, h) => sum + h.ordersStarted, 0)
  const ordersSent = history.reduce((sum, h) => sum + h.ordersSent, 0)
  const conversionRate = totalViews > 0 ? ordersSent / totalViews : 0

  const since = sevenDaysAgo.toISOString()
  const [{ data: topProductRows }, { data: topAddonRows }] = await Promise.all([
    supabase.rpc("get_top_product", { p_store_id: storeId, p_since: since }),
    supabase.rpc("get_top_addons", { p_store_id: storeId, p_since: since, p_limit: 3 }),
  ])

  return {
    totalViews,
    ordersStarted,
    ordersSent,
    conversionRate,
    topProduct: topProductRows?.[0]?.product_name ?? "",
    topAddons: (topAddonRows ?? []).map((row: { addon_name: string; uses: number }) => ({ name: row.addon_name, count: row.uses })),
    history,
  }
}
