"use client"

import type { ReactNode } from "react"
import { Clock } from "lucide-react"
import type { Store } from "@/lib/types"
import { isStoreOpenNow } from "@/lib/store-hours"
import { CartProvider } from "@/lib/cart-context"
import { CartBar } from "@/components/store/cart-bar"
import { CartSheet } from "@/components/store/cart-sheet"
import { Toaster } from "@/components/ui/sonner"
import { getThemeStyle } from "@/lib/theme-style"

export function StoreShell({ store, children }: { store: Store; children: ReactNode }) {
  const themeStyle = getThemeStyle(store.theme, store.themeOverrides)
  const hasHours = store.hours.length > 0
  const isOpen = hasHours ? isStoreOpenNow(store.hours) : true

  return (
    <div className="min-h-dvh bg-background text-foreground" style={themeStyle}>
      <CartProvider storeId={store.id}>
        {hasHours && !isOpen && (
          <div className="flex items-center justify-center gap-2 bg-secondary/80 px-4 py-2.5 text-center text-sm text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            <span>Estamos fechados no momento. Verifique os horários de funcionamento.</span>
          </div>
        )}
        <div className="pb-24">{children}</div>
        <CartBar />
        <CartSheet store={store} isClosed={!isOpen} />
        <Toaster position="top-center" theme={themeStyle.colorScheme === "light" ? "light" : "dark"} />
      </CartProvider>
    </div>
  )
}
