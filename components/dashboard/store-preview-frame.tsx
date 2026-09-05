"use client"

import { getThemeStyle } from "@/lib/theme-style"
import { useStoreSettings } from "@/lib/store-settings-context"
import { StoreHeader } from "@/components/store/store-header"
import { ProductCatalog } from "@/components/store/product-catalog"
import { CartBar } from "@/components/store/cart-bar"
import { CartProvider } from "@/lib/cart-context"

// Preview em tempo real da vitrine dentro de uma moldura de celular.
// Reaproveita os MESMOS componentes da vitrine pública (/loja/[slug]),
// garantindo que o que o painel mostra é exatamente o que o cliente final vê.
export function StorePreviewFrame() {
  const { store, productList, categoryList } = useStoreSettings()
  const categories = categoryList.filter((c) => c.storeId === store.id)
  const activeProducts = productList.filter((p) => p.storeId === store.id)

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="rounded-[2.5rem] border-8 border-neutral-900 bg-neutral-900 p-2 shadow-2xl">
        <div
          className="relative h-[640px] overflow-y-auto rounded-[2rem] bg-background"
          style={getThemeStyle(store.theme, store.themeOverrides)}
        >
          <CartProvider>
            <div className="pb-20">
              <StoreHeader store={store} />
              <ProductCatalog store={store} categories={categories} products={activeProducts} />
            </div>
            <div className="sticky bottom-0">
              <CartBar />
            </div>
          </CartProvider>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Pré-visualização em tempo real — toque nos produtos não funciona aqui
      </p>
    </div>
  )
}
