import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface MetricCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

export function MetricCard({ label, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
