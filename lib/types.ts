// Tipos principais do domínio da vitrine digital.
// Modelados para futura persistência em banco de dados (Neon/Supabase),
// mas por enquanto consumidos a partir de dados mockados em memória.

export type ThemeId =
  | "hamburgueria"
  | "espetaria"
  | "pizzaria"
  | "acai"
  | "confeitaria"
  | "natural"
  | "premium"

export interface StoreTheme {
  id: ThemeId
  label: string
  primary: string // cor primária (oklch)
  accent: string // cor de destaque (oklch)
  background: string // cor de fundo (oklch)
}

// Sobrescrita de cores por cima de um tema da biblioteca — permite que a
// lojista personalize a paleta sem perder a estrutura do template escolhido.
export interface StoreThemeOverrides {
  primary: string // hex, ex: #ff7a1a
  accent: string
  background: string
}

export interface StoreHours {
  day: string
  open: string
  close: string
  closed?: boolean
}

export interface Store {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  logo: string
  coverImage: string
  whatsapp: string // número no formato internacional, ex: 5511999999999
  instagram?: string
  theme: ThemeId
  themeOverrides?: StoreThemeOverrides | null
  minOrder: number
  deliveryTimeMinutes: [number, number]
  rating: number
  reviewsCount: number
  hours: StoreHours[]
  noteLabel?: string | null
  notePlaceholder?: string | null
  deliveryFee?: number | null
}

export interface ProductAddon {
  id: string
  name: string
  price: number
  maxPerProduct?: number
}

export interface ProductAddonGroup {
  id: string
  title: string
  required: boolean
  maxSelections: number
  options: ProductAddon[]
}

export interface Category {
  id: string
  storeId: string
  name: string
  position: number
}

export interface Product {
  id: string
  storeId: string
  categoryId: string
  name: string
  description: string
  price: number
  image: string
  images: string[]
  active: boolean
  featured: boolean
  addonGroups: ProductAddonGroup[]
}

export interface CartItemAddon {
  groupId: string
  addonId: string
  name: string
  price: number
}

export interface CartItem {
  id: string // id único da linha do carrinho
  productId: string
  name: string
  image: string
  unitPrice: number
  quantity: number
  addons: CartItemAddon[]
  note?: string
}

export interface StoreMetricsPoint {
  date: string
  views: number
  ordersStarted: number
  ordersSent: number
}

export interface StoreMetrics {
  totalViews: number
  ordersStarted: number
  ordersSent: number
  conversionRate: number
  topProduct: string
  history: StoreMetricsPoint[]
  topAddons: { name: string; count: number }[]
}

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled"
export type BillingType = "PIX" | "CREDIT_CARD"

export interface Subscription {
  id: string
  storeId: string
  status: SubscriptionStatus
  trialEndsAt: string
  currentPeriodEnd?: string | null
  billingType?: BillingType | null
  cpfCnpj?: string | null
  asaasCustomerId?: string | null
  asaasSubscriptionId?: string | null
  canceledAt?: string | null
  editingLocked: boolean
  storefrontLocked: boolean
}
