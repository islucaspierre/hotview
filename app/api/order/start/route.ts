import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let body: { storeId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { storeId } = body
  if (!storeId) return NextResponse.json({ ok: false }, { status: 400 })

  const service = createServiceClient()

  // Validate store exists before recording the metric
  const { data: store } = await service
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .maybeSingle()

  if (!store) return NextResponse.json({ ok: false }, { status: 404 })

  const { error } = await service
    .from("orders")
    .insert({ store_id: storeId, status: "started", subtotal: 0 })

  if (error) console.error("[order/start] insert:", error)

  return NextResponse.json({ ok: true })
}
