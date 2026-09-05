"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TopAddonsChartProps {
  topAddons: { name: string; count: number }[]
}

export function TopAddonsChart({ topAddons }: TopAddonsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionais mais pedidos</CardTitle>
        <CardDescription>Complementos escolhidos com mais frequência</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Pedidos",
              color: "var(--chart-4)",
            },
          }}
          className="h-64 w-full"
        >
          <BarChart
            data={topAddons}
            layout="vertical"
            margin={{ left: 8, right: 16, top: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={120}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
