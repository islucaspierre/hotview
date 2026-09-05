"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Minus, Plus } from "lucide-react"
import type { Product, Store } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { useCart } from "@/lib/cart-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { getThemeStyle } from "@/lib/theme-style"

export function ProductSheet({
  store,
  product,
  open,
  onOpenChange,
}: {
  store: Store
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addItem, setCartOpen } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [activePhoto, setActivePhoto] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)

  const photos = useMemo(() => {
    if (!product) return []
    return [product.image, ...product.images].filter(Boolean)
  }, [product])

  function handleGalleryScroll() {
    const el = galleryRef.current
    if (!el || el.clientWidth === 0) return
    setActivePhoto(Math.round(el.scrollLeft / el.clientWidth))
  }

  useEffect(() => {
    if (!product) return
    setQuantity(1)
    setNote("")
    setActivePhoto(0)
    galleryRef.current?.scrollTo({ left: 0 })
    const defaults: Record<string, string[]> = {}
    for (const group of product.addonGroups) {
      if (group.required && group.maxSelections === 1 && group.options[0]) {
        defaults[group.id] = [group.options[0].id]
      } else {
        defaults[group.id] = []
      }
    }
    setSelections(defaults)
  }, [product])

  const addonsTotal = useMemo(() => {
    if (!product) return 0
    let total = 0
    for (const group of product.addonGroups) {
      const selectedIds = selections[group.id] ?? []
      for (const option of group.options) {
        if (selectedIds.includes(option.id)) total += option.price
      }
    }
    return total
  }, [product, selections])

  const unitTotal = (product?.price ?? 0) + addonsTotal
  const total = unitTotal * quantity

  const canSubmit = useMemo(() => {
    if (!product) return false
    return product.addonGroups
      .filter((g) => g.required)
      .every((g) => (selections[g.id]?.length ?? 0) > 0)
  }, [product, selections])

  function toggleOption(groupId: string, optionId: string, max: number, single: boolean) {
    setSelections((prev) => {
      const current = prev[groupId] ?? []
      if (single) {
        return { ...prev, [groupId]: [optionId] }
      }
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) }
      }
      if (current.length >= max) return prev
      return { ...prev, [groupId]: [...current, optionId] }
    })
  }

  function handleAddToCart() {
    if (!product || !canSubmit) return

    const addons = product.addonGroups.flatMap((group) => {
      const selectedIds = selections[group.id] ?? []
      return group.options
        .filter((o) => selectedIds.includes(o.id))
        .map((o) => ({ groupId: group.id, addonId: o.id, name: o.name, price: o.price }))
    })

    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: product.price,
      quantity,
      addons,
      note: note.trim() || undefined,
    })

    toast.success(`${product.name} adicionado ao carrinho`)
    onOpenChange(false)
    setCartOpen(true)
  }

  if (!product) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        style={getThemeStyle(store.theme, store.themeOverrides)}
        className="flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-t-3xl border-border bg-card p-0 text-foreground sm:mx-auto sm:max-w-lg"
      >
        <div className="overflow-y-auto">
          <div className="relative h-48 w-full shrink-0 sm:h-56">
            <div
              ref={galleryRef}
              onScroll={handleGalleryScroll}
              className="flex size-full snap-x snap-mandatory overflow-x-auto"
            >
              {photos.map((photo, index) => (
                <div key={index} className="relative size-full shrink-0 snap-center">
                  <Image src={photo || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                {photos.map((_, index) => (
                  <span
                    key={index}
                    className={`size-1.5 rounded-full transition-colors ${
                      index === activePhoto ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <SheetHeader className="gap-1 px-5 pt-4 text-left">
            <SheetTitle className="font-display text-xl text-card-foreground">{product.name}</SheetTitle>
            <SheetDescription className="text-pretty text-muted-foreground">
              {product.description}
            </SheetDescription>
            <span className="pt-1 text-lg font-semibold text-primary">
              {formatCurrency(product.price)}
            </span>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-5 py-5">
            {product.addonGroups.map((group) => {
              const single = group.required && group.maxSelections === 1
              return (
                <div key={group.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-card-foreground">{group.title}</Label>
                    <span className="text-xs text-muted-foreground">
                      {group.required ? "Obrigatório" : `Até ${group.maxSelections}`}
                    </span>
                  </div>

                  {single ? (
                    <RadioGroup
                      value={selections[group.id]?.[0]}
                      onValueChange={(value) => toggleOption(group.id, value, 1, true)}
                      className="flex flex-col gap-2"
                    >
                      {group.options.map((option) => (
                        <label
                          key={option.id}
                          htmlFor={option.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                        >
                          <span className="flex items-center gap-2">
                            <RadioGroupItem id={option.id} value={option.id} />
                            {option.name}
                          </span>
                          {option.price > 0 && (
                            <span className="text-muted-foreground">+ {formatCurrency(option.price)}</span>
                          )}
                        </label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {group.options.map((option) => {
                        const checked = (selections[group.id] ?? []).includes(option.id)
                        return (
                          <label
                            key={option.id}
                            htmlFor={option.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                          >
                            <span className="flex items-center gap-2">
                              <Checkbox
                                id={option.id}
                                checked={checked}
                                onCheckedChange={() =>
                                  toggleOption(group.id, option.id, group.maxSelections, false)
                                }
                              />
                              {option.name}
                            </span>
                            <span className="text-muted-foreground">+ {formatCurrency(option.price)}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex flex-col gap-2">
              <Label htmlFor="note" className="text-sm font-semibold text-card-foreground">
                {store.noteLabel || "Alguma observação?"}
              </Label>
              <Textarea
                id="note"
                placeholder={store.notePlaceholder || "Ex: sem cebola, ponto mais crocante..."}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none border-border bg-background"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-card px-5 py-4">
          <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1.5">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-7 items-center justify-center rounded-full text-foreground hover:bg-secondary"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-4 text-center text-sm font-semibold text-foreground">{quantity}</span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex size-7 items-center justify-center rounded-full text-foreground hover:bg-secondary"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!canSubmit}
            className="h-11 flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Adicionar · {formatCurrency(total)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
