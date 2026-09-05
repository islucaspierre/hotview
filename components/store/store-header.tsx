"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Star, Clock, AtSign } from "lucide-react"
import type { Store } from "@/lib/types"
import { isStoreOpenNow } from "@/lib/store-hours"
import { formatCurrency } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

export function StoreHeader({ store }: { store: Store }) {
  const [open, setOpen] = useState<boolean | null>(null)

  useEffect(() => {
    setOpen(isStoreOpenNow(store.hours))
  }, [store.hours])

  return (
    <header className="relative">
      <div className="relative h-48 w-full overflow-hidden sm:h-64">
        <Image
          src={store.coverImage || "/placeholder.svg"}
          alt={`Capa da loja ${store.name}`}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
      </div>

      <div className="relative -mt-14 flex flex-col items-center px-4 text-center sm:-mt-16">
        <div className="size-24 shrink-0 overflow-hidden rounded-full border-4 border-background bg-card shadow-lg sm:size-28">
          <Image
            src={store.logo || "/placeholder.svg"}
            alt={`Logo ${store.name}`}
            width={112}
            height={112}
            className="size-full object-cover"
          />
        </div>

        <h1 className="mt-3 font-display text-2xl font-bold text-balance text-foreground sm:text-3xl">
          {store.name}
        </h1>
        <p className="mt-1 max-w-md text-sm text-pretty text-muted-foreground">{store.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-border bg-card text-card-foreground"
          >
            <Star className="size-3.5 fill-primary text-primary" />
            {store.rating.toFixed(1)}
            <span className="text-muted-foreground">({store.reviewsCount})</span>
          </Badge>

          <Badge
            variant="outline"
            className="gap-1.5 border-border bg-card text-card-foreground"
          >
            <Clock className="size-3.5" />
            {store.deliveryTimeMinutes[0]}–{store.deliveryTimeMinutes[1]} min
          </Badge>

          <Badge
            className={
              open
                ? "gap-1.5 bg-primary text-primary-foreground"
                : "gap-1.5 bg-secondary text-secondary-foreground"
            }
          >
            <span
              className={`size-1.5 rounded-full ${open ? "bg-primary-foreground" : "bg-muted-foreground"}`}
              aria-hidden
            />
            {open === null ? "Horário de funcionamento" : open ? "Aberto agora" : "Fechado agora"}
          </Badge>

          {store.instagram && (
            <Badge variant="outline" className="gap-1.5 border-border bg-card text-card-foreground">
              <AtSign className="size-3.5" />
              {store.instagram}
            </Badge>
          )}
        </div>

        {store.minOrder > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Pedido mínimo de {formatCurrency(store.minOrder)}
          </p>
        )}
      </div>
    </header>
  )
}
