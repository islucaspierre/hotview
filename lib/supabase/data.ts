import { createClient } from "@/lib/supabase/client"
import type { Category, Product, ProductAddonGroup, Store, StoreHours, Subscription } from "@/lib/types"

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

type StoreRow = {
  id: string
  owner_id: string
  slug: string
  name: string
  tagline: string
  description: string
  logo: string
  cover_image: string
  whatsapp: string
  instagram: string | null
  theme: Store["theme"]
  theme_overrides: Store["themeOverrides"]
  min_order: number
  delivery_min_minutes: number
  delivery_max_minutes: number
  rating: number
  reviews_count: number
  note_label?: string | null
  note_placeholder?: string | null
  delivery_fee?: number | null
}

export function mapStore(row: StoreRow, hours: StoreHours[] = []): Store {
  return {
    id: row.id, slug: row.slug, name: row.name, tagline: row.tagline,
    description: row.description, logo: row.logo, coverImage: row.cover_image,
    whatsapp: row.whatsapp, instagram: row.instagram ?? undefined, theme: row.theme,
    themeOverrides: row.theme_overrides, minOrder: Number(row.min_order),
    deliveryTimeMinutes: [row.delivery_min_minutes, row.delivery_max_minutes],
    rating: Number(row.rating), reviewsCount: row.reviews_count, hours,
    noteLabel: row.note_label ?? null, notePlaceholder: row.note_placeholder ?? null,
    deliveryFee: row.delivery_fee != null ? Number(row.delivery_fee) : 0,
  }
}

export function mapCategory(row: { id: string; store_id: string; name: string; position: number }): Category {
  return { id: row.id, storeId: row.store_id, name: row.name, position: row.position }
}

export function mapSubscription(row: any): Subscription {
  return {
    id: row.id, storeId: row.store_id, status: row.status, trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end, billingType: row.billing_type, cpfCnpj: row.cpf_cnpj,
    asaasCustomerId: row.asaas_customer_id, asaasSubscriptionId: row.asaas_subscription_id,
    canceledAt: row.canceled_at, editingLocked: row.editing_locked, storefrontLocked: row.storefront_locked,
  }
}

export function mapProduct(row: any, groups: any[] = [], addons: any[] = []): Product {
  const addonGroups: ProductAddonGroup[] = groups.filter((group) => group.product_id === row.id).map((group) => ({
    id: group.id, title: group.title, required: group.required, maxSelections: group.max_selections,
    options: addons.filter((addon) => addon.group_id === group.id).map((addon) => ({ id: addon.id, name: addon.name, price: Number(addon.price), maxPerProduct: addon.max_per_product ?? undefined })),
  }))
  return { id: row.id, storeId: row.store_id, categoryId: row.category_id, name: row.name, description: row.description, price: Number(row.price), image: row.image, images: row.images ?? [], active: row.active, featured: row.featured, addonGroups }
}

export async function getOwnerStore() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  let { data: store } = await supabase.from("stores").select("*").eq("owner_id", user.id).maybeSingle()
  if (!store) {
    const storeName = String(user.user_metadata?.store_name ?? "Minha loja").trim() || "Minha loja"
    const slugBase = storeName.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "minha-loja"
    const { data: created, error } = await supabase.from("stores").insert({
      owner_id: user.id,
      slug: `${slugBase}-${user.id.slice(0, 6)}`,
      name: storeName,
      tagline: "",
      description: "",
      logo: "",
      cover_image: "",
      whatsapp: "",
      instagram: null,
      theme: "premium",
      theme_overrides: null,
      min_order: 0,
      delivery_min_minutes: 30,
      delivery_max_minutes: 45,
      rating: 0,
      reviews_count: 0,
    }).select("*").single()
    if (error || !created) return null
    store = created
  }
  const [{ data: hours }, { data: categories }, { data: products }, { data: subscription }] = await Promise.all([
    supabase.from("store_hours").select("*").eq("store_id", store.id).order("day_of_week"),
    supabase.from("categories").select("*").eq("store_id", store.id).order("position"),
    supabase.from("products").select("*").eq("store_id", store.id).order("created_at"),
    supabase.from("owner_subscription_view").select("*").eq("store_id", store.id).maybeSingle(),
  ])
  let categoryRows = categories ?? []
  if (categoryRows.length === 0) {
    const { data: defaultCategory } = await supabase.from("categories").insert({
      id: crypto.randomUUID(), store_id: store.id, name: "Cardápio", position: 0,
    }).select("*").single()
    if (defaultCategory) categoryRows = [defaultCategory]
  }
  return {
    store: mapStore(store, (hours ?? []).map((hour) => ({ day: dayNames[hour.day_of_week], open: hour.open_time ?? "", close: hour.close_time ?? "", closed: hour.is_closed }))),
    categories: categoryRows.map(mapCategory),
    products: (products ?? []).map((product) => mapProduct(product)),
    subscription: subscription ? mapSubscription(subscription) : null,
  }
}

export function storeRowFromStore(store: Store, ownerId: string) {
  return { owner_id: ownerId, slug: store.slug, name: store.name, tagline: store.tagline, description: store.description, logo: store.logo, cover_image: store.coverImage, whatsapp: store.whatsapp, instagram: store.instagram ?? null, theme: store.theme, theme_overrides: store.themeOverrides ?? null, min_order: store.minOrder, delivery_min_minutes: store.deliveryTimeMinutes[0], delivery_max_minutes: store.deliveryTimeMinutes[1], rating: store.rating, reviews_count: store.reviewsCount, note_label: store.noteLabel ?? null, note_placeholder: store.notePlaceholder ?? null, delivery_fee: store.deliveryFee ?? 0 }
}

export function formatHours(hours: StoreHours[]) { return hours.map((hour, index) => ({ day_of_week: index, open_time: hour.open || null, close_time: hour.close || null, is_closed: Boolean(hour.closed) })) }
