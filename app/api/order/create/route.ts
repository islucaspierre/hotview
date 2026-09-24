import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

interface IncomingAddon {
  addonId: string
  addonName: string
  price: number
}

interface IncomingItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  note?: string | null
  addons: IncomingAddon[]
}

interface CreateOrderBody {
  storeId: string
  subtotal: number
  couponCode?: string
  items: IncomingItem[]
}

export async function POST(request: Request) {
  let body: CreateOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }

  const { storeId, subtotal, couponCode, items } = body

  if (
    !storeId ||
    typeof subtotal !== "number" ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 })
  }

  const service = createServiceClient()

  // Validate store exists — prevents fake orders targeting random UUIDs
  const { data: store } = await service
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .maybeSingle()

  if (!store) {
    return NextResponse.json({ error: "store_not_found" }, { status: 404 })
  }

  const orderId = crypto.randomUUID()

  const { error: orderError } = await service
    .from("orders")
    .insert({ id: orderId, store_id: storeId, status: "sent", subtotal })

  if (orderError) {
    console.error("[order/create] order insert:", orderError)
    return NextResponse.json({ error: "order_failed" }, { status: 500 })
  }

  const orderItems = items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.productId,
    product_name: item.productName,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    note: item.note ?? null,
  }))

  const { error: itemsError } = await service.from("order_items").insert(orderItems)
  if (itemsError) {
    console.error("[order/create] order_items insert:", itemsError)
  }

  const addonRows = items.flatMap((item, index) => {
    const orderItemId = orderItems[index]?.id
    if (!orderItemId) return []
    return item.addons.map((addon) => ({
      order_item_id: orderItemId,
      addon_id: addon.addonId,
      addon_name: addon.addonName,
      price: addon.price,
    }))
  })

  if (addonRows.length > 0) {
    const { error: addonsError } = await service.from("order_item_addons").insert(addonRows)
    if (addonsError) console.error("[order/create] addons insert:", addonsError)
  }

  // Increment coupon server-side — no longer callable directly from browser
  if (couponCode) {
    const { error: couponErr } = await service.rpc("increment_coupon_uses", {
      p_store_id: storeId,
      p_code: couponCode,
    })
    if (couponErr) console.error("[order/create] coupon increment:", couponErr)
  }

  return NextResponse.json({ orderId })
}
