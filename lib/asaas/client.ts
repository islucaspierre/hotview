// Wrapper server-only para a API da Asaas (docs.asaas.com). Nunca importar
// isto em código de cliente — usa ASAAS_API_KEY, um segredo do servidor.

const ASAAS_BASE_URL = process.env.ASAAS_API_BASE_URL ?? "https://api.asaas.com/v3"

export class AsaasError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    super(`Asaas API error ${status}: ${JSON.stringify(body)}`)
    this.status = status
    this.body = body
  }
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: process.env.ASAAS_API_KEY!,
      ...(init?.headers ?? {}),
    },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new AsaasError(res.status, body)
  return body as T
}

export interface AsaasCustomer {
  id: string
}

export function createAsaasCustomer(input: {
  name: string
  cpfCnpj: string
  email?: string
  mobilePhone?: string
}) {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export interface AsaasSubscription {
  id: string
  status: string
  nextDueDate: string
}

export function createAsaasSubscription(input: {
  customer: string
  billingType: "PIX" | "CREDIT_CARD"
  value: number
  nextDueDate: string // YYYY-MM-DD
  cycle: "MONTHLY"
  description?: string
}) {
  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function getAsaasSubscription(id: string) {
  return asaasFetch<AsaasSubscription>(`/subscriptions/${id}`)
}

export function cancelAsaasSubscription(id: string) {
  return asaasFetch<{ deleted: boolean }>(`/subscriptions/${id}`, { method: "DELETE" })
}

export interface AsaasPayment {
  id: string
  invoiceUrl: string
  status: string
  subscription?: string
  customer: string
}

export function listAsaasPaymentsForSubscription(subscriptionId: string) {
  return asaasFetch<{ data: AsaasPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}&limit=1`,
  )
}

export interface AsaasWebhook {
  id: string
}

export function createAsaasWebhook(input: {
  name: string
  url: string
  email: string
  authToken: string
  events: string[]
}) {
  return asaasFetch<AsaasWebhook>("/webhooks", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      url: input.url,
      email: input.email,
      enabled: true,
      interrupted: false,
      apiVersion: 3,
      authToken: input.authToken,
      sendType: "SEQUENTIALLY",
      events: input.events,
    }),
  })
}
