"use client"

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
  itemCount: number
  subtotal: number
  isCartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

// storeId é opcional: só rastreamos "pedido iniciado" na vitrine pública de
// verdade. Nos previews internos (dashboard, landing page) não passamos
// storeId, para não poluir as métricas reais da loja com cliques de preview.
export function CartProvider({ storeId, children }: { storeId?: string; children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setCartOpen] = useState(false)
  const orderStartedRef = useRef(false)

  function addItem(item: Omit<CartItem, "id">) {
    const id = `${item.productId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setItems((prev) => [...prev, { ...item, id }])
    if (storeId && !orderStartedRef.current) {
      orderStartedRef.current = true
      createClient().from("orders").insert({ store_id: storeId, status: "started", subtotal: 0 }).then(({ error }) => {
        if (error) console.error("Falha ao registrar início de pedido", error)
      })
    }
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function updateQuantity(id: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  function clear() {
    setItems([])
  }

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const addonsTotal = item.addons.reduce((a, addon) => a + addon.price, 0)
        return sum + (item.unitPrice + addonsTotal) * item.quantity
      }, 0),
    [items],
  )

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    itemCount,
    subtotal,
    isCartOpen,
    setCartOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart deve ser usado dentro de um CartProvider")
  return ctx
}
