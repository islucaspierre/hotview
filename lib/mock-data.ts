import type { Category, Product, Store, StoreMetrics } from "@/lib/types"

export const kiBatatasStore: Store = {
  id: "store_ki_batatas",
  slug: "ki-batatas",
  name: "Ki Batatas",
  tagline: "Batatas recheadas que viram evento",
  description:
    "Batatas rústicas fritas na hora, recheadas com muito queijo e ingredientes selecionados. Peça pelo WhatsApp e receba em minutos.",
  logo: "/images/ki-batatas/logo.png",
  coverImage: "/images/ki-batatas/cover.png",
  whatsapp: "5511987654321",
  instagram: "@kibatatas",
  theme: "premium",
  minOrder: 20,
  deliveryTimeMinutes: [25, 40],
  rating: 4.8,
  reviewsCount: 312,
  hours: [
    { day: "Segunda", open: "18:00", close: "23:00" },
    { day: "Terça", open: "18:00", close: "23:00" },
    { day: "Quarta", open: "18:00", close: "23:00" },
    { day: "Quinta", open: "18:00", close: "23:30" },
    { day: "Sexta", open: "18:00", close: "00:30" },
    { day: "Sábado", open: "17:00", close: "00:30" },
    { day: "Domingo", open: "17:00", close: "23:00" },
  ],
}

export const categories: Category[] = [
  { id: "cat_classicas", storeId: kiBatatasStore.id, name: "Clássicas", position: 1 },
  { id: "cat_recheadas", storeId: kiBatatasStore.id, name: "Recheadas", position: 2 },
  { id: "cat_especiais", storeId: kiBatatasStore.id, name: "Especiais", position: 3 },
  { id: "cat_bebidas", storeId: kiBatatasStore.id, name: "Bebidas", position: 4 },
]

const addonGroupExtras = {
  id: "grupo_extras",
  title: "Adicionais",
  required: false,
  maxSelections: 4,
  options: [
    { id: "add_cheddar", name: "Cheddar extra", price: 6 },
    { id: "add_bacon", name: "Bacon extra", price: 7 },
    { id: "add_catupiry", name: "Catupiry extra", price: 6 },
    { id: "add_cebola", name: "Cebola caramelizada", price: 4 },
  ],
}

const addonGroupPonto = {
  id: "grupo_ponto",
  title: "Ponto da batata",
  required: true,
  maxSelections: 1,
  options: [
    { id: "ponto_normal", name: "Ao ponto", price: 0 },
    { id: "ponto_crocante", name: "Bem crocante", price: 0 },
  ],
}

export const products: Product[] = [
  {
    id: "prod_classica",
    storeId: kiBatatasStore.id,
    categoryId: "cat_classicas",
    name: "Batata Clássica",
    description: "Batata rústica frita na hora com sal e ervas finas.",
    price: 18,
    image: "/images/ki-batatas/classica.png",
    active: true,
    featured: false,
    addonGroups: [addonGroupPonto, addonGroupExtras],
  },
  {
    id: "prod_bacon_cheddar",
    storeId: kiBatatasStore.id,
    categoryId: "cat_recheadas",
    name: "Bacon & Cheddar",
    description: "Batata rústica coberta com cheddar cremoso e bacon crocante.",
    price: 26,
    image: "/images/ki-batatas/bacon-cheddar.png",
    active: true,
    featured: true,
    addonGroups: [addonGroupPonto, addonGroupExtras],
  },
  {
    id: "prod_suprema",
    storeId: kiBatatasStore.id,
    categoryId: "cat_especiais",
    name: "Batata Suprema",
    description: "Carne desfiada temperada, catupiry e cebolinha fresca.",
    price: 32,
    image: "/images/ki-batatas/suprema.png",
    active: true,
    featured: true,
    addonGroups: [addonGroupPonto, addonGroupExtras],
  },
  {
    id: "prod_frango_catupiry",
    storeId: kiBatatasStore.id,
    categoryId: "cat_recheadas",
    name: "Frango com Catupiry",
    description: "Frango desfiado suculento com catupiry derretido.",
    price: 28,
    image: "/images/ki-batatas/frango-catupiry.png",
    active: true,
    featured: false,
    addonGroups: [addonGroupPonto, addonGroupExtras],
  },
  {
    id: "prod_calabresa",
    storeId: kiBatatasStore.id,
    categoryId: "cat_recheadas",
    name: "Calabresa Acebolada",
    description: "Calabresa grelhada com cebola caramelizada na medida certa.",
    price: 27,
    image: "/images/ki-batatas/calabresa.png",
    active: true,
    featured: false,
    addonGroups: [addonGroupPonto, addonGroupExtras],
  },
  {
    id: "prod_vegana",
    storeId: kiBatatasStore.id,
    categoryId: "cat_especiais",
    name: "Batata Vegana",
    description: "Creme de castanha, tomate cereja e ervas frescas.",
    price: 29,
    image: "/images/ki-batatas/vegana.png",
    active: true,
    featured: false,
    addonGroups: [addonGroupPonto],
  },
  {
    id: "prod_suco",
    storeId: kiBatatasStore.id,
    categoryId: "cat_bebidas",
    name: "Suco Natural de Laranja",
    description: "Copo 500ml, feito na hora com laranjas selecionadas.",
    price: 10,
    image: "/images/ki-batatas/suco.png",
    active: true,
    featured: false,
    addonGroups: [],
  },
  {
    id: "prod_refrigerante",
    storeId: kiBatatasStore.id,
    categoryId: "cat_bebidas",
    name: "Refrigerante Lata",
    description: "Lata 350ml bem gelada.",
    price: 7,
    image: "/images/ki-batatas/refrigerante.png",
    active: true,
    featured: false,
    addonGroups: [],
  },
]

// Métricas simuladas para a dashboard (Fase 5).
export const storeMetrics: StoreMetrics = {
  totalViews: 4218,
  ordersStarted: 386,
  ordersSent: 251,
  conversionRate: 0.65,
  topProduct: "Batata Suprema",
  topAddons: [
    { name: "Bacon extra", count: 142 },
    { name: "Cheddar extra", count: 118 },
    { name: "Cebola caramelizada", count: 74 },
  ],
  history: [
    { date: "12/08", views: 512, ordersStarted: 48, ordersSent: 31 },
    { date: "13/08", views: 486, ordersStarted: 44, ordersSent: 29 },
    { date: "14/08", views: 601, ordersStarted: 57, ordersSent: 38 },
    { date: "15/08", views: 578, ordersStarted: 55, ordersSent: 34 },
    { date: "16/08", views: 702, ordersStarted: 66, ordersSent: 45 },
    { date: "17/08", views: 833, ordersStarted: 79, ordersSent: 52 },
    { date: "18/08", views: 506, ordersStarted: 37, ordersSent: 22 },
  ],
}

export function getStoreBySlug(slug: string): Store | undefined {
  if (slug === kiBatatasStore.slug) return kiBatatasStore
  return undefined
}

export function getCategoriesByStore(storeId: string): Category[] {
  return categories
    .filter((c) => c.storeId === storeId)
    .sort((a, b) => a.position - b.position)
}

export function getProductsByStore(storeId: string): Product[] {
  return products.filter((p) => p.storeId === storeId)
}
