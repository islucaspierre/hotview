"use client"

import { getThemeStyle } from "@/lib/theme-style"
import { StoreHeader } from "@/components/store/store-header"
import { ProductCatalog } from "@/components/store/product-catalog"
import { CartBar } from "@/components/store/cart-bar"
import { CartProvider } from "@/lib/cart-context"
import { kiBatatasStore, categories, products } from "@/lib/mock-data"

// Vitrine de EXEMPLO fixa, usada apenas na página de vendas (marketing).
// Não depende de sessão nem do Supabase — sempre mostra a Ki Batatas,
// mesmo que o visitante esteja logado editando a própria loja.
export function StaticStorePreview() {
  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="rounded-[2.5rem] border-8 border-neutral-900 bg-neutral-900 p-2 shadow-2xl">
        <div
          className="relative h-[640px] overflow-y-auto rounded-[2rem] bg-background"
          style={getThemeStyle(kiBatatasStore.theme, kiBatatasStore.themeOverrides)}
        >
          <CartProvider>
            <div className="pb-20">
              <StoreHeader store={kiBatatasStore} />
              <ProductCatalog store={kiBatatasStore} categories={categories} products={products} />
            </div>
            <div className="sticky bottom-0">
              <CartBar />
            </div>
          </CartProvider>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Exemplo de vitrine — toque nos produtos não funciona aqui
      </p>
    </div>
  )
}
