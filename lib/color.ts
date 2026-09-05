// Utilitários de conversão de cor. Os temas da biblioteca são definidos em
// oklch() (para combinar com os design tokens do app), mas o seletor de cor
// nativo do navegador (<input type="color">) só entende hex — por isso
// precisamos converter oklch -> hex ao inicializar os campos personalizados.

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

// Companding linear -> sRGB (gamma).
function linearToSrgb(value: number): number {
  const v = clamp01(value)
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
}

function toHexByte(value: number): string {
  const byte = Math.round(clamp01(value) * 255)
  return byte.toString(16).padStart(2, "0")
}

/**
 * Converte uma string "oklch(L C H)" para hex "#rrggbb".
 * Baseado nas matrizes de conversão OKLab -> sRGB de Björn Ottosson.
 */
export function oklchToHex(oklch: string): string {
  const match = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i)
  if (!match) return "#000000"

  const L = Number.parseFloat(match[1])
  const C = Number.parseFloat(match[2])
  const hDeg = Number.parseFloat(match[3])
  const hRad = (hDeg * Math.PI) / 180

  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  const rHex = toHexByte(linearToSrgb(r))
  const gHex = toHexByte(linearToSrgb(g))
  const bHex = toHexByte(linearToSrgb(bl))

  return `#${rHex}${gHex}${bHex}`
}

/** Converte uma cor oklch(...) ou já em hex para um hex normalizado. */
export function toHex(color: string): string {
  if (color.startsWith("#")) return color
  if (color.startsWith("oklch")) return oklchToHex(color)
  return "#000000"
}
