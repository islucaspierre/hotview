"use client"

import { useEffect, useState } from "react"
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useStoreSettings } from "@/lib/store-settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Coupon {
  id: string
  code: string
  type: "percent" | "fixed"
  value: number
  min_order: number | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  active: boolean
}

const EMPTY_FORM = { code: "", type: "percent" as const, value: "", min_order: "", max_uses: "", expires_at: "" }

export default function CuponsPage() {
  const { store } = useStoreSettings()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!store.id) return
    supabase
      .from("coupons")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setCoupons((data as Coupon[]) ?? []); setLoading(false) })
  }, [store.id])

  async function handleCreate() {
    const code = form.code.trim().toUpperCase()
    if (!code) { toast.error("Digite o código do cupom"); return }
    const value = parseFloat(form.value)
    if (!value || value <= 0) { toast.error("Digite um valor válido"); return }
    if (form.type === "percent" && value > 100) { toast.error("Percentual máximo: 100%"); return }

    setSaving(true)
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        store_id: store.id,
        code,
        type: form.type,
        value,
        min_order: form.min_order ? parseFloat(form.min_order) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        active: true,
      })
      .select("*")
      .single()
    setSaving(false)
    if (error) {
      toast.error(error.message.includes("unique") ? "Esse código já existe" : "Erro ao criar cupom")
      return
    }
    setCoupons((prev) => [data as Coupon, ...prev])
    setForm(EMPTY_FORM)
    toast.success("Cupom criado com sucesso!")
  }

  async function handleToggle(id: string, active: boolean) {
    await supabase.from("coupons").update({ active: !active }).eq("id", id)
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active: !active } : c))
  }

  async function handleDelete(id: string) {
    await supabase.from("coupons").delete().eq("id", id)
    setCoupons((prev) => prev.filter((c) => c.id !== id))
    toast.success("Cupom removido")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Cupons de desconto</h1>
        <p className="mt-1 text-sm text-muted-foreground">Crie códigos de desconto para compartilhar com seus clientes.</p>
      </div>

      {/* Form de criação */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
        <h2 className="font-display text-base font-semibold text-foreground">Novo cupom</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Código</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="PROMO10" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percent" | "fixed" }))}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="percent">Porcentagem (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="value">{form.type === "percent" ? "Desconto (%)" : "Valor (R$)"}</Label>
            <Input id="value" type="number" min={0} step={form.type === "percent" ? 1 : 0.5} value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder={form.type === "percent" ? "10" : "5,00"} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="min_order">Pedido mínimo (R$, opcional)</Label>
            <Input id="min_order" type="number" min={0} value={form.min_order} onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))} placeholder="0" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="max_uses">Usos máximos (opcional)</Label>
            <Input id="max_uses" type="number" min={1} value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))} placeholder="Ilimitado" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expires_at">Validade (opcional)</Label>
            <Input id="expires_at" type="datetime-local" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={saving} className="self-start gap-2 rounded-full">
          <Plus className="size-4" />
          {saving ? "Criando..." : "Criar cupom"}
        </Button>
      </div>

      {/* Lista */}
      {!loading && coupons.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
          <Tag className="size-9 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhum cupom criado ainda.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {coupons.map((coupon) => (
          <div key={coupon.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 ${coupon.active ? "border-border bg-card" : "border-border/50 bg-card/50 opacity-60"}`}>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">{coupon.code}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {coupon.type === "percent" ? `${coupon.value}%` : `R$ ${Number(coupon.value).toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {coupon.uses_count} uso{coupon.uses_count !== 1 ? "s" : ""}
                {coupon.max_uses != null ? ` / ${coupon.max_uses} máx` : ""}
                {coupon.min_order != null ? ` · mín. R$ ${Number(coupon.min_order).toFixed(2).replace(".", ",")}` : ""}
                {coupon.expires_at ? ` · até ${new Intl.DateTimeFormat("pt-BR").format(new Date(coupon.expires_at))}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => handleToggle(coupon.id, coupon.active)} aria-label={coupon.active ? "Desativar" : "Ativar"} className="text-muted-foreground hover:text-foreground transition-colors">
                {coupon.active ? <ToggleRight className="size-6 text-primary" /> : <ToggleLeft className="size-6" />}
              </button>
              <button type="button" onClick={() => handleDelete(coupon.id)} aria-label="Remover" className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
