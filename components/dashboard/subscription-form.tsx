"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

export function SubscriptionForm({ defaultName }: { defaultName?: string }) {
  const [name, setName] = useState(defaultName ?? "")
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [billingType, setBillingType] = useState<"PIX" | "CREDIT_CARD">("PIX")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error("Informe seu nome"); return }
    if (cpfCnpj.replace(/\D/g, "").length < 11) { toast.error("Informe um CPF ou CNPJ válido"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cpfCnpj, billingType }),
      })
      const data = await res.json()
      if (!res.ok || !data.invoiceUrl) {
        toast.error("Não foi possível iniciar a assinatura. Tente novamente.")
        return
      }
      window.location.href = data.invoiceUrl
    } catch {
      toast.error("Não foi possível iniciar a assinatura. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="subscriber-name">Nome completo</FieldLabel>
          <Input id="subscriber-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="subscriber-cpf">CPF ou CNPJ</FieldLabel>
          <Input
            id="subscriber-cpf"
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder="000.000.000-00"
            required
          />
        </Field>

        <Field>
          <FieldLabel>Forma de pagamento</FieldLabel>
          <RadioGroup value={billingType} onValueChange={(value) => setBillingType(value as "PIX" | "CREDIT_CARD")}>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <RadioGroupItem value="PIX" />
              Pix
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <RadioGroupItem value="CREDIT_CARD" />
              Cartão de crédito
            </label>
          </RadioGroup>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={loading} className="mt-6 w-full rounded-full">
        {loading ? "Gerando cobrança..." : "Assinar por R$ 39,70/mês"}
      </Button>
    </form>
  )
}
