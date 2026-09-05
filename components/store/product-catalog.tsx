"use client"

import { useState } from "react"
import type { Category, Product, Store } from "@/lib/types"
import { CategoryNav } from "@/components/store/category-nav"
import { ProductCard } from "@/components/store/product-card"
import { ProductSheet } from "@/components/store/product-sheet"

export function ProductCatalog({
  store,
  categories,
  products,
}: {
  store: Store
  categories: Category[]
  products: Product[]
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <div className="px-4 sm:px-0">
      <CategoryNav categories={categories} />

      <div className="flex flex-col gap-8 py-6">
        {categories.map((category) => {
          const categoryProducts = products.filter(
            (p) => p.categoryId === category.id && p.active,
          )
          if (categoryProducts.length === 0) return null

          return (
            <section key={category.id} id={`categoria-${category.id}`} className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-bold text-foreground">{category.name}</h2>
              <div className="flex flex-col gap-3">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <ProductSheet
        store={store}
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null)
        }}
      />
    </div>
  )
}
