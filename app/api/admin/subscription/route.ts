import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!ADMIN_EMAIL || !user || user.email !== ADMIN_EMAIL) return false
  return true
}

export async function POST(request: NextRequest) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { storeId, action, extraDays } = await request.json()
  if (!storeId || !action) {
    return NextResponse.json({ error: "storeId and action are required" }, { status: 400 })
  }

  const service = createServiceClient()

  let update: Record<string, unknown> = {}

  if (action === "activate") {
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + 30)
    update = { status: "active", current_period_end: periodEnd.toISOString(), canceled_at: null }
  } else if (action === "cancel") {
    update = { status: "canceled", canceled_at: new Date().toISOString() }
  } else if (action === "extend_trial") {
    const days = Number(extraDays) || 15
    const { data: sub } = await service.from("subscriptions").select("trial_ends_at").eq("store_id", storeId).single()
    const base = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : new Date()
    base.setDate(base.getDate() + days)
    update = { status: "trialing", trial_ends_at: base.toISOString(), canceled_at: null }
  } else if (action === "reset_trial") {
    const newEnd = new Date()
    newEnd.setDate(newEnd.getDate() + 15)
    update = { status: "trialing", trial_ends_at: newEnd.toISOString(), canceled_at: null }
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }

  const { error } = await service.from("subscriptions").update(update).eq("store_id", storeId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
