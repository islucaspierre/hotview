"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import type { StoreMetricsPoint } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

interface OrdersFunnelChartProps {
  history: StoreMetricsPoint[]
}

export function OrdersFunnelChart({ history }: OrdersFunnelChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos iniciados x enviados</CardTitle>
        <CardDescription>Quantos clientes montaram o carrinho e finalizaram no WhatsApp</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            ordersStarted: {
              label: "Iniciados",
              color: "var(--chart-1)",
            },
            ordersSent: {
              label: "Enviados",
              color: "var(--chart-2)",
            },
          }}
          className="h-64 w-full"
        >
          <BarChart data={history} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="ordersStarted" fill="var(--color-ordersStarted)" radius={4} />
            <Bar dataKey="ordersSent" fill="var(--color-ordersSent)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
