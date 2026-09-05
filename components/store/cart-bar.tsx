"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"

export function CartBar() {
  const { itemCount, subtotal, setCartOpen } = useCart()

  if (itemCount === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-0">
      <div className="mx-auto max-w-lg">
        <Button
          onClick={() => setCartOpen(true)}
          className="flex h-14 w-full items-center justify-between rounded-full bg-primary px-5 text-primary-foreground shadow-xl hover:bg-primary/90"
        >
          <span className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="size-5" />
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </span>
          <span className="font-semibold">Ver carrinho · {formatCurrency(subtotal)}</span>
        </Button>
      </div>
    </div>
  )
}
