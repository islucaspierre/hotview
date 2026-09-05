import Image from "next/image"
import { Flame } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TopProductCardProps {
  product: Product | undefined
  topProductName: string
}

export function TopProductCard({ product, topProductName }: TopProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produto mais pedido</CardTitle>
        <CardDescription>O item favorito dos seus clientes nesta semana</CardDescription>
      </CardHeader>
      <CardContent>
        {topProductName ? (
          <div className="flex items-center gap-4 rounded-xl bg-secondary/60 p-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
              {product ? (
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Badge className="w-fit gap-1">
                <Flame className="size-3" />
                Mais pedido
              </Badge>
              <p className="font-display text-lg font-semibold text-foreground">{topProductName}</p>
              {product ? (
                <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
            Ainda sem pedidos enviados nos últimos 7 dias.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
