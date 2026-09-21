"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, Trash2, MessageCircle, MapPin, Store as StoreIcon, QrCode, Tag, X, Check } from "lucide-react"
import type { Store } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/format"
import { buildWhatsAppOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp"
import { buildPixCopiaECola } from "@/lib/pix"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { getThemeStyle } from "@/lib/theme-style"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type DeliveryMethod = "delivery" | "pickup"
type CheckoutStep = "cart" | "checkout" | "pix"
type PaymentMethod = "on_delivery" | "pix"

interface CouponState {
  code: string
  status: "idle" | "loading" | "valid" | "invalid"
  discount: number
  type: "percent" | "fixed" | null
  message: string
}

const EMPTY_COUPON: CouponState = { code: "", status: "idle", discount: 0, type: null, message: "" }

export function CartSheet({ store, isClosed = false }: { store: Store; isClosed?: boolean }) {
  const { items, removeItem, updateQuantity, subtotal, isCartOpen, setCartOpen, clear } = useCart()
  const [step, setStep] = useState<CheckoutStep>("cart")
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("on_delivery")
  const [rua, setRua] = useState(() => { try { return localStorage.getItem("hv_rua") ?? "" } catch { return "" } })
  const [numero, setNumero] = useState(() => { try { return localStorage.getItem("hv_numero") ?? "" } catch { return "" } })
  const [bairro, setBairro] = useState(() => { try { return localStorage.getItem("hv_bairro") ?? "" } catch { return "" } })
  const [complemento, setComplemento] = useState(() => { try { return localStorage.getItem("hv_complemento") ?? "" } catch { return "" } })
  const [coupon, setCoupon] = useState<CouponState>(EMPTY_COUPON)
  const [couponInput, setCouponInput] = useState("")
  const [pixCopied, setPixCopied] = useState(false)

  const minOrder = store.minOrder ?? 0
  const missingToMin = Math.max(0, minOrder - subtotal)
  const belowMinimum = missingToMin > 0
  const deliveryFee = deliveryMethod === "delivery" ? (store.deliveryFee ?? 0) : 0
  const discountAmount = coupon.status === "valid"
    ? coupon.type === "percent"
      ? Math.min(subtotal * coupon.discount / 100, subtotal)
      : Math.min(coupon.discount, subtotal)
    : 0
  const total = subtotal + deliveryFee - discountAmount

  const fullAddress = [rua.trim(), numero.trim(), bairro.trim(), complemento.trim()].filter(Boolean).join(", ")
  const deliveryReady = rua.trim() && numero.trim() && bairro.trim()
  const hasPixKey = Boolean(store.pixKey)
  const pixCode = hasPixKey && paymentMethod === "pix"
    ? buildPixCopiaECola(store.pixKey!, total, store.name)
    : null

  function handleOpenChange(open: boolean) {
    setCartOpen(open)
    if (!open) {
      setStep("cart")
      setDeliveryMethod(null)
      setPaymentMethod("on_delivery")
      setCoupon(EMPTY_COUPON)
      setCouponInput("")
      setPixCopied(false)
      setRua("")
      setNumero("")
      setBairro("")
      setComplemento("")
    }
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCoupon({ ...EMPTY_COUPON, code, status: "loading" })
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store.id, code, subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setCoupon({ code, status: "valid", discount: data.discount, type: data.type, message: data.message })
        toast.success(data.message)
      } else {
        setCoupon({ ...EMPTY_COUPON, code, status: "invalid", message: data.message })
        toast.error(data.message)
      }
    } catch {
      setCoupon({ ...EMPTY_COUPON, code, status: "invalid", message: "Erro ao validar cupom" })
      toast.error("Erro ao validar cupom")
    }
  }

  function handleCopyPix() {
    if (!pixCode) return
    navigator.clipboard?.writeText(pixCode).catch(() => {})
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 3000)
    toast.success("Código Pix copiado!")
  }

  async function handleSendOrder() {
    if (belowMinimum || !deliveryMethod) return
    if (deliveryMethod === "delivery" && !deliveryReady) {
      toast.error("Por favor, preencha rua, número e bairro.")
      return
    }
    if (isClosed) {
      toast.error("A loja está fechada no momento.")
      return
    }
    const supabase = createClient()
    const orderId = crypto.randomUUID()
    const { error } = await supabase
      .from("orders")
      .insert({ id: orderId, store_id: store.id, status: "sent", subtotal: total })
    if (error) {
      console.error("[cart] orders insert error:", error)
      toast.error("Não foi possível registrar o pedido. Tente novamente.")
      return
    }
    const orderItemsToInsert = items.map((item) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      note: item.note,
    }))
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert)
    if (itemsError) {
      console.error("[cart] order_items insert error:", itemsError)
      toast.error("Não foi possível registrar os itens do pedido.")
      return
    }
    const addonRows = items.flatMap((item, index) => {
      const orderItemId = orderItemsToInsert[index]?.id
      if (!orderItemId) return []
      return item.addons.map((addon) => ({
        order_item_id: orderItemId,
        addon_id: addon.addonId,
        addon_name: addon.name,
        price: addon.price,
      }))
    })
    if (addonRows.length > 0) {
      const { error: addonsError } = await supabase.from("order_item_addons").insert(addonRows)
      if (addonsError) console.error("Falha ao salvar adicionais do pedido", addonsError)
    }
    // Incrementa uso do cupom se aplicado
    if (coupon.status === "valid") {
      await supabase.rpc("increment_coupon_uses", { p_store_id: store.id, p_code: coupon.code }).catch(() => {})
    }
    try {
      localStorage.setItem("hv_rua", rua.trim())
      localStorage.setItem("hv_numero", numero.trim())
      localStorage.setItem("hv_bairro", bairro.trim())
      localStorage.setItem("hv_complemento", complemento.trim())
    } catch {}
    const couponLine = coupon.status === "valid" ? `\nCupom: ${coupon.code} (-${coupon.type === "percent" ? `${coupon.discount}%` : formatCurrency(coupon.discount)})` : ""
    const paymentLine = paymentMethod === "pix" ? "\nPagamento: via Pix (já realizado)" : ""
    const message = buildWhatsAppOrderMessage(store, items, subtotal, deliveryMethod, fullAddress, deliveryFee) + couponLine + paymentLine
    const url = buildWhatsAppUrl(store.whatsapp, message)
    clear()
    setCartOpen(false)
    window.location.href = url
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={step === "cart"}
        style={getThemeStyle(store.theme, store.themeOverrides)}
        className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground sm:mx-auto sm:max-w-lg"
      >
        {/* ── CART STEP ── */}
        {step === "cart" && (
          <>
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <SheetTitle className="font-display text-lg text-card-foreground">Seu pedido</SheetTitle>
            </SheetHeader>

            {items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-5 py-10 text-center text-sm text-muted-foreground">
                Seu carrinho está vazio. Adicione produtos para continuar.
              </div>
            ) : (
              <>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                  {items.map((item) => {
                    const addonsTotal = item.addons.reduce((sum, a) => sum + a.price, 0)
                    const lineTotal = (item.unitPrice + addonsTotal) * item.quantity
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-card-foreground">{item.name}</h3>
                            <button type="button" aria-label={`Remover ${item.name}`} onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          {item.addons.length > 0 && <p className="text-xs text-muted-foreground">{item.addons.map((a) => a.name).join(", ")}</p>}
                          {item.note && <p className="text-xs italic text-muted-foreground">Obs: {item.note}</p>}
                          <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-border px-1.5 py-1">
                              <button type="button" aria-label="Diminuir quantidade" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex size-6 items-center justify-center rounded-full hover:bg-secondary">
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                              <button type="button" aria-label="Aumentar quantidade" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex size-6 items-center justify-center rounded-full hover:bg-secondary">
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-primary">{formatCurrency(lineTotal)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-base font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                  </div>
                  {belowMinimum && (
                    <p className="rounded-lg bg-secondary px-3 py-2 text-center text-xs text-muted-foreground">
                      Faltam {formatCurrency(missingToMin)} para atingir o pedido mínimo de {formatCurrency(minOrder)}
                    </p>
                  )}
                  <button type="button" onClick={() => setCartOpen(false)} className="py-1 text-center text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                    + Adicionar mais itens
                  </button>
                  <Button onClick={() => setStep("checkout")} disabled={belowMinimum} className="h-12 w-full gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    Continuar
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── CHECKOUT STEP ── */}
        {step === "checkout" && (
          <>
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Voltar ao carrinho" onClick={() => setStep("cart")} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-5" />
                </button>
                <SheetTitle className="font-display text-lg text-card-foreground">Finalizar pedido</SheetTitle>
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
              {/* Entrega / retirada */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-card-foreground">Como quer receber?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setDeliveryMethod("delivery")} className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-colors ${deliveryMethod === "delivery" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    <MapPin className="size-6" />
                    <span className="text-sm font-semibold">Entrega</span>
                  </button>
                  <button type="button" onClick={() => setDeliveryMethod("pickup")} className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-colors ${deliveryMethod === "pickup" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    <StoreIcon className="size-6" />
                    <span className="text-sm font-semibold">Retirada</span>
                  </button>
                </div>
              </div>

              {/* Endereço */}
              {deliveryMethod === "delivery" && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-card-foreground">Endereço de entrega</p>
                  <input type="text" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua / Avenida *" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número *" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro *" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Complemento (opcional)" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              )}

              {/* Forma de pagamento (só se tiver chave Pix) */}
              {hasPixKey && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-card-foreground">Forma de pagamento</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPaymentMethod("on_delivery")} className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-3 text-xs transition-colors ${paymentMethod === "on_delivery" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      <StoreIcon className="size-5" />
                      <span className="font-semibold">Na entrega / retirada</span>
                    </button>
                    <button type="button" onClick={() => setPaymentMethod("pix")} className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-3 text-xs transition-colors ${paymentMethod === "pix" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      <QrCode className="size-5" />
                      <span className="font-semibold">Pagar via Pix</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Cupom */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-card-foreground">Cupom de desconto</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="CUPOM10"
                      disabled={coupon.status === "valid"}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-4 text-sm uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                  {coupon.status === "valid" ? (
                    <button type="button" onClick={() => { setCoupon(EMPTY_COUPON); setCouponInput("") }} className="flex h-full items-center gap-1 rounded-xl border border-border px-3 text-xs text-muted-foreground hover:text-foreground">
                      <X className="size-3.5" /> Remover
                    </button>
                  ) : (
                    <Button type="button" variant="secondary" onClick={handleApplyCoupon} disabled={!couponInput.trim() || coupon.status === "loading"} className="h-auto rounded-xl px-4 text-sm">
                      {coupon.status === "loading" ? "..." : "Aplicar"}
                    </Button>
                  )}
                </div>
                {coupon.status === "valid" && (
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="size-3" /> {coupon.message}
                  </p>
                )}
                {coupon.status === "invalid" && (
                  <p className="text-xs text-destructive">{coupon.message}</p>
                )}
              </div>

              {/* Resumo */}
              <div className="flex flex-col gap-2 rounded-2xl bg-secondary/50 px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span className="font-semibold text-foreground">{deliveryFee === 0 ? "Grátis" : formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Desconto ({coupon.code})</span>
                    <span className="font-semibold text-green-600">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-base font-bold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Aviso de loja fechada */}
              {isClosed && (
                <p className="rounded-xl bg-secondary px-4 py-3 text-center text-sm text-muted-foreground">
                  A loja está fechada no momento. Você pode montar o pedido, mas não conseguirá enviá-lo agora.
                </p>
              )}
            </div>

            {/* Ação */}
            <div className="border-t border-border px-5 py-4 flex flex-col gap-3">
              {paymentMethod === "pix" && hasPixKey && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep("pix")}
                  disabled={!deliveryMethod || (deliveryMethod === "delivery" && !deliveryReady)}
                  className="h-12 w-full gap-2 rounded-full disabled:opacity-50"
                >
                  <QrCode className="size-5" />
                  Ver código Pix para pagar
                </Button>
              )}
              <Button
                onClick={handleSendOrder}
                disabled={isClosed || !deliveryMethod || (deliveryMethod === "delivery" && !deliveryReady)}
                className="h-12 w-full gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <MessageCircle className="size-5" />
                {isClosed ? "Loja fechada" : "Enviar pedido pelo WhatsApp"}
              </Button>
            </div>
          </>
        )}

        {/* ── PIX STEP ── */}
        {step === "pix" && (
          <>
            <SheetHeader className="border-b border-border px-5 py-4 text-left">
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Voltar" onClick={() => setStep("checkout")} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-5" />
                </button>
                <SheetTitle className="font-display text-lg text-card-foreground">Pagar via Pix</SheetTitle>
              </div>
            </SheetHeader>
            <div className="flex flex-1 flex-col items-center gap-5 overflow-y-auto px-5 py-6">
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-3xl font-bold text-primary">{formatCurrency(total)}</span>
                <span className="text-sm text-muted-foreground">para {store.name}</span>
              </div>
              <div className="w-full rounded-2xl bg-secondary/50 px-4 py-4 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código Pix Copia e Cola</p>
                <p className="break-all rounded-lg bg-background px-3 py-3 text-xs font-mono text-foreground select-all">
                  {pixCode}
                </p>
                <Button type="button" onClick={handleCopyPix} className="h-11 w-full gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {pixCopied ? <><Check className="size-4" /> Copiado!</> : "Copiar código Pix"}
                </Button>
              </div>
              <ol className="w-full flex flex-col gap-2 text-sm text-muted-foreground list-none">
                <li className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">1</span> Copie o código acima</li>
                <li className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">2</span> Abra o app do seu banco → Pix → Copia e Cola</li>
                <li className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">3</span> Cole e confirme o pagamento</li>
                <li className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">4</span> Volte aqui e envie o pedido pelo WhatsApp</li>
              </ol>
            </div>
            <div className="border-t border-border px-5 py-4">
              <Button
                onClick={handleSendOrder}
                disabled={isClosed || !deliveryMethod}
                className="h-12 w-full gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <MessageCircle className="size-5" />
                Já paguei · Enviar pedido pelo WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
