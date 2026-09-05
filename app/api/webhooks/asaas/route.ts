import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { getAsaasSubscription } from "@/lib/asaas/client"

const ACTIVATING_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"])
const PAST_DUE_EVENTS = new Set(["PAYMENT_OVERDUE", "PAYMENT_DELETED", "PAYMENT_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED"])
const CANCELING_EVENTS = new Set(["SUBSCRIPTION_DELETED"])

export async function POST(request: Request) {
  const token = request.headers.get("asaas-access-token")
  if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: { id?: string; event?: string; payment?: { subscription?: string }; subscription?: { id?: string } }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }

  const eventId = body.id
  const eventType = body.event
  if (!eventId || !eventType) {
    return NextResponse.json({ error: "missing_event_fields" }, { status: 400 })
  }

  const admin = createServiceClient()

  const { error: insertError } = await admin.from("asaas_webhook_events").insert({
    dedupe_key: eventId,
    event_type: eventType,
    payload: body,
  })
  if (insertError) {
    // Código 23505 = unique_violation: evento já recebido (reentrega da Asaas).
    if (insertError.code === "23505") return NextResponse.json({ ok: true, duplicate: true })
    console.error("Falha ao registrar evento de webhook Asaas", insertError)
    return NextResponse.json({ error: "db_error" }, { status: 500 })
  }

  try {
    const asaasSubscriptionId = body.payment?.subscription ?? body.subscription?.id

    if (asaasSubscriptionId) {
      if (ACTIVATING_EVENTS.has(eventType)) {
        const authoritative = await getAsaasSubscription(asaasSubscriptionId)
        await admin.from("subscriptions").update({
          status: "active",
          current_period_end: authoritative.nextDueDate,
          canceled_at: null,
        }).eq("asaas_subscription_id", asaasSubscriptionId).neq("status", "canceled")
      } else if (PAST_DUE_EVENTS.has(eventType)) {
        await admin.from("subscriptions").update({
          status: "past_due",
        }).eq("asaas_subscription_id", asaasSubscriptionId).neq("status", "canceled")
      } else if (CANCELING_EVENTS.has(eventType)) {
        await admin.from("subscriptions").update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
        }).eq("asaas_subscription_id", asaasSubscriptionId)
      }
    }

    await admin.from("asaas_webhook_events").update({ status: "done" }).eq("dedupe_key", eventId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Falha ao processar evento de webhook Asaas", error)
    // Desfaz o registro do evento para que a Asaas reentregue e tentemos de novo.
    await admin.from("asaas_webhook_events").delete().eq("dedupe_key", eventId)
    return NextResponse.json({ error: "processing_failed" }, { status: 500 })
  }
}
