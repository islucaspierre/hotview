"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

export function ProductCard({
  product,
  onSelect,
}: {
  product: Product
  onSelect: (product: Product) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-24">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.featured && (
          <Badge className="absolute left-1 top-1 bg-accent px-1.5 py-0 text-[10px] text-accent-foreground">
            Destaque
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-display text-base font-semibold text-card-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">{product.description}</p>
        <span className="mt-1 font-semibold text-primary">{formatCurrency(product.price)}</span>
      </div>

      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105"
        aria-hidden
      >
        <Plus className="size-4" />
      </div>
    </button>
  )
}
