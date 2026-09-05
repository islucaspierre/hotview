"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import type { StoreMetricsPoint } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ViewsTrendChartProps {
  history: StoreMetricsPoint[]
}

export function ViewsTrendChart({ history }: ViewsTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualizações da vitrine</CardTitle>
        <CardDescription>Acessos à página pública nos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            views: {
              label: "Visualizações",
              color: "var(--chart-1)",
            },
          }}
          className="h-64 w-full"
        >
          <AreaChart data={history} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="views"
              type="monotone"
              fill="url(#fillViews)"
              stroke="var(--color-views)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
