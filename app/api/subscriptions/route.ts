import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import {
  AsaasError,
  cancelAsaasSubscription,
  createAsaasCustomer,
  createAsaasSubscription,
  listAsaasPaymentsForSubscription,
} from "@/lib/asaas/client"

const MONTHLY_VALUE = 39.7

async function getOwnerStoreAndSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createServiceClient()
  const { data: store } = await admin.from("stores").select("id").eq("owner_id", user.id).maybeSingle()
  if (!store) return null

  const { data: subscription } = await admin.from("subscriptions").select("*").eq("store_id", store.id).maybeSingle()
  if (!subscription) return null

  return { user, admin, store, subscription }
}

function toDueDate(trialEndsAt: string): string {
  const trialDate = new Date(trialEndsAt)
  const now = new Date()
  const dueDate = trialDate > now ? trialDate : now
  return dueDate.toISOString().slice(0, 10)
}

export async function POST(request: Request) {
  const ctx = await getOwnerStoreAndSubscription()
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { user, admin, store, subscription } = ctx

  if (subscription.status === "active") {
    return NextResponse.json({ error: "already_subscribed" }, { status: 409 })
  }

  let body: { name?: string; cpfCnpj?: string; billingType?: "PIX" | "CREDIT_CARD" }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }
  const { name, cpfCnpj, billingType } = body
  if (!name?.trim() || !cpfCnpj?.trim() || (billingType !== "PIX" && billingType !== "CREDIT_CARD")) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 })
  }

  try {
    let asaasCustomerId = subscription.asaas_customer_id as string | null

    if (!asaasCustomerId) {
      const customer = await createAsaasCustomer({
        name: name.trim(),
        cpfCnpj: cpfCnpj.replace(/\D/g, ""),
        email: user.email ?? undefined,
      })
      asaasCustomerId = customer.id
      await admin.from("subscriptions").update({
        asaas_customer_id: asaasCustomerId,
        cpf_cnpj: cpfCnpj.replace(/\D/g, ""),
      }).eq("store_id", store.id)
    }

    // Uma assinatura cancelada não deve ser reaproveitada: precisa de uma
    // assinatura nova na Asaas quando o lojista decide assinar de novo.
    let asaasSubscriptionId = subscription.status === "canceled" ? null : (subscription.asaas_subscription_id as string | null)
    if (!asaasSubscriptionId) {
      const created = await createAsaasSubscription({
        customer: asaasCustomerId,
        billingType,
        value: MONTHLY_VALUE,
        nextDueDate: toDueDate(subscription.trial_ends_at),
        cycle: "MONTHLY",
        description: "Assinatura Hotview",
      })
      asaasSubscriptionId = created.id
      await admin.from("subscriptions").update({
        asaas_subscription_id: asaasSubscriptionId,
        billing_type: billingType,
        status: "trialing",
        canceled_at: null,
      }).eq("store_id", store.id)
    }

    const payments = await listAsaasPaymentsForSubscription(asaasSubscriptionId)
    const invoiceUrl = payments.data[0]?.invoiceUrl
    if (!invoiceUrl) {
      return NextResponse.json({ error: "invoice_not_found" }, { status: 502 })
    }

    return NextResponse.json({ invoiceUrl })
  } catch (error) {
    console.error("Falha ao criar assinatura Asaas", error instanceof AsaasError ? error.body : error)
    return NextResponse.json({ error: "asaas_error" }, { status: 502 })
  }
}

export async function GET() {
  const ctx = await getOwnerStoreAndSubscription()
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { subscription } = ctx

  if (!subscription.asaas_subscription_id) {
    return NextResponse.json({ invoiceUrl: null })
  }

  try {
    const payments = await listAsaasPaymentsForSubscription(subscription.asaas_subscription_id)
    return NextResponse.json({ invoiceUrl: payments.data[0]?.invoiceUrl ?? null })
  } catch (error) {
    console.error("Falha ao buscar cobrança Asaas", error instanceof AsaasError ? error.body : error)
    return NextResponse.json({ invoiceUrl: null })
  }
}

export async function DELETE() {
  const ctx = await getOwnerStoreAndSubscription()
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { admin, store, subscription } = ctx

  if (!subscription.asaas_subscription_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 })
  }

  try {
    await cancelAsaasSubscription(subscription.asaas_subscription_id)
  } catch (error) {
    console.error("Falha ao cancelar assinatura Asaas", error instanceof AsaasError ? error.body : error)
    return NextResponse.json({ error: "asaas_error" }, { status: 502 })
  }

  await admin.from("subscriptions").update({
    status: "canceled",
    canceled_at: new Date().toISOString(),
  }).eq("store_id", store.id)

  return NextResponse.json({ canceled: true })
}
