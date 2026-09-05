import { createClient } from "@/lib/supabase/server"
import { mapCategory, mapProduct, mapStore } from "@/lib/supabase/data"

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export async function getPublicStore(slug: string) {
  const supabase = await createClient()
  const { data: locked } = await supabase.rpc("is_store_locked", { p_slug: slug })
  if (locked) return { unavailable: true as const }
  const { data: store } = await supabase.from("stores").select("*").eq("slug", slug).maybeSingle()
  if (!store) return null
  const [{ data: hours }, { data: categories }, { data: products }] = await Promise.all([
    supabase.from("store_hours").select("*").eq("store_id", store.id).order("day_of_week"),
    supabase.from("categories").select("*").eq("store_id", store.id).order("position"),
    supabase.from("products").select("*").eq("store_id", store.id).order("created_at"),
  ])
  const [{ data: groups }, { data: addons }] = await Promise.all([
    supabase.from("addon_groups").select("*").in("product_id", (products ?? []).map((product) => product.id)),
    supabase.from("addons").select("*").order("position"),
  ])
  return {
    store: mapStore(store, (hours ?? []).map((hour) => ({ day: dayNames[hour.day_of_week], open: hour.open_time ?? "", close: hour.close_time ?? "", closed: hour.is_closed }))),
    categories: (categories ?? []).map(mapCategory),
    products: (products ?? []).map((product) => mapProduct(product, groups ?? [], addons ?? [])),
  }
}

// Chamar uma única vez por acesso real à página (não em generateMetadata,
// que roda em paralelo e contaria a mesma visita duas vezes).
export async function recordStoreView(slug: string) {
  try {
    const supabase = await createClient()
    await supabase.rpc("record_store_view", { p_slug: slug })
  } catch (error) {
    console.error("Falha ao registrar visualização da vitrine", error)
  }
}
