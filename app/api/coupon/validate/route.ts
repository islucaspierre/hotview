import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const { storeId, code, subtotal } = await request.json()

  if (!storeId || !code) {
    return NextResponse.json({ valid: false, message: "Dados inválidos" }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: coupon } = await service
    .from("coupons")
    .select("*")
    .eq("store_id", storeId)
    .eq("code", code.toUpperCase().trim())
    .eq("active", true)
    .maybeSingle()

  if (!coupon) {
    return NextResponse.json({ valid: false, message: "Cupom inválido ou expirado" })
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, message: "Cupom expirado" })
  }

  if (coupon.max_uses != null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, message: "Cupom esgotado" })
  }

  if (coupon.min_order != null && subtotal < Number(coupon.min_order)) {
    return NextResponse.json({
      valid: false,
      message: `Pedido mínimo para este cupom: R$ ${Number(coupon.min_order).toFixed(2).replace(".", ",")}`,
    })
  }

  const discount = Number(coupon.value)
  const type = coupon.type as "percent" | "fixed"
  const friendlyDiscount = type === "percent"
    ? `${discount}% de desconto aplicado!`
    : `Desconto de R$ ${discount.toFixed(2).replace(".", ",")} aplicado!`

  return NextResponse.json({ valid: true, discount, type, message: friendlyDiscount })
}
