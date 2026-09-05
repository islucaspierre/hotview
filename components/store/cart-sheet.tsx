"use client"

import Image from "next/image"
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react"
import type { Store } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/format"
import { buildWhatsAppOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { getThemeStyle } from "@/lib/theme-style"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function CartSheet({ store }: { store: Store }) {
  const { items, removeItem, updateQuantity, subtotal, isCartOpen, setCartOpen, clear } = useCart()
  const minOrder = store.minOrder ?? 0
  const missingToMin = Math.max(0, minOrder - subtotal)
  const belowMinimum = missingToMin > 0

  async function handleSendOrder() {
    if (belowMinimum) return
    const supabase = createClient()
    const { data: order, error } = await supabase.from("orders").insert({ store_id: store.id, status: "sent", subtotal }).select("id").single()
    if (error || !order) {
      toast.error("Não foi possível registrar o pedido. Tente novamente.")
      return
    }
    const { data: insertedItems, error: itemsError } = await supabase.from("order_items").insert(items.map((item) => ({ order_id: order.id, product_id: item.productId, product_name: item.name, unit_price: item.unitPrice, quantity: item.quantity, note: item.note }))).select("id")
    if (itemsError) {
      toast.error("Não foi possível registrar os itens do pedido.")
      return
    }
    const addonRows = items.flatMap((item, index) => {
      const orderItemId = insertedItems?.[index]?.id
      if (!orderItemId) return []
      return item.addons.map((addon) => ({ order_item_id: orderItemId, addon_id: addon.addonId, addon_name: addon.name, price: addon.price }))
    })
    if (addonRows.length > 0) {
      const { error: addonsError } = await supabase.from("order_item_addons").insert(addonRows)
      if (addonsError) console.error("Falha ao salvar adicionais do pedido", addonsError)
    }
    const message = buildWhatsAppOrderMessage(store, items, subtotal)
    const url = buildWhatsAppUrl(store.whatsapp, message)
    clear()
    setCartOpen(false)
    // Navega a própria aba em vez de abrir popup: no celular, window.open()
    // chamado depois de operações assíncronas (os inserts acima) é bloqueado
    // silenciosamente pelo navegador por não estar mais "preso" ao toque do
    // usuário. Navegar a aba atual funciona em qualquer navegador/webview e é
    // o padrão usado por botões de "pedir pelo WhatsApp".
    window.location.href = url
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="bottom"
        style={getThemeStyle(store.theme, store.themeOverrides)}
        className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-display text-lg text-card-foreground">Seu pedido</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-5 py-10 text-center text-sm text-muted-foreground">
            Seu carrinho está vazio. Adicione batatas deliciosas para continuar.
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
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-card-foreground">{item.name}</h3>
                        <button
                          type="button"
                          aria-label={`Remover ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      {item.addons.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.addons.map((a) => a.name).join(", ")}
                        </p>
                      )}
                      {item.note && (
                        <p className="text-xs italic text-muted-foreground">Obs: {item.note}</p>
                      )}

                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-border px-1.5 py-1">
                          <button
                            type="button"
                            aria-label="Diminuir quantidade"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex size-6 items-center justify-center rounded-full hover:bg-secondary"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Aumentar quantidade"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex size-6 items-center justify-center rounded-full hover:bg-secondary"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(lineTotal)}
                        </span>
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
                  Faltam {formatCurrency(missingToMin)} para atingir o pedido mínimo de{" "}
                  {formatCurrency(minOrder)}
                </p>
              )}
              <Button
                onClick={handleSendOrder}
                disabled={belowMinimum}
                className="h-12 w-full gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <MessageCircle className="size-5" />
                Enviar pedido pelo WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
