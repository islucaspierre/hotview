import { createServiceClient } from "@/lib/supabase/service"
import { AdminTable, type AdminStore } from "@/components/admin/admin-table"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const service = createServiceClient()

  const [{ data: stores }, { data: subs }, usersResult] = await Promise.all([
    service.from("stores").select("id, name, slug, owner_id").order("created_at", { ascending: false }),
    service.from("subscriptions").select("store_id, status, trial_ends_at, current_period_end, canceled_at"),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const subByStore = Object.fromEntries((subs ?? []).map((s) => [s.store_id, s]))
  const emailByUser = Object.fromEntries((usersResult.data?.users ?? []).map((u) => [u.id, u.email ?? "—"]))

  const rows: AdminStore[] = (stores ?? []).map((store) => {
    const sub = subByStore[store.id]
    return {
      storeId: store.id,
      storeName: store.name || "(sem nome)",
      slug: store.slug,
      ownerEmail: emailByUser[store.owner_id] ?? "—",
      status: sub?.status ?? "sem plano",
      trialEndsAt: sub?.trial_ends_at ?? null,
      currentPeriodEnd: sub?.current_period_end ?? null,
      canceledAt: sub?.canceled_at ?? null,
    }
  })

  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lojistas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} lojas · {counts.active ?? 0} ativas · {counts.trialing ?? 0} em trial · {counts.canceled ?? 0} canceladas
        </p>
      </div>

      <AdminTable stores={rows} />
    </div>
  )
}
