export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR")
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`
}
