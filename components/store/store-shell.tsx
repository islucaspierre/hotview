"use client"

import type { ReactNode } from "react"
import type { Store } from "@/lib/types"
import { CartProvider } from "@/lib/cart-context"
import { CartBar } from "@/components/store/cart-bar"
import { CartSheet } from "@/components/store/cart-sheet"
import { Toaster } from "@/components/ui/sonner"
import { getThemeStyle } from "@/lib/theme-style"

export function StoreShell({ store, children }: { store: Store; children: ReactNode }) {
  const themeStyle = getThemeStyle(store.theme, store.themeOverrides)

  return (
    <div className="min-h-dvh bg-background text-foreground" style={themeStyle}>
      <CartProvider storeId={store.id}>
        <div className="pb-24">{children}</div>
        <CartBar />
        <CartSheet store={store} />
        <Toaster position="top-center" theme={themeStyle.colorScheme === "light" ? "light" : "dark"} />
      </CartProvider>
    </div>
  )
}
